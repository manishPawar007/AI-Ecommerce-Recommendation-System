from pydantic import BaseModel, EmailStr
from typing import Optional


# ==========================
# User Schemas
# ==========================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# ==========================
# Product Schemas
# ==========================

class ProductBase(BaseModel):
    description: str
    category: str
    price: float
    stock: int
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


# ==========================
# Cart Schemas
# ==========================

class CartCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int = 1


class CartResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True


# ==========================
# Order Schemas
# ==========================

class OrderCreate(BaseModel):
    user_id: int
    total_amount: float


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ==========================
# Order Item Schemas
# ==========================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True