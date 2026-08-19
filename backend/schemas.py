from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict


# =====================================================
# USER SCHEMAS
# =====================================================

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: str
    profile_image: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# CATEGORY SCHEMAS
# =====================================================

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# PRODUCT SCHEMAS
# =====================================================

class ProductBase(BaseModel):
    category_id: int
    name: str
    description: str
    brand: Optional[str] = None
    sku: Optional[str] = None
    price: float
    discount: float = 0
    stock: int
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    discount: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    rating: float
    total_reviews: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    # =====================================================
# CART SCHEMAS
# =====================================================

class CartBase(BaseModel):
    product_id: int
    quantity: int = 1


class CartCreate(CartBase):
    user_id: int


class CartUpdate(BaseModel):
    quantity: int


class CartResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# WISHLIST SCHEMAS
# =====================================================

class WishlistCreate(BaseModel):
    user_id: int
    product_id: int


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# ORDER ITEM SCHEMAS
# =====================================================

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# ORDER SCHEMAS
# =====================================================

class OrderBase(BaseModel):

    payment_method: str = "COD"

    customer_name: str

    customer_email: EmailStr

    customer_phone: Optional[str] = None

    shipping_address: str

    city: Optional[str] = None

    state: Optional[str] = None

    country: str = "India"

    pincode: Optional[str] = None


class OrderCreate(OrderBase):

    user_id: int

    total_amount: float

    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):

    status: Optional[str] = None

    payment_status: Optional[str] = None

    tracking_number: Optional[str] = None


class OrderResponse(OrderBase):

    id: int

    order_number: str

    total_amount: float

    discount: float

    shipping_charge: float

    tax: float

    payment_status: str

    status: str

    tracking_number: Optional[str]

    created_at: datetime

    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# REVIEW SCHEMAS
# =====================================================

class ReviewCreate(BaseModel):

    user_id: int

    product_id: int

    rating: int

    comment: Optional[str] = None


class ReviewUpdate(BaseModel):

    rating: Optional[int] = None

    comment: Optional[str] = None


class ReviewResponse(BaseModel):

    id: int

    user_id: int

    product_id: int

    rating: int

    comment: Optional[str]

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# COUPON SCHEMAS
# =====================================================

class CouponCreate(BaseModel):

    code: str

    description: Optional[str] = None

    discount: float

    minimum_order: float = 0

    max_discount: float = 0

    usage_limit: int = 0

    expiry_date: Optional[datetime] = None


class CouponUpdate(BaseModel):

    description: Optional[str] = None

    discount: Optional[float] = None

    minimum_order: Optional[float] = None

    max_discount: Optional[float] = None

    usage_limit: Optional[int] = None

    expiry_date: Optional[datetime] = None

    is_active: Optional[bool] = None


class CouponResponse(BaseModel):

    id: int

    code: str

    description: Optional[str]

    discount: float

    minimum_order: float

    max_discount: float

    usage_limit: int

    used_count: int

    expiry_date: Optional[datetime]

    is_active: bool

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    # =====================================================
# STORE SETTINGS SCHEMAS
# =====================================================

class StoreSettingsBase(BaseModel):

    store_name: str

    store_email: Optional[EmailStr] = None

    store_phone: Optional[str] = None

    store_address: Optional[str] = None

    logo: Optional[str] = None

    currency: str = "INR"

    tax_percentage: float = 18

    shipping_charge: float = 0

    free_shipping_limit: float = 999

    smtp_host: Optional[str] = None

    smtp_port: int = 587

    smtp_email: Optional[str] = None

    smtp_password: Optional[str] = None

    payment_gateway: str = "Razorpay"

    maintenance_mode: bool = False

    allow_registration: bool = True


class StoreSettingsUpdate(StoreSettingsBase):
    pass


class StoreSettingsResponse(StoreSettingsBase):

    id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# PRODUCT GALLERY SCHEMAS
# =====================================================

class ProductGalleryCreate(BaseModel):

    product_id: int

    image_url: str


class ProductGalleryResponse(BaseModel):

    id: int

    product_id: int

    image_url: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# NOTIFICATION SCHEMAS
# =====================================================

class NotificationCreate(BaseModel):

    title: str

    message: str

    notification_type: str = "info"


class NotificationUpdate(BaseModel):

    is_read: bool


class NotificationResponse(BaseModel):

    id: int

    title: str

    message: str

    notification_type: str

    is_read: bool

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# API KEY SCHEMAS
# =====================================================

class APIKeyCreate(BaseModel):

    name: str


class APIKeyResponse(BaseModel):

    id: int

    name: str

    public_key: str

    secret_key: str

    is_active: bool

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# AUDIT LOG SCHEMAS
# =====================================================

class AuditLogResponse(BaseModel):

    id: int

    admin_name: str

    action: str

    module: str

    ip_address: Optional[str]

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# BACKUP HISTORY SCHEMAS
# =====================================================

class BackupHistoryResponse(BaseModel):

    id: int

    file_name: str

    file_size: float

    backup_type: str

    status: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# PRODUCT ANALYTICS SCHEMAS
# =====================================================

class ProductAnalyticsResponse(BaseModel):

    id: int

    product_id: int

    views: int

    wishlist_count: int

    purchases: int

    revenue: float

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# DASHBOARD SCHEMAS
# =====================================================

class DashboardSummary(BaseModel):

    total_products: int

    total_categories: int

    total_customers: int

    total_orders: int

    total_revenue: float

    pending_orders: int

    low_stock_products: int


class SalesAnalytics(BaseModel):

    month: str

    revenue: float

    orders: int


class CategoryAnalytics(BaseModel):

    category: str

    total_sales: float


class TopProductAnalytics(BaseModel):

    product_name: str

    total_sales: int

    revenue: float


# =====================================================
# GENERIC RESPONSE SCHEMA
# =====================================================

class MessageResponse(BaseModel):

    success: bool = True

    message: str


# =====================================================
# PAGINATION SCHEMA
# =====================================================

class PaginationResponse(BaseModel):

    page: int

    limit: int

    total_records: int

    total_pages: int


# =====================================================
# FILE UPLOAD RESPONSE
# =====================================================

class UploadResponse(BaseModel):

    filename: str

    file_url: str

    message: str


# =====================================================
# TOKEN SCHEMAS
# =====================================================

class Token(BaseModel):

    access_token: str

    token_type: str = "bearer"


class TokenData(BaseModel):

    email: Optional[str] = None

    role: Optional[str] = None