from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from database import get_db
from models import (
    Product,
    User,
    Order,
    OrderItem,
    Cart
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# ==========================================
# Dashboard Summary
# ==========================================

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db)
):

    total_products = db.query(Product).count()

    total_users = db.query(User).count()

    total_orders = db.query(Order).count()

    total_cart = db.query(Cart).count()

    total_revenue = (
        db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        ).scalar()
    )

    return {

        "total_products": total_products,

        "total_users": total_users,

        "total_orders": total_orders,

        "total_cart": total_cart,

        "total_revenue": float(total_revenue),

        # Dummy values
        "today_sales": float(total_revenue) * 0.15,

        "weekly_sales": float(total_revenue) * 0.45,

        "monthly_sales": float(total_revenue),

        "in_stock_percent": 82,

        "low_stock_percent": 13,

        "out_stock_percent": 5

    }


# ==========================================
# Products Count
# ==========================================

@router.get("/products-count")
def products_count(
    db: Session = Depends(get_db)
):

    return {

        "total_products":

        db.query(Product).count()

    }


# ==========================================
# Users Count
# ==========================================

@router.get("/users-count")
def users_count(
    db: Session = Depends(get_db)
):

    return {

        "total_users":

        db.query(User).count()

    }


# ==========================================
# Orders Count
# ==========================================

@router.get("/orders-count")
def orders_count(
    db: Session = Depends(get_db)
):

    return {

        "total_orders":

        db.query(Order).count()

    }


# ==========================================
# Cart Count
# ==========================================

@router.get("/cart-count")
def cart_count(
    db: Session = Depends(get_db)
):

    return {

        "total_cart":

        db.query(Cart).count()

    }


# ==========================================
# Revenue
# ==========================================

@router.get("/revenue")
def revenue(
    db: Session = Depends(get_db)
):

    revenue = (

        db.query(

            func.coalesce(

                func.sum(
                    Order.total_amount
                ),

                0

            )

        )

        .scalar()

    )

    return {

        "revenue": float(revenue)

    }
# ==========================================
# Low Stock Products
# ==========================================

@router.get("/low-stock")
def low_stock(
    db: Session = Depends(get_db)
):

    products = (

        db.query(Product)

        .filter(
            Product.stock <= 10
        )

        .order_by(
            Product.stock.asc()
        )

        .all()

    )

    return [

        {

            "id": p.id,

            "description": p.description,

            "category": p.category,

            "stock": p.stock,

            "price": p.price

        }

        for p in products

    ]


# ==========================================
# Top Selling Products
# ==========================================

@router.get("/top-products")
def top_products(
    db: Session = Depends(get_db)
):

    products = (

        db.query(

            Product.description.label("product"),

            Product.category.label("category"),

            func.coalesce(

                func.sum(
                    OrderItem.quantity
                ),

                0

            ).label("sold")

        )

        .outerjoin(

            OrderItem,

            Product.id ==
            OrderItem.product_id

        )

        .group_by(

            Product.id,

            Product.description,

            Product.category

        )

        .order_by(

            func.coalesce(

                func.sum(
                    OrderItem.quantity
                ),

                0

            ).desc()

        )

        .limit(10)

        .all()

    )

    return [

        {

            "product": p.product,

            "category": p.category,

            "sold": int(p.sold)

        }

        for p in products

    ]


# ==========================================
# Category Analytics
# ==========================================

@router.get("/category-sales")
def category_sales(
    db: Session = Depends(get_db)
):

    categories = (

        db.query(

            Product.category,

            func.count(
                Product.id
            ).label("count")

        )

        .group_by(
            Product.category
        )

        .order_by(
            func.count(
                Product.id
            ).desc()
        )

        .all()

    )

    return [

        {

            "category": c.category,

            "count": c.count

        }

        for c in categories

    ]


# ==========================================
# Monthly Sales
# ==========================================

@router.get("/monthly-sales")
def monthly_sales(
    db: Session = Depends(get_db)
):

    sales = (

        db.query(

            extract(
                "month",
                Order.created_at
            ).label("month"),

            func.coalesce(

                func.sum(
                    Order.total_amount
                ),

                0

            ).label("sales")

        )

        .group_by(
            extract(
                "month",
                Order.created_at
            )
        )

        .order_by(
            extract(
                "month",
                Order.created_at
            )
        )

        .all()

    )

    month_names = [

        "",

        "Jan",

        "Feb",

        "Mar",

        "Apr",

        "May",

        "Jun",

        "Jul",

        "Aug",

        "Sep",

        "Oct",

        "Nov",

        "Dec"

    ]

    return [

        {

            "month":
                month_names[
                    int(s.month)
                ],

            "sales":
                float(s.sales)

        }

        for s in sales

    ]
# ==========================================
# Recent Orders
# ==========================================

@router.get("/recent-orders")
def recent_orders(
    db: Session = Depends(get_db)
):

    orders = (

        db.query(Order)

        .order_by(
            Order.created_at.desc()
        )

        .limit(10)

        .all()

    )

    result = []

    for order in orders:

        user_name = "-"

        if order.user:

            user_name = order.user.name

        result.append(

            {

                "id": order.id,

                "user": user_name,

                "total_amount": float(
                    order.total_amount
                ),

                "status": order.status,

                "created_at":
                order.created_at.strftime(
                    "%d-%m-%Y"
                )

            }

        )

    return result


# ==========================================
# Latest Users
# ==========================================

@router.get("/latest-users")
def latest_users(
    db: Session = Depends(get_db)
):

    users = (

        db.query(User)

        .order_by(
            User.id.desc()
        )

        .limit(10)

        .all()

    )

    return [

        {

            "id": u.id,

            "name": u.name,

            "email": u.email

        }

        for u in users

    ]


# ==========================================
# Inventory Analytics
# ==========================================

@router.get("/inventory")
def inventory(
    db: Session = Depends(get_db)
):

    total = db.query(Product).count()

    in_stock = (

        db.query(Product)

        .filter(
            Product.stock > 10
        )

        .count()

    )

    low_stock = (

        db.query(Product)

        .filter(
            Product.stock.between(
                1,
                10
            )
        )

        .count()

    )

    out_stock = (

        db.query(Product)

        .filter(
            Product.stock == 0
        )

        .count()

    )

    if total == 0:

        return {

            "in_stock": 0,

            "low_stock": 0,

            "out_stock": 0

        }

    return {

        "in_stock":
        round(
            in_stock * 100 / total,
            2
        ),

        "low_stock":
        round(
            low_stock * 100 / total,
            2
        ),

        "out_stock":
        round(
            out_stock * 100 / total,
            2
        )

    }


# ==========================================
# AI Insights
# ==========================================

@router.get("/ai-insights")
def ai_insights(
    db: Session = Depends(get_db)
):

    total_products = db.query(Product).count()

    total_orders = db.query(Order).count()

    total_users = db.query(User).count()

    revenue = (

        db.query(

            func.coalesce(

                func.sum(
                    Order.total_amount
                ),

                0

            )

        )

        .scalar()

    )

    avg_order = 0

    if total_orders > 0:

        avg_order = round(

            revenue / total_orders,

            2

        )

    return {

        "total_products":
        total_products,

        "total_orders":
        total_orders,

        "total_users":
        total_users,

        "revenue":
        float(revenue),

        "average_order":
        avg_order,

        "recommendation_accuracy":
        "96%",

        "customer_satisfaction":
        "4.9★"

    }
# ==========================================
# Dashboard Refresh
# ==========================================

@router.get("/refresh")
def refresh_dashboard(
    db: Session = Depends(get_db)
):

    total_products = db.query(Product).count()

    total_users = db.query(User).count()

    total_orders = db.query(Order).count()

    total_cart = db.query(Cart).count()

    total_revenue = (

        db.query(

            func.coalesce(

                func.sum(
                    Order.total_amount
                ),

                0

            )

        )

        .scalar()

    )

    return {

        "success": True,

        "dashboard": {

            "total_products": total_products,

            "total_users": total_users,

            "total_orders": total_orders,

            "total_cart": total_cart,

            "total_revenue": float(total_revenue)

        }

    }


# ==========================================
# Analytics Summary
# ==========================================

@router.get("/")
def analytics_summary(
    db: Session = Depends(get_db)
):

    products = db.query(Product).count()

    users = db.query(User).count()

    orders = db.query(Order).count()

    cart = db.query(Cart).count()

    revenue = (

        db.query(

            func.coalesce(

                func.sum(
                    Order.total_amount
                ),

                0

            )

        )

        .scalar()

    )

    top_product = (

        db.query(

            Product.description,

            func.coalesce(

                func.sum(
                    OrderItem.quantity
                ),

                0

            ).label("sold")

        )

        .outerjoin(

            OrderItem,

            Product.id ==
            OrderItem.product_id

        )

        .group_by(
            Product.description
        )

        .order_by(

            func.coalesce(

                func.sum(
                    OrderItem.quantity
                ),

                0

            ).desc()

        )

        .first()

    )

    return {

        "total_products": products,

        "total_users": users,

        "total_orders": orders,

        "total_cart": cart,

        "total_revenue": float(revenue),

        "top_product":

            top_product.description

            if top_product

            else "No Sales",

        "recommendation_accuracy":

            "96%",

        "customer_satisfaction":

            "4.9★"

    }


# ==========================================
# Health Check
# ==========================================

@router.get("/health")
def analytics_health():

    return {

        "status": "Running",

        "module": "Analytics",

        "version": "1.0"

    }