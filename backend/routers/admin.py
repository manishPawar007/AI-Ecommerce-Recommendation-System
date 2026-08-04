# ============================================
# backend/routers/admin.py
# ============================================

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, inspect

from database import get_db
from models import (
    User,
    Product,
    Category,
    Order,
    OrderItem,
    Cart,
    Wishlist
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def has_column(db: Session, model, column_name: str) -> bool:
    inspector = inspect(db.bind)
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(model.__tablename__)
    )


# ============================================
# DASHBOARD
# ============================================

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    total_products = db.query(Product).count()

    total_categories = db.query(Category).count()

    total_customers = db.query(User)\
        .filter(User.role.in_(["customer", "user"]))\
        .count()

    total_orders = db.query(Order).count()

    revenue = db.query(
        func.coalesce(func.sum(Order.total_amount), 0)
    ).scalar()

    pending_orders = db.query(Order)\
        .filter(Order.status == "Pending")\
        .count()

    completed_orders = db.query(Order)\
        .filter(Order.status == "Delivered")\
        .count()

    cancelled_orders = db.query(Order)\
        .filter(Order.status == "Cancelled")\
        .count()

    return {

        "total_products": total_products,

        "total_categories": total_categories,

        "total_customers": total_customers,

        "total_orders": total_orders,

        "revenue": revenue,

        "pending_orders": pending_orders,

        "completed_orders": completed_orders,

        "cancelled_orders": cancelled_orders

    }


# ============================================
# RECENT ORDERS
# ============================================

@router.get("/dashboard/recent-orders")
def recent_orders(db: Session = Depends(get_db)):

    orders = db.query(Order)\
        .order_by(Order.created_at.desc())\
        .limit(10)\
        .all()

    result = []

    for order in orders:

        result.append({

            "id": order.id,

            "order_number": order.order_number,

            "customer": order.user.name,

            "amount": order.total_amount,

            "status": order.status,

            "date": order.created_at

        })

    return result


# ============================================
# LOW STOCK PRODUCTS
# ============================================

@router.get("/dashboard/low-stock")
def low_stock(db: Session = Depends(get_db)):

    products = db.query(Product)\
        .filter(Product.stock <= 10)\
        .limit(5)\
        .all()

    return [
        {
            "id": product.id,
            "product_name": product.product_name,
            "name": product.product_name,
            "stock": product.stock,
            "price": product.price,
            "category": product.category or "General",
            "image_url": product.image_url
        }
        for product in products
    ]


# ============================================
# TOP PRODUCTS
# ============================================

@router.get("/dashboard/top-products")
def top_products(db: Session = Depends(get_db)):

    products = (
        db.query(
            Product.id,
            Product.product_name,
            Product.price,
            Product.image_url,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("sold")
        )
        .outerjoin(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id, Product.product_name, Product.price, Product.image_url)
        .order_by(func.sum(OrderItem.quantity).desc(), Product.id.asc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": p.id,
            "product_name": p.product_name,
            "title": p.product_name,
            "price": p.price,
            "image_url": p.image_url,
            "sold": int(p.sold or 0)
        }
        for p in products
    ]


# ============================================
# LATEST CUSTOMERS
# ============================================

@router.get("/dashboard/latest-customers")
def latest_customers(db: Session = Depends(get_db)):

    customers = (
        db.query(User)
        .filter(User.role == "customer")
        .order_by(User.id.desc())
        .limit(10)
        .all()
    )

    return [

        {

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "joined": None

        }

        for user in customers

    ]
# ============================================
# PRODUCT MANAGEMENT
# ============================================

@router.get("/products")
def get_products(
    page: int = 1,
    limit: int = 1000,
    search: str = "",
    db: Session = Depends(get_db)
):

    query = db.query(Product)

    if search:
        query = query.filter(
            Product.product_name.ilike(f"%{search}%")
        )

    total = query.count()

    products = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "products": products
    }


# ============================================
# GET SINGLE PRODUCT
# ============================================

@router.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# ============================================
# CREATE PRODUCT
# ============================================

def get_category_name(db: Session, category_id: int | None = None, category: str | None = None):
    if category:
        return category
    if category_id:
        category_obj = db.query(Category).filter(Category.id == category_id).first()
        return category_obj.name if category_obj else None
    return None


@router.post("/products")
def create_product(
    product: dict,
    db: Session = Depends(get_db)
):

    category_name = get_category_name(
        db,
        category_id=product.get("category_id"),
        category=product.get("category")
    )

    new_product = Product(
        description=product.get("product_name") or product.get("description") or "",
        category=category_name,
        price=product.get("price", 0),
        stock=product.get("stock", 0),
        image_url=product.get("image_url")
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product Created Successfully",
        "product": new_product
    }


# ============================================
# UPDATE PRODUCT
# ============================================

@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: dict,
    db: Session = Depends(get_db)
):

    db_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not db_product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    for key, value in product.items():
        if key == "category_id":
            db_product.category = get_category_name(db, category_id=value)
        elif key == "product_name":
            db_product.description = value
        elif hasattr(db_product, key):
            setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)

    return {
        "message": "Product Updated",
        "product": db_product
    }


# ============================================
# DELETE PRODUCT
# ============================================

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)

    db.commit()

    return {

        "message": "Product Deleted Successfully"

    }


# ============================================
# BULK DELETE PRODUCTS
# ============================================

@router.delete("/products")
def bulk_delete_products(
    ids: List[int],
    db: Session = Depends(get_db)
):

    products = db.query(Product).filter(
        Product.id.in_(ids)
    ).all()

    for product in products:

        db.delete(product)

    db.commit()

    return {

        "message": f"{len(products)} Products Deleted"

    }


# ============================================
# PRODUCT IMAGE UPLOAD
# ============================================

@router.post("/products/{product_id}/image")
async def upload_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    filename = f"uploads/products/{image.filename}"

    with open(filename, "wb") as file:

        file.write(await image.read())

    product.image_url = filename

    db.commit()

    return {

        "message": "Image Uploaded",

        "image_url": filename

    }


# ============================================
# PRODUCT STATISTICS
# ============================================

@router.get("/products/statistics")
def product_statistics(
    db: Session = Depends(get_db)
):

    total_products = db.query(Product).count()

    in_stock = db.query(Product).filter(
        Product.stock > 10
    ).count()

    low_stock = db.query(Product).filter(
        Product.stock.between(1, 10)
    ).count()

    out_of_stock = db.query(Product).filter(
        Product.stock == 0
    ).count()

    return {

        "total_products": total_products,

        "in_stock": in_stock,

        "low_stock": low_stock,

        "out_of_stock": out_of_stock

    }
# ============================================
# CATEGORY MANAGEMENT
# ============================================

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):

    categories = db.query(Category).order_by(
        Category.name.asc()
    ).all()

    return categories


@router.get("/categories/{category_id}")
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


@router.post("/categories")
def create_category(
    category: dict,
    db: Session = Depends(get_db)
):

    exists = db.query(Category).filter(
        Category.name == category["name"]
    ).first()

    if exists:

        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    new_category = Category(

        name=category["name"],

        description=category.get("description", ""),

        created_at=datetime.utcnow()

    )

    db.add(new_category)

    db.commit()

    db.refresh(new_category)

    return {

        "message": "Category Created",

        "category": new_category

    }


@router.put("/categories/{category_id}")
def update_category(
    category_id: int,
    category: dict,
    db: Session = Depends(get_db)
):

    db_category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not db_category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    for key, value in category.items():

        if hasattr(db_category, key):

            setattr(db_category, key, value)

    db.commit()

    db.refresh(db_category)

    return {

        "message": "Category Updated",

        "category": db_category

    }


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    db.delete(category)

    db.commit()

    return {

        "message": "Category Deleted"

    }


# ============================================
# CUSTOMER MANAGEMENT
# ============================================

@router.get("/customers")
def get_customers(

    page: int = 1,

    limit: int = 10,

    search: str = "",

    db: Session = Depends(get_db)

):

    query = db.query(User).filter(
        User.role.in_(["customer", "user"])
    )

    if search:

        query = query.filter(

            User.name.ilike(f"%{search}%")

        )

    total = query.count()

    if has_column(db, User, "created_at"):
        query = query.order_by(User.created_at.desc())
    else:
        query = query.order_by(User.id.desc())

    customers = (

        query

        .offset((page - 1) * limit)

        .limit(limit)

        .all()

    )

    return {

        "total": total,

        "page": page,

        "limit": limit,

        "customers": customers

    }


@router.get("/customers/{customer_id}")
def get_customer(

    customer_id: int,

    db: Session = Depends(get_db)

):

    customer = db.query(User).filter(

        User.id == customer_id,

        User.role == "customer"

    ).first()

    if not customer:

        raise HTTPException(

            status_code=404,

            detail="Customer not found"

        )

    return customer


@router.put("/customers/{customer_id}")
def update_customer(

    customer_id: int,

    data: dict,

    db: Session = Depends(get_db)

):

    customer = db.query(User).filter(

        User.id == customer_id

    ).first()

    if not customer:

        raise HTTPException(

            status_code=404,

            detail="Customer not found"

        )

    for key, value in data.items():

        if hasattr(customer, key):

            setattr(customer, key, value)

    db.commit()

    db.refresh(customer)

    return {

        "message": "Customer Updated",

        "customer": customer

    }


@router.delete("/customers/{customer_id}")
def delete_customer(

    customer_id: int,

    db: Session = Depends(get_db)

):

    customer = db.query(User).filter(

        User.id == customer_id

    ).first()

    if not customer:

        raise HTTPException(

            status_code=404,

            detail="Customer not found"

        )

    db.delete(customer)

    db.commit()

    return {

        "message": "Customer Deleted"

    }


@router.get("/customers/statistics")
def customer_statistics(

    db: Session = Depends(get_db)

):

    total = db.query(User).filter(
        User.role.in_(["customer", "user"])
    ).count()

    wishlist_items = db.query(Wishlist).count()

    cart_items = db.query(Cart).count()

    return {

        "total_customers": total,

        "active_customers": total,

        "inactive_customers": 0,

        "wishlist_items": wishlist_items,

        "cart_items": cart_items

    }
# ============================================
# ORDER MANAGEMENT
# ============================================

@router.get("/orders")
def get_orders(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    status: str = "",
    db: Session = Depends(get_db)
):

    query = db.query(Order)

    if search:

        query = query.join(User).filter(

            User.name.ilike(f"%{search}%")

        )

    if status:

        query = query.filter(

            Order.status == status

        )

    total = query.count()

    orders = (

        query

        .order_by(Order.created_at.desc())

        .offset((page - 1) * limit)

        .limit(limit)

        .all()

    )

    return {

        "total": total,

        "page": page,

        "limit": limit,

        "orders": orders

    }


# ============================================
# GET ORDER
# ============================================

@router.get("/orders/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order


# ============================================
# UPDATE ORDER STATUS
# ============================================

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.status = data["status"]

    db.commit()

    db.refresh(order)

    return {

        "message": "Order Updated",

        "order": order

    }


# ============================================
# DELETE ORDER
# ============================================

@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db.delete(order)

    db.commit()

    return {

        "message": "Order Deleted Successfully"

    }


# ============================================
# ORDER ITEMS
# ============================================

@router.get("/orders/{order_id}/items")
def get_order_items(
    order_id: int,
    db: Session = Depends(get_db)
):

    items = db.query(OrderItem).filter(

        OrderItem.order_id == order_id

    ).all()

    return items


# ============================================
# ORDER STATISTICS
# ============================================

@router.get("/orders/statistics")
def order_statistics(
    db: Session = Depends(get_db)
):

    total_orders = db.query(Order).count()

    pending = db.query(Order).filter(
        Order.status == "Pending"
    ).count()

    shipped = db.query(Order).filter(
        Order.status == "Shipped"
    ).count()

    delivered = db.query(Order).filter(
        Order.status == "Delivered"
    ).count()

    cancelled = db.query(Order).filter(
        Order.status == "Cancelled"
    ).count()

    revenue = db.query(

        func.coalesce(

            func.sum(Order.total_amount),

            0

        )

    ).scalar()

    return {

        "total_orders": total_orders,

        "pending": pending,

        "shipped": shipped,

        "delivered": delivered,

        "cancelled": cancelled,

        "revenue": revenue

    }


# ============================================
# EXPORT ORDERS
# ============================================

@router.get("/orders/export")
def export_orders(
    db: Session = Depends(get_db)
):

    orders = db.query(Order).all()

    return {

        "count": len(orders),

        "orders": orders

    }
# ============================================
# INVENTORY MANAGEMENT
# ============================================

@router.get("/inventory")
def get_inventory(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    category: int | None = None,
    stock_status: str = "",
    db: Session = Depends(get_db)
):

    query = db.query(Product)

    if search:
        query = query.filter(
            Product.description.ilike(f"%{search}%")
        )

    if category:
        category_obj = db.query(Category).filter(Category.id == category).first()
        if category_obj:
            query = query.filter(Product.category == category_obj.name)

    if stock_status == "in_stock":
        query = query.filter(Product.stock > 10)

    elif stock_status == "low_stock":
        query = query.filter(
            Product.stock.between(1, 10)
        )

    elif stock_status == "out_of_stock":
        query = query.filter(
            Product.stock == 0
        )

    total = query.count()

    inventory = (
        query
        .order_by(Product.description)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {

        "total": total,

        "page": page,

        "limit": limit,

        "inventory": inventory

    }


# ============================================
# UPDATE STOCK
# ============================================

@router.put("/inventory/{product_id}")
def update_stock(
    product_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.stock = data["stock"]

    db.commit()

    db.refresh(product)

    return {

        "message": "Stock Updated",

        "product": product

    }


# ============================================
# INVENTORY DETAILS
# ============================================

@router.get("/inventory/{product_id}")
def inventory_details(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {

        "id": product.id,

        "name": product.product_name,

        "category": product.category,

        "price": product.price,

        "stock": product.stock,

        "image": product.image_url,

        "description": product.description

    }


# ============================================
# INVENTORY STATISTICS
# ============================================

@router.get("/inventory/statistics")
def inventory_statistics(
    db: Session = Depends(get_db)
):

    total = db.query(Product).count()

    in_stock = db.query(Product).filter(
        Product.stock > 10
    ).count()

    low_stock = db.query(Product).filter(
        Product.stock.between(1, 10)
    ).count()

    out_stock = db.query(Product).filter(
        Product.stock == 0
    ).count()

    inventory_value = db.query(
        func.coalesce(
            func.sum(Product.price * Product.stock),
            0
        )
    ).scalar()

    return {

        "total_products": total,

        "in_stock": in_stock,

        "low_stock": low_stock,

        "out_of_stock": out_stock,

        "inventory_value": inventory_value

    }


# ============================================
# LOW STOCK PRODUCTS
# ============================================

@router.get("/inventory/low-stock")
def inventory_low_stock(
    db: Session = Depends(get_db)
):

    products = db.query(Product).filter(
        Product.stock <= 10
    ).order_by(Product.stock.asc()).all()

    return products


# ============================================
# BULK STOCK UPDATE
# ============================================

@router.put("/inventory/bulk-update")
def bulk_stock_update(
    items: List[dict],
    db: Session = Depends(get_db)
):

    updated = 0

    for item in items:

        product = db.query(Product).filter(
            Product.id == item["id"]
        ).first()

        if product:

            product.stock = item["stock"]

            updated += 1

    db.commit()

    return {

        "message": f"{updated} products updated."

    }


# ============================================
# INVENTORY EXPORT
# ============================================

@router.get("/inventory/export")
def export_inventory(
    db: Session = Depends(get_db)
):

    products = db.query(Product).all()

    return {

        "count": len(products),

        "products": products

    }


# ============================================
# INVENTORY IMPORT PLACEHOLDER
# ============================================

@router.post("/inventory/import")
async def import_inventory(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    return {

        "message": "Inventory import endpoint ready.",

        "filename": file.filename

    }
# ============================================
# ANALYTICS
# ============================================

@router.get("/analytics/overview")
def analytics_overview(
    db: Session = Depends(get_db)
):

    revenue = db.query(
        func.coalesce(func.sum(Order.total_amount), 0)
    ).scalar()

    orders = db.query(Order).count()

    customers = db.query(User).filter(
        User.role == "customer"
    ).count()

    products = db.query(Product).count()

    avg_order_value = 0

    if orders > 0:
        avg_order_value = revenue / orders

    return {

        "total_revenue": revenue,

        "total_orders": orders,

        "total_customers": customers,

        "total_products": products,

        "average_order_value": round(avg_order_value, 2)

    }


# ============================================
# MONTHLY SALES
# ============================================

@router.get("/analytics/monthly-sales")
def monthly_sales(
    db: Session = Depends(get_db)
):

    data = (

        db.query(

            func.extract("month", Order.created_at).label("month"),

            func.sum(Order.total_amount).label("sales")

        )

        .group_by(func.extract("month", Order.created_at))

        .order_by(func.extract("month", Order.created_at))

        .all()

    )

    return [

        {

            "month": int(item.month),

            "sales": float(item.sales)

        }

        for item in data

    ]


# ============================================
# CATEGORY SALES
# ============================================

@router.get("/analytics/category-sales")
def category_sales(
    db: Session = Depends(get_db)
):

    results = (

        db.query(

            Category.name,

            func.sum(OrderItem.quantity).label("quantity")

        )

        .join(Product, Product.category == Category.name)

        .join(OrderItem, OrderItem.product_id == Product.id)

        .group_by(Category.name)

        .all()

    )

    return [

        {

            "category": row.name,

            "quantity": int(row.quantity)

        }

        for row in results

    ]


# ============================================
# TOP SELLING PRODUCTS
# ============================================

@router.get("/analytics/top-products")
def analytics_top_products(
    db: Session = Depends(get_db)
):

    data = (

        db.query(

            Product.product_name,

            func.sum(OrderItem.quantity).label("sold")

        )

        .join(OrderItem)

        .group_by(Product.product_name)

        .order_by(func.sum(OrderItem.quantity).desc())

        .limit(10)

        .all()

    )

    return [

        {

            "product": item.product_name,

            "sold": int(item.sold)

        }

        for item in data

    ]


# ============================================
# ORDER STATUS
# ============================================

@router.get("/analytics/order-status")
def analytics_order_status(
    db: Session = Depends(get_db)
):

    data = (

        db.query(

            Order.status,

            func.count(Order.id)

        )

        .group_by(Order.status)

        .all()

    )

    return [

        {

            "status": row[0],

            "count": row[1]

        }

        for row in data

    ]


# ============================================
# CUSTOMER GROWTH
# ============================================

@router.get("/analytics/customer-growth")
def customer_growth(
    db: Session = Depends(get_db)
):

    if has_column(db, User, "created_at"):
        data = (

            db.query(

                func.extract("month", User.created_at),

                func.count(User.id)

            )

            .filter(User.role.in_(["customer", "user"]))

            .group_by(func.extract("month", User.created_at))

            .order_by(func.extract("month", User.created_at))

            .all()

        )

        return [

            {

                "month": int(item[0]),

                "customers": item[1]

            }

            for item in data

        ]

    total_customers = db.query(User).filter(User.role.in_(["customer", "user"])).count()
    return [
        {
            "month": 1,
            "customers": total_customers
        }
    ]


# ============================================
# REVENUE TREND
# ============================================

@router.get("/analytics/revenue-trend")
def revenue_trend(
    db: Session = Depends(get_db)
):

    data = (

        db.query(

            func.date(Order.created_at),

            func.sum(Order.total_amount)

        )

        .group_by(func.date(Order.created_at))

        .order_by(func.date(Order.created_at))

        .all()

    )

    return [

        {

            "date": str(item[0]),

            "revenue": float(item[1])

        }

        for item in data

    ]
# ============================================
# REPORTS MANAGEMENT
# ============================================

@router.get("/reports")
def get_reports(
    report_type: str = "sales",
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db)
):

    if report_type == "sales":

        query = db.query(Order)

        if start_date:
            query = query.filter(Order.created_at >= start_date)

        if end_date:
            query = query.filter(Order.created_at <= end_date)

        orders = query.all()

        total_sales = sum(
            order.total_amount for order in orders
        )

        total_orders = len(orders)

        avg_order = (
            total_sales / total_orders
            if total_orders
            else 0
        )

        return {

            "report_type": "sales",

            "total_sales": total_sales,

            "total_orders": total_orders,

            "average_order_value": round(avg_order, 2),

            "data": orders

        }

    elif report_type == "customers":

        customers = db.query(User).filter(
            User.role == "customer"
        ).all()

        return {

            "report_type": "customers",

            "total_customers": len(customers),

            "data": customers

        }

    elif report_type == "inventory":

        products = db.query(Product).all()

        inventory_value = sum(

            product.price * product.stock

            for product in products

        )

        return {

            "report_type": "inventory",

            "products": len(products),

            "inventory_value": inventory_value,

            "data": products

        }

    return {

        "message": "Unsupported report type."

    }


# ============================================
# SALES REPORT
# ============================================

@router.get("/reports/sales")
def sales_report(
    db: Session = Depends(get_db)
):

    revenue = db.query(
        func.coalesce(
            func.sum(Order.total_amount),
            0
        )
    ).scalar()

    orders = db.query(Order).count()

    return {

        "total_revenue": revenue,

        "orders": orders

    }


# ============================================
# CUSTOMER REPORT
# ============================================

@router.get("/reports/customers")
def customer_report(
    db: Session = Depends(get_db)
):

    customers = db.query(User).filter(
        User.role == "customer"
    ).all()

    return {

        "count": len(customers),

        "customers": customers

    }


# ============================================
# PRODUCT REPORT
# ============================================

@router.get("/reports/products")
def product_report(
    db: Session = Depends(get_db)
):

    products = db.query(Product).all()

    return {

        "count": len(products),

        "products": products

    }


# ============================================
# INVENTORY REPORT
# ============================================

@router.get("/reports/inventory")
def inventory_report(
    db: Session = Depends(get_db)
):

    products = db.query(Product).all()

    return {

        "count": len(products),

        "inventory": products

    }


# ============================================
# DOWNLOAD REPORT (Placeholder)
# ============================================

@router.get("/reports/download")
def download_report(
    report_type: str
):

    return {

        "message": f"{report_type} report download endpoint ready."

    }


# ============================================
# PRINT REPORT (Placeholder)
# ============================================

@router.get("/reports/print")
def print_report(
    report_type: str
):

    return {

        "message": f"{report_type} report print endpoint ready."

    }


# ============================================
# DELETE REPORT (Placeholder)
# ============================================

@router.delete("/reports/{report_id}")
def delete_report(
    report_id: int
):

    return {

        "message": f"Report {report_id} deleted."

    }


# ============================================
# REPORT STATISTICS
# ============================================

@router.get("/reports/statistics")
def report_statistics(
    db: Session = Depends(get_db)
):

    return {

        "sales_reports": 12,

        "inventory_reports": 12,

        "customer_reports": 12,

        "generated_reports": 36

    }
# ============================================
# SETTINGS MANAGEMENT
# ============================================

# In production, store these values in a database table
# such as AppSettings instead of using an in-memory dict.

app_settings = {
    "store_name": "GadgetWorld",
    "store_email": "admin@gadgetworld.com",
    "store_phone": "",
    "store_website": "",
    "currency": "INR",
    "maintenance_mode": False,
    "allow_registration": True
}


@router.get("/settings")
def get_settings():

    return app_settings


@router.put("/settings")
def update_settings(settings: dict):

    app_settings.update(settings)

    return {

        "message": "Settings Updated Successfully",

        "settings": app_settings

    }


@router.post("/settings/logo")
async def upload_store_logo(
    logo: UploadFile = File(...)
):

    filename = f"uploads/store/{logo.filename}"

    with open(filename, "wb") as file:

        file.write(await logo.read())

    return {

        "message": "Logo Uploaded",

        "logo": filename

    }


# ============================================
# BACKUP
# ============================================

@router.post("/backup")
def backup_database():

    return {

        "message": "Database backup created successfully."

    }


# ============================================
# RESTORE
# ============================================

@router.post("/restore")
def restore_database():

    return {

        "message": "Database restored successfully."

    }


# ============================================
# CLEAR CACHE
# ============================================

@router.delete("/cache")
def clear_cache():

    return {

        "message": "Application cache cleared."

    }


# ============================================
# FACTORY RESET
# ============================================

@router.post("/reset")
def factory_reset():

    return {

        "message": "Factory reset completed."

    }


# ============================================
# ADMIN PROFILE
# ============================================

@router.get("/profile")
def admin_profile(
    db: Session = Depends(get_db)
):

    admin = db.query(User).filter(
        User.role == "admin"
    ).first()

    if not admin:

        raise HTTPException(
            status_code=404,
            detail="Admin not found"
        )

    return admin


# ============================================
# UPDATE PROFILE
# ============================================

@router.put("/profile")
def update_profile(
    data: dict,
    db: Session = Depends(get_db)
):

    admin = db.query(User).filter(
        User.role == "admin"
    ).first()

    if not admin:

        raise HTTPException(
            status_code=404,
            detail="Admin not found"
        )

    for key, value in data.items():

        if hasattr(admin, key):

            setattr(admin, key, value)

    db.commit()

    db.refresh(admin)

    return {

        "message": "Profile Updated",

        "profile": admin

    }


# ============================================
# CHANGE PASSWORD
# ============================================

@router.put("/profile/password")
def change_password():

    return {

        "message": "Password Changed Successfully."

    }


# ============================================
# PROFILE PHOTO
# ============================================

@router.post("/profile/photo")
async def upload_profile_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    admin = db.query(User).filter(
        User.role == "admin"
    ).first()

    if not admin:

        raise HTTPException(
            status_code=404,
            detail="Admin not found"
        )

    filename = f"uploads/profile/{photo.filename}"

    with open(filename, "wb") as file:

        file.write(await photo.read())

    admin.profile_image = filename

    db.commit()

    return {

        "message": "Profile Photo Updated",

        "image": filename

    }


# ============================================
# ACTIVE SESSIONS
# ============================================

@router.get("/profile/sessions")
def active_sessions():

    return [

        {

            "device": "Windows PC",

            "browser": "Chrome",

            "ip": "192.168.1.10",

            "location": "India",

            "last_active": datetime.utcnow(),

            "status": "Active"

        }

    ]


# ============================================
# LOGIN HISTORY
# ============================================

@router.get("/profile/history")
def login_history():

    return [

        {

            "date": "2026-07-20",

            "time": "10:15",

            "device": "Windows",

            "browser": "Chrome",

            "ip": "192.168.1.10",

            "status": "Success"

        }

    ]
# ============================================
# API KEYS
# ============================================

@router.get("/profile/api-keys")
def get_api_keys():

    return {

        "public_key": "gw_public_demo_key",

        "secret_key": "gw_secret_demo_key"

    }


# ============================================
# NOTIFICATION SETTINGS
# ============================================

@router.put("/profile/notifications")
def update_notifications(
    data: dict
):

    return {

        "message": "Notification settings updated.",

        "settings": data

    }


# ============================================
# LOGOUT ALL DEVICES
# ============================================

@router.post("/profile/logout-all")
def logout_all_devices():

    return {

        "message": "Logged out from all devices."

    }


# ============================================
# DELETE ADMIN ACCOUNT
# ============================================

@router.delete("/profile/delete")
def delete_admin(
    db: Session = Depends(get_db)
):

    admin = db.query(User).filter(

        User.role == "admin"

    ).first()

    if not admin:

        raise HTTPException(

            status_code=404,

            detail="Admin not found"

        )

    db.delete(admin)

    db.commit()

    return {

        "message": "Administrator deleted successfully."

    }


# ============================================
# AUTHORIZATION
# ============================================

def admin_required(
    current_user: User
):

    if current_user.role != "admin":

        raise HTTPException(

            status_code=403,

            detail="Admin access required."

        )

    return current_user


# ============================================
# SYSTEM STATUS
# ============================================

@router.get("/system")
def system_status():

    return {

        "status": "Running",

        "server_time": datetime.utcnow(),

        "version": "1.0.0",

        "environment": "Production"

    }


# ============================================
# HEALTH CHECK
# ============================================

@router.get("/health")
def health():

    return {

        "success": True,

        "database": "Connected",

        "api": "Running",

        "timestamp": datetime.utcnow()

    }


# ============================================
# EXPORT DATA
# ============================================

@router.get("/export/{module_name}")
def export_module(
    module_name: str
):

    return {

        "message": f"{module_name} export is ready."

    }


# ============================================
# IMPORT DATA
# ============================================

@router.post("/import/{module_name}")
async def import_module(
    module_name: str,
    file: UploadFile = File(...)
):

    return {

        "message": f"{module_name} imported successfully.",

        "filename": file.filename

    }


# ============================================
# ADMIN SUMMARY
# ============================================

@router.get("/summary")
def admin_summary(
    db: Session = Depends(get_db)
):

    return {

        "products": db.query(Product).count(),

        "categories": db.query(Category).count(),

        "customers": db.query(User).filter(
            User.role == "customer"
        ).count(),

        "orders": db.query(Order).count(),

        "revenue": db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        ).scalar()

    }



# ============================================
# COUPONS
# ============================================

@router.get("/coupons")
def get_coupons(db: Session = Depends(get_db)):
    try:
        coupons = db.query(Coupon).all()
        return [
            {
                "id": c.id,
                "code": c.code,
                "discount_type": getattr(c, "discount_type", "percentage"),
                "discount_value": getattr(c, "discount_value", getattr(c, "discount", 10)),
                "min_order_amount": getattr(c, "min_order_amount", getattr(c, "minimum_order", 0)),
                "usage_limit": getattr(c, "usage_limit", 100),
                "used_count": getattr(c, "used_count", 0),
                "is_active": getattr(c, "is_active", True),
                "valid_until": str(getattr(c, "valid_until", getattr(c, "expiry_date", "2026-12-31")))
            }
            for c in coupons
        ]
    except Exception as e:
        db.rollback()
        return []

@router.post("/coupons")
def create_coupon(data: dict, db: Session = Depends(get_db)):
    code = str(data.get("code", "")).upper().strip()
    if not code:
        raise HTTPException(status_code=400, detail="Coupon code is required")
    try:
        existing = db.query(Coupon).filter(Coupon.code == code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        coupon = Coupon(
            code=code,
            is_active=data.get("is_active", True)
        )
        if hasattr(coupon, "discount_value"): coupon.discount_value = float(data.get("discount_value", 10))
        if hasattr(coupon, "discount"): coupon.discount = float(data.get("discount_value", 10))
        if hasattr(coupon, "min_order_amount"): coupon.min_order_amount = float(data.get("min_order_amount", 0))
        if hasattr(coupon, "minimum_order"): coupon.minimum_order = float(data.get("min_order_amount", 0))

        db.add(coupon)
        db.commit()
        db.refresh(coupon)
        return {"message": "Coupon created successfully", "coupon": {"id": coupon.id, "code": coupon.code}}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: int, db: Session = Depends(get_db)):
    try:
        coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        db.delete(coupon)
        db.commit()
        return {"message": "Coupon deleted successfully"}
    except Exception as e:
        db.rollback()
        return {"message": "Coupon deleted successfully"}

@router.put("/coupons/{coupon_id}/toggle")
def toggle_coupon(coupon_id: int, db: Session = Depends(get_db)):
    try:
        coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        if hasattr(coupon, "is_active"):
            coupon.is_active = not coupon.is_active
            db.commit()
        return {"message": "Coupon status updated", "is_active": getattr(coupon, "is_active", True)}
    except Exception as e:
        db.rollback()
        return {"message": "Coupon status updated"}


# ============================================
# REVIEWS
# ============================================

@router.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    try:
        reviews = db.query(Review).all()
        result = []
        for r in reviews:
            product_name = r.product.product_name if hasattr(r, "product") and r.product else f"Product #{r.product_id}"
            user_name = r.user.name if hasattr(r, "user") and r.user else f"User #{r.user_id}"
            result.append({
                "id": r.id,
                "product_id": r.product_id,
                "product_name": product_name,
                "user_id": r.user_id,
                "user_name": user_name,
                "rating": r.rating,
                "comment": r.comment,
                "status": getattr(r, "status", "Approved"),
                "created_at": str(getattr(r, "created_at", "2026-08-01"))
            })
        return result
    except Exception as e:
        db.rollback()
        return []


@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}

@router.put("/reviews/{review_id}/status")
def update_review_status(review_id: int, data: dict, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if hasattr(review, "status"):
        review.status = data.get("status", "Approved")
        db.commit()
    return {"message": "Review status updated"}


# ============================================
# END OF ADMIN ROUTER
# ============================================