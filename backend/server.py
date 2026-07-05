from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- Constants ----------
JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

def now_utc():
    return datetime.now(timezone.utc).isoformat()

# ---------- Password / Token ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ---------- FastAPI ----------
app = FastAPI()
api = APIRouter(prefix="/api")

# ---------- Auth helpers ----------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(401, "User not found")
    user.pop("_id", None)
    user.pop("password_hash", None)
    return user

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user

async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

def set_auth_cookie(resp: Response, token: str):
    resp.set_cookie("access_token", token, httponly=True, secure=False, samesite="lax",
                    max_age=7*24*3600, path="/")

# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProductIn(BaseModel):
    name: str
    slug: Optional[str] = None
    category: str  # 'hamper' or 'bouquet'
    occasion: List[str] = []
    price: float
    discount_price: Optional[float] = None
    images: List[str] = []
    description: str = ""
    stock: int = 100
    tags: List[str] = []
    featured: bool = False
    best_seller: bool = False
    new_arrival: bool = False
    sku: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    variant: Optional[str] = None

class Address(BaseModel):
    full_name: str
    phone: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    country: str = "India"

class OrderIn(BaseModel):
    items: List[CartItem]
    address: Address
    payment_method: str = "mock"
    coupon_code: Optional[str] = None
    gift_wrap: bool = False
    delivery_instructions: Optional[str] = ""

class CustomOrderIn(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    delivery_city: str
    delivery_date: str
    budget: float
    occasion: str
    description: str
    notes: Optional[str] = ""
    reference_images: List[str] = []  # base64 data URIs

class QuotationIn(BaseModel):
    quoted_price: float
    delivery_estimate: str
    admin_notes: Optional[str] = ""

class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str

class CouponIn(BaseModel):
    code: str
    discount_percent: float
    active: bool = True
    expires_at: Optional[str] = None

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: str
    message: str

class NewsletterIn(BaseModel):
    email: EmailStr

class PincodeIn(BaseModel):
    pincode: str

# ---------- Auth Routes ----------
@api.post("/auth/register")
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": "customer",
        "created_at": now_utc(),
        "addresses": [],
        "wishlist": [],
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], email, "customer")
    set_auth_cookie(response, token)
    return {"id": user["id"], "email": email, "name": data.name, "role": "customer", "token": token}

@api.post("/auth/login")
async def login(data: LoginIn, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token(user["id"], email, user["role"])
    set_auth_cookie(response, token)
    return {"id": user["id"], "email": email, "name": user["name"], "role": user["role"], "token": token}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}

# ---------- Products ----------
def _clean(doc):
    if not doc: return doc
    doc.pop("_id", None)
    return doc

@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    occasion: Optional[str] = None,
    featured: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "newest",
    limit: int = 100,
):
    query: dict = {}
    if category: query["category"] = category
    if occasion: query["occasion"] = occasion
    if featured is not None: query["featured"] = featured
    if best_seller is not None: query["best_seller"] = best_seller
    if new_arrival is not None: query["new_arrival"] = new_arrival
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    sort_map = {
        "newest": [("created_at", -1)],
        "price_low": [("price", 1)],
        "price_high": [("price", -1)],
        "best_selling": [("best_seller", -1), ("created_at", -1)],
    }
    cursor = db.products.find(query).sort(sort_map.get(sort, sort_map["newest"])).limit(limit)
    return [_clean(p) async for p in cursor]

@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug})
    if not p:
        p = await db.products.find_one({"id": slug})
    if not p:
        raise HTTPException(404, "Product not found")
    return _clean(p)

@api.post("/products")
async def create_product(data: ProductIn, admin: dict = Depends(require_admin)):
    slug = data.slug or data.name.lower().replace(" ", "-").replace("&", "and")
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = slug
    doc["created_at"] = now_utc()
    doc["sku"] = doc.get("sku") or f"SKU-{doc['id'][:8].upper()}"
    await db.products.insert_one(doc)
    return _clean(doc)

@api.put("/products/{pid}")
async def update_product(pid: str, data: ProductIn, admin: dict = Depends(require_admin)):
    upd = data.model_dump()
    upd["slug"] = upd.get("slug") or upd["name"].lower().replace(" ", "-")
    r = await db.products.update_one({"id": pid}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    p = await db.products.find_one({"id": pid})
    return _clean(p)

@api.delete("/products/{pid}")
async def delete_product(pid: str, admin: dict = Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}

# ---------- Categories / Occasions ----------
OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Corporate", "Baby Shower",
             "Festivals", "Valentine's Day", "Mother's Day", "Father's Day", "Congratulations"]

@api.get("/occasions")
async def occasions():
    return OCCASIONS

# ---------- Orders ----------
async def _price_items(items: List[CartItem]):
    total = 0.0
    detailed = []
    for it in items:
        p = await db.products.find_one({"id": it.product_id})
        if not p:
            raise HTTPException(400, f"Product {it.product_id} not found")
        price = p.get("discount_price") or p["price"]
        subtotal = price * it.quantity
        total += subtotal
        detailed.append({
            "product_id": p["id"], "name": p["name"], "price": price,
            "quantity": it.quantity, "image": (p.get("images") or [""])[0],
            "variant": it.variant,
        })
    return detailed, total

@api.post("/orders")
async def create_order(data: OrderIn, user: dict = Depends(get_current_user)):
    detailed, subtotal = await _price_items(data.items)
    discount = 0.0
    coupon_code = None
    if data.coupon_code:
        c = await db.coupons.find_one({"code": data.coupon_code.upper(), "active": True})
        if c:
            discount = subtotal * (c["discount_percent"] / 100)
            coupon_code = c["code"]
    gift_wrap_fee = 49.0 if data.gift_wrap else 0.0
    delivery_fee = 0.0 if subtotal >= 999 else 49.0
    total = subtotal - discount + gift_wrap_fee + delivery_fee
    order = {
        "id": str(uuid.uuid4()),
        "order_no": f"HS{int(datetime.now().timestamp())}",
        "user_id": user["id"],
        "user_email": user["email"],
        "items": detailed,
        "address": data.address.model_dump(),
        "subtotal": subtotal, "discount": discount, "gift_wrap": data.gift_wrap,
        "gift_wrap_fee": gift_wrap_fee, "delivery_fee": delivery_fee, "total": total,
        "coupon_code": coupon_code,
        "payment_method": data.payment_method,
        "payment_status": "paid",  # MOCKED
        "status": "confirmed",
        "delivery_instructions": data.delivery_instructions,
        "created_at": now_utc(),
    }
    await db.orders.insert_one(order)
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()), "user_id": user["id"], "type": "order_confirmed",
        "message": f"Order {order['order_no']} confirmed", "read": False, "created_at": now_utc(),
    })
    return _clean(order)

@api.get("/orders/mine")
async def my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [_clean(o) for o in orders]

@api.get("/orders/{oid}")
async def get_order(oid: str, user: dict = Depends(get_current_user)):
    o = await db.orders.find_one({"id": oid})
    if not o:
        raise HTTPException(404, "Not found")
    if user["role"] != "admin" and o["user_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    return _clean(o)

@api.get("/admin/orders")
async def admin_orders(admin: dict = Depends(require_admin)):
    orders = await db.orders.find({}).sort("created_at", -1).to_list(500)
    return [_clean(o) for o in orders]

@api.put("/admin/orders/{oid}/status")
async def update_order_status(oid: str, status: str = Query(...), admin: dict = Depends(require_admin)):
    if status not in ["confirmed", "processing", "shipped", "delivered", "cancelled"]:
        raise HTTPException(400, "Invalid status")
    await db.orders.update_one({"id": oid}, {"$set": {"status": status}})
    return {"ok": True}

# ---------- Custom Orders ----------
@api.post("/custom-orders")
async def create_custom_order(data: CustomOrderIn, user: Optional[dict] = Depends(get_optional_user)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["ticket_no"] = f"CO{int(datetime.now().timestamp())}"
    doc["user_id"] = user["id"] if user else None
    doc["status"] = "pending"  # pending -> approved / rejected -> quoted -> paid
    doc["quotation"] = None
    doc["admin_notes"] = ""
    doc["created_at"] = now_utc()
    await db.custom_orders.insert_one(doc)
    return _clean(doc)

@api.get("/custom-orders/mine")
async def my_custom_orders(user: dict = Depends(get_current_user)):
    docs = await db.custom_orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [_clean(d) for d in docs]

@api.get("/admin/custom-orders")
async def admin_custom_orders(admin: dict = Depends(require_admin)):
    docs = await db.custom_orders.find({}).sort("created_at", -1).to_list(500)
    return [_clean(d) for d in docs]

@api.put("/admin/custom-orders/{cid}/quote")
async def send_quotation(cid: str, data: QuotationIn, admin: dict = Depends(require_admin)):
    r = await db.custom_orders.update_one({"id": cid}, {"$set": {
        "quotation": data.model_dump(),
        "status": "quoted",
        "admin_notes": data.admin_notes or "",
    }})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}

@api.put("/admin/custom-orders/{cid}/status")
async def update_custom_status(cid: str, status: str = Query(...), admin: dict = Depends(require_admin)):
    if status not in ["pending", "approved", "rejected", "quoted", "paid", "completed"]:
        raise HTTPException(400, "Invalid status")
    await db.custom_orders.update_one({"id": cid}, {"$set": {"status": status}})
    return {"ok": True}

@api.post("/custom-orders/{cid}/accept-quote")
async def accept_quote(cid: str, user: dict = Depends(get_current_user)):
    co = await db.custom_orders.find_one({"id": cid})
    if not co:
        raise HTTPException(404, "Not found")
    if co.get("user_id") and co["user_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    if co["status"] != "quoted":
        raise HTTPException(400, "Not in quoted state")
    await db.custom_orders.update_one({"id": cid}, {"$set": {"status": "paid", "advance_paid_at": now_utc()}})
    return {"ok": True}

# ---------- Wishlist ----------
class WishlistIn(BaseModel):
    product_id: str

@api.post("/wishlist")
async def add_wishlist(data: WishlistIn, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"wishlist": data.product_id}})
    return {"ok": True}

@api.delete("/wishlist/{pid}")
async def remove_wishlist(pid: str, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$pull": {"wishlist": pid}})
    return {"ok": True}

@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]})
    ids = u.get("wishlist", []) if u else []
    prods = await db.products.find({"id": {"$in": ids}}).to_list(200)
    return [_clean(p) for p in prods]

# ---------- Reviews ----------
@api.post("/products/{pid}/reviews")
async def add_review(pid: str, data: ReviewIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()), "product_id": pid, "user_id": user["id"],
        "user_name": user["name"], "rating": data.rating, "comment": data.comment,
        "created_at": now_utc(),
    }
    await db.reviews.insert_one(doc)
    return _clean(doc)

@api.get("/products/{pid}/reviews")
async def get_reviews(pid: str):
    docs = await db.reviews.find({"product_id": pid}).sort("created_at", -1).to_list(200)
    return [_clean(d) for d in docs]

# ---------- Coupons ----------
@api.get("/coupons/{code}")
async def validate_coupon(code: str):
    c = await db.coupons.find_one({"code": code.upper(), "active": True})
    if not c:
        raise HTTPException(404, "Invalid coupon")
    return _clean(c)

@api.get("/admin/coupons")
async def list_coupons(admin: dict = Depends(require_admin)):
    docs = await db.coupons.find({}).to_list(200)
    return [_clean(d) for d in docs]

@api.post("/admin/coupons")
async def create_coupon(data: CouponIn, admin: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["code"] = doc["code"].upper()
    doc["created_at"] = now_utc()
    await db.coupons.insert_one(doc)
    return _clean(doc)

@api.delete("/admin/coupons/{cid}")
async def delete_coupon(cid: str, admin: dict = Depends(require_admin)):
    await db.coupons.delete_one({"id": cid})
    return {"ok": True}

# ---------- Contact / Newsletter ----------
@api.post("/contact")
async def contact(data: ContactIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_utc()
    await db.contacts.insert_one(doc)
    return {"ok": True}

@api.post("/newsletter")
async def newsletter(data: NewsletterIn):
    await db.newsletter.update_one(
        {"email": data.email.lower()},
        {"$set": {"email": data.email.lower(), "created_at": now_utc()}},
        upsert=True
    )
    return {"ok": True}

# ---------- Pincode ----------
@api.post("/pincode/check")
async def check_pincode(data: PincodeIn):
    # MOCK: even pincodes not deliverable, odd deliverable
    try:
        n = int(data.pincode)
        ok = len(data.pincode) == 6
    except Exception:
        ok = False
    return {
        "pincode": data.pincode,
        "deliverable": ok,
        "estimated_days": "2-4 business days" if ok else None,
        "cod_available": ok,
    }

# ---------- Admin stats ----------
@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    orders = await db.orders.find({}).to_list(1000)
    revenue = sum(o.get("total", 0) for o in orders)
    return {
        "orders": len(orders),
        "revenue": revenue,
        "customers": await db.users.count_documents({"role": "customer"}),
        "products": await db.products.count_documents({}),
        "custom_orders": await db.custom_orders.count_documents({}),
        "pending_custom": await db.custom_orders.count_documents({"status": "pending"}),
        "low_stock": await db.products.count_documents({"stock": {"$lt": 5}}),
    }

@api.get("/admin/customers")
async def admin_customers(admin: dict = Depends(require_admin)):
    users = await db.users.find({"role": "customer"}).sort("created_at", -1).to_list(500)
    return [{"id": u["id"], "email": u["email"], "name": u["name"], "created_at": u["created_at"]}
            for u in users]

# ---------- Register router ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Startup: seed admin + products ----------
SAMPLE_PRODUCTS = [
    {"name": "Golden Radiance Hamper", "category": "hamper", "occasion": ["Birthday", "Anniversary"],
     "price": 3499, "discount_price": 2999,
     "images": ["https://images.pexels.com/photos/20699855/pexels-photo-20699855.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
                "https://images.unsplash.com/photo-1674620213535-9b2a2553ef40?auto=format&fit=crop&w=1000&q=80"],
     "description": "A curated selection of Belgian chocolates, artisanal cookies, and premium dry fruits presented in a signature gold-accented box.",
     "stock": 30, "tags": ["chocolate", "premium", "luxury"], "featured": True, "best_seller": True, "new_arrival": False},
    {"name": "Rose Whisper Bouquet", "category": "bouquet", "occasion": ["Valentine's Day", "Anniversary"],
     "price": 2199,
     "images": ["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=80"],
     "description": "Twenty-four hand-picked red roses wrapped in ivory silk with a satin bow.",
     "stock": 50, "tags": ["roses", "romance"], "featured": True, "best_seller": True, "new_arrival": True},
    {"name": "Corporate Elegance Box", "category": "hamper", "occasion": ["Corporate", "Congratulations"],
     "price": 4999,
     "images": ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1000&q=80"],
     "description": "A sophisticated corporate gifting box with fine tea, gourmet biscuits, and a leather journal.",
     "stock": 20, "tags": ["corporate", "premium"], "featured": True, "best_seller": False, "new_arrival": True},
    {"name": "Peony Dreams Bouquet", "category": "bouquet", "occasion": ["Wedding", "Mother's Day"],
     "price": 3299,
     "images": ["https://images.unsplash.com/photo-1782038522691-7faf943aa95e?auto=format&fit=crop&w=1000&q=80"],
     "description": "Blush pink peonies and white lisianthus arranged in a hand-tied bouquet.",
     "stock": 25, "tags": ["peonies", "wedding"], "featured": True, "best_seller": True, "new_arrival": True},
    {"name": "Baby Bliss Hamper", "category": "hamper", "occasion": ["Baby Shower"],
     "price": 2799,
     "images": ["https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=80"],
     "description": "A tender collection for new parents — organic cotton onesie, plush toy, and lullaby book.",
     "stock": 15, "tags": ["baby", "newborn"], "featured": False, "best_seller": False, "new_arrival": True},
    {"name": "Festive Celebration Hamper", "category": "hamper", "occasion": ["Festivals", "Congratulations"],
     "price": 3899,
     "images": ["https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1000&q=80"],
     "description": "Traditional Indian sweets, dry fruits, and hand-painted diyas in a keepsake box.",
     "stock": 40, "tags": ["diwali", "festival"], "featured": True, "best_seller": True, "new_arrival": False},
    {"name": "Sunshine Tulip Bouquet", "category": "bouquet", "occasion": ["Birthday", "Mother's Day"],
     "price": 1799,
     "images": ["https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=80"],
     "description": "Bright yellow tulips wrapped in kraft paper — a burst of sunshine.",
     "stock": 60, "tags": ["tulips", "cheerful"], "featured": False, "best_seller": True, "new_arrival": False},
    {"name": "Midnight Truffle Hamper", "category": "hamper", "occasion": ["Anniversary", "Valentine's Day"],
     "price": 4499, "discount_price": 3999,
     "images": ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1000&q=80"],
     "description": "Dark chocolate truffles, single-origin coffee, and a candle set in matte black packaging.",
     "stock": 18, "tags": ["chocolate", "luxury"], "featured": True, "best_seller": False, "new_arrival": True},
]

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("category")
    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            await db.users.insert_one({
                "id": str(uuid.uuid4()), "email": admin_email, "name": "Admin",
                "password_hash": hash_password(admin_password), "role": "admin",
                "created_at": now_utc(), "addresses": [], "wishlist": [],
            })
        elif not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email},
                                      {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})
    # seed products (only if none)
    count = await db.products.count_documents({})
    if count == 0:
        for p in SAMPLE_PRODUCTS:
            slug = p["name"].lower().replace(" ", "-").replace("'", "").replace(",", "")
            doc = {**p, "id": str(uuid.uuid4()), "slug": slug, "created_at": now_utc(),
                   "sku": f"SKU-{uuid.uuid4().hex[:8].upper()}"}
            await db.products.insert_one(doc)
    # seed coupon
    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_one({
            "id": str(uuid.uuid4()), "code": "WELCOME10", "discount_percent": 10.0,
            "active": True, "created_at": now_utc(),
        })
    logger.info("Startup complete")

@app.on_event("shutdown")
async def on_shutdown():
    client.close()

@api.get("/")
async def root():
    return {"message": "HamperStore API"}
