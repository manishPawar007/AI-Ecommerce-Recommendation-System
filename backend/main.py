from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

import os
import pandas as pd

from database import engine, SessionLocal
from models import Base, User, Product, Category
from auth import hash_password

from routers.auth import router as auth_router
from routers.products import router as product_router
from routers.cart import router as cart_router
from routers.orders import router as order_router
from routers.analytics import router as analytics_router
from routers.recommendations import router as recommendation_router
from routers.admin import router as admin_router

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Ensure required schema columns exist in the database
def ensure_user_created_at_column():
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        if "created_at" not in columns:
            default_type = "DATETIME DEFAULT CURRENT_TIMESTAMP"
            if engine.dialect.name == "postgresql":
                default_type = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            with engine.begin() as conn:
                conn.execute(
                    text(
                        f"ALTER TABLE users ADD COLUMN created_at {default_type}"
                    )
                )
                conn.execute(
                    text(
                        "UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"
                    )
                )
    if "coupons" in inspector.get_table_names():
        c_cols = [col["name"] for col in inspector.get_columns("coupons")]
        with engine.begin() as conn:
            if "max_discount" not in c_cols:
                conn.execute(text("ALTER TABLE coupons ADD COLUMN max_discount FLOAT DEFAULT 0.0"))
            if "minimum_order" not in c_cols:
                conn.execute(text("ALTER TABLE coupons ADD COLUMN minimum_order FLOAT DEFAULT 0.0"))
            if "discount" not in c_cols:
                conn.execute(text("ALTER TABLE coupons ADD COLUMN discount FLOAT DEFAULT 10.0"))
            if "expiry_date" not in c_cols:
                conn.execute(text("ALTER TABLE coupons ADD COLUMN expiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))

ensure_user_created_at_column()


def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed Admin user (Manish Admin)
        admin = db.query(User).filter(User.email == "manish07@gmail.com").first()
        if not admin:
            admin = User(
                name="Manish Admin",
                email="manish07@gmail.com",
                password=hash_password("manish1234"),
                role="admin"
            )
            db.add(admin)
        else:
            admin.role = "admin"
            admin.password = hash_password("manish1234")

        # Seed Demo Customer user
        customer = db.query(User).filter(User.email == "customer@gadgetworld.com").first()
        if not customer:
            customer = User(
                name="Demo Customer",
                email="customer@gadgetworld.com",
                password=hash_password("customer123"),
                role="customer"
            )
            db.add(customer)

        # Seed Categories (matching 4 core product dataset categories)
        category_names = ["Mobiles", "Laptops", "Smart Watches", "Headphones"]
        for cat_name in category_names:
            cat = db.query(Category).filter(Category.name == cat_name).first()
            if not cat:
                db.add(Category(name=cat_name, description=f"Premium {cat_name} collection"))

        # Seed Products if empty
        if db.query(Product).count() == 0:
            dataset_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "amazon_flipkart_products_1000.csv")
            if os.path.exists(dataset_path):
                df = pd.read_csv(dataset_path, encoding="latin1")
                for _, row in df.iterrows():
                    p_id = int(row["id"]) if "id" in row and not pd.isna(row["id"]) else None
                    product = Product(
                        id=p_id,
                        description=str(row.get("description", "Product")),
                        category=str(row.get("category", "General")),
                        price=float(row.get("price", 999)),
                        stock=int(row.get("stock", 50)),
                        image_url=str(row.get("image_url", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"))
                    )
                    db.add(product)

        # Seed Coupons
        from models import Coupon
        coupons = [
            {
                "code": "WELCOME10",
                "description": "Welcome Offer - 10% Off on all tech products",
                "discount": 10.0,
                "minimum_order": 1000.0,
                "max_discount": 2500.0,
                "usage_limit": 500
            },
            {
                "code": "GADGET20",
                "description": "Super Tech Sale - 20% Off on orders above ₹5,000",
                "discount": 20.0,
                "minimum_order": 5000.0,
                "max_discount": 5000.0,
                "usage_limit": 250
            },
            {
                "code": "FESTIVE500",
                "description": "Festive Special - Flat ₹500 Off on orders above ₹2,000",
                "discount": 500.0,
                "minimum_order": 2000.0,
                "max_discount": 500.0,
                "usage_limit": 1000
            }
        ]

        for c_data in coupons:
            cp = db.query(Coupon).filter(Coupon.code == c_data["code"]).first()
            if not cp:
                db.add(Coupon(
                    code=c_data["code"],
                    description=c_data["description"],
                    discount=c_data["discount"],
                    minimum_order=c_data["minimum_order"],
                    max_discount=c_data["max_discount"],
                    usage_limit=c_data["usage_limit"],
                    used_count=0,
                    is_active=True
                ))

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

seed_initial_data()

app = FastAPI(
    title="AI Ecommerce API",
    version="1.0.0",
    description="AI Powered Ecommerce Platform with Admin Panel",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root
@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully",
        "application": "AI Ecommerce API",
        "version": "1.0.0",
        "status": "Running"
    }

# Health
@app.get("/health")
def health():
    return {
        "success": True,
        "status": "Healthy"
    }

# Info
@app.get("/info")
def info():
    return {
        "application": "AI Ecommerce API",
        "version": "1.0.0"
    }

# Routers
app.include_router(auth_router, prefix="/api")
app.include_router(product_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(recommendation_router, prefix="/api")
app.include_router(recommendation_router)
app.include_router(admin_router, prefix="/api")