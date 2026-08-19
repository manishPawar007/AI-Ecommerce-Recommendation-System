# FastAPI Application - Live AI Recommendation Engine v4.0 Active
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from pathlib import Path

import pandas as pd

from database import engine, SessionLocal
from models import Base, User, Product, Category
from auth import hash_password

from routers.auth import router as auth_router
from routers.products import router as product_router
from routers.cart import router as cart_router
from routers.wishlist import router as wishlist_router
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

ensure_user_created_at_column()

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

# Static Uploads directory
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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
app.include_router(wishlist_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(recommendation_router, prefix="/api")
app.include_router(admin_router, prefix="/api")