from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

from routers.auth import router as auth_router
from routers.products import router as product_router
from routers.cart import router as cart_router
from routers.orders import router as order_router
from routers.analytics import router as analytics_router
from routers.recommendations import router as recommendation_router


# Create Tables
Base.metadata.create_all(bind=engine)


# FastAPI App
app = FastAPI(
    title="AI Ecommerce API",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Home Route
@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }


# Routers
app.include_router(
    auth_router,
    tags=["Authentication"]
)

app.include_router(
    product_router,
    tags=["Products"]
)

app.include_router(
    cart_router,
    tags=["Cart"]
)

app.include_router(
    order_router,
    tags=["Orders"]
)

app.include_router(
    analytics_router,
    tags=["Analytics"]
)

app.include_router(
    recommendation_router,
    tags=["Recommendations"]
)