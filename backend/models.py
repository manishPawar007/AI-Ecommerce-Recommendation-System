from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint
)

from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from datetime import datetime

from database import Base


# =====================================================
# USER MODEL
# =====================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(20),
        default="customer",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    orders = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    carts = relationship(
        "Cart",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    wishlist = relationship(
        "Wishlist",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# =====================================================
# CATEGORY MODEL
# =====================================================

class Category(Base):

    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(120),
        unique=True,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    image = Column(
        String(255),
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # =====================================================
# PRODUCT MODEL
# =====================================================

class Product(Base):

    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    description = Column(
        String(500),
        nullable=False,
        index=True
    )

    category = Column(
        String(120),
        nullable=True,
        index=True
    )

    price = Column(
        Float,
        nullable=False
    )

    stock = Column(
        Integer,
        default=0
    )

    image_url = Column(
        String(500),
        nullable=True
    )

    carts = relationship(
        "Cart",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    wishlist = relationship(
        "Wishlist",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    order_items = relationship(
        "OrderItem",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    reviews = relationship(
        "Review",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    @hybrid_property
    def product_name(self):
        return self.description

    @product_name.expression
    def product_name(cls):
        return cls.description

    @hybrid_property
    def name(self):
        return self.description

    @name.expression
    def name(cls):
        return cls.description


# =====================================================
# CART MODEL
# =====================================================

class Cart(Base):

    __tablename__ = "cart"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        default=1,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="carts"
    )

    product = relationship(
        "Product",
        back_populates="carts"
    )


# =====================================================
# WISHLIST MODEL
# =====================================================

class Wishlist(Base):

    __tablename__ = "wishlist"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="wishlist"
    )

    product = relationship(
        "Product",
        back_populates="wishlist"
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="unique_wishlist_item"
        ),
    )
    # =====================================================
# ORDER MODEL
# =====================================================

class Order(Base):

    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0
    )

    status = Column(
        String(50),
        default="Placed"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="orders"
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )

    @hybrid_property
    def order_number(self):
        return f"ORD-{self.id}"

    @order_number.expression
    def order_number(cls):
        return cls.id


# =====================================================
# ORDER ITEM MODEL
# =====================================================

class OrderItem(Base):

    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        default=1
    )

    price = Column(
        Float,
        nullable=False
    )

    order = relationship(
        "Order",
        back_populates="items"
    )

    product = relationship(
        "Product",
        back_populates="order_items"
    )
    # =====================================================
# REVIEW MODEL
# =====================================================

class Review(Base):

    __tablename__ = "reviews"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    rating = Column(
        Integer,
        nullable=False
    )

    comment = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="reviews"
    )

    product = relationship(
        "Product",
        back_populates="reviews"
    )


# =====================================================
# COUPON MODEL
# =====================================================

class Coupon(Base):

    __tablename__ = "coupons"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    code = Column(
        String(50),
        unique=True,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    discount = Column(
        Float,
        default=0
    )

    minimum_order = Column(
        Float,
        default=0
    )

    max_discount = Column(
        Float,
        default=0
    )

    usage_limit = Column(
        Integer,
        default=0
    )

    used_count = Column(
        Integer,
        default=0
    )

    expiry_date = Column(
        DateTime,
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =====================================================
# STORE SETTINGS MODEL
# =====================================================

class StoreSettings(Base):

    __tablename__ = "store_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    store_name = Column(
        String(150),
        default="AI Ecommerce"
    )

    store_email = Column(
        String(150),
        nullable=True
    )

    store_phone = Column(
        String(20),
        nullable=True
    )

    store_address = Column(
        Text,
        nullable=True
    )

    logo = Column(
        String(300),
        nullable=True
    )

    currency = Column(
        String(20),
        default="INR"
    )

    tax_percentage = Column(
        Float,
        default=18
    )

    shipping_charge = Column(
        Float,
        default=0
    )

    free_shipping_limit = Column(
        Float,
        default=999
    )

    smtp_host = Column(
        String(150),
        nullable=True
    )

    smtp_port = Column(
        Integer,
        default=587
    )

    smtp_email = Column(
        String(150),
        nullable=True
    )

    smtp_password = Column(
        String(255),
        nullable=True
    )

    payment_gateway = Column(
        String(100),
        default="Razorpay"
    )

    maintenance_mode = Column(
        Boolean,
        default=False
    )

    allow_registration = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    # =====================================================
# PRODUCT GALLERY MODEL
# =====================================================

class ProductGallery(Base):

    __tablename__ = "product_gallery"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    image_url = Column(
        String(500),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    product = relationship("Product")


# =====================================================
# NOTIFICATION MODEL
# =====================================================

class Notification(Base):

    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    notification_type = Column(
        String(50),
        default="info"
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =====================================================
# API KEY MODEL
# =====================================================

class APIKey(Base):

    __tablename__ = "api_keys"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    public_key = Column(
        String(255),
        unique=True,
        nullable=False
    )

    secret_key = Column(
        String(255),
        unique=True,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =====================================================
# AUDIT LOG MODEL
# =====================================================

class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    admin_name = Column(
        String(150),
        nullable=False
    )

    action = Column(
        String(255),
        nullable=False
    )

    module = Column(
        String(100),
        nullable=False
    )

    ip_address = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =====================================================
# BACKUP HISTORY MODEL
# =====================================================

class BackupHistory(Base):

    __tablename__ = "backup_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_size = Column(
        Float,
        default=0
    )

    backup_type = Column(
        String(50),
        default="Manual"
    )

    status = Column(
        String(50),
        default="Completed"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =====================================================
# PRODUCT ANALYTICS MODEL
# =====================================================

class ProductAnalytics(Base):

    __tablename__ = "product_analytics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    views = Column(
        Integer,
        default=0
    )

    wishlist_count = Column(
        Integer,
        default=0
    )

    purchases = Column(
        Integer,
        default=0
    )

    revenue = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    product = relationship("Product")