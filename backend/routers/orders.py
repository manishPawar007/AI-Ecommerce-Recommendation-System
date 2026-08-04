from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Order, OrderItem, User, Product

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# =====================================
# GET USER ORDERS
# =====================================

@router.get("/")
def get_orders(
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order)

    if email:
        user = db.query(User).filter(User.email.ilike(email.strip())).first()
        if user:
            query = query.filter(Order.user_id == user.id)
    elif user_id:
        query = query.filter(Order.user_id == user_id)

    orders = query.order_by(Order.created_at.desc()).all()

    res = []
    for o in orders:
        user_obj = db.query(User).filter(User.id == o.user_id).first()
        order_items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
        
        items_list = []
        for item in order_items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            items_list.append({
                "product_id": item.product_id,
                "title": prod.product_name if prod else "Electronics Item",
                "price": item.price,
                "quantity": item.quantity,
                "img": prod.image_url if prod else "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100"
            })

        res.append({
            "id": o.id,
            "order_number": getattr(o, "order_number", f"GW-{o.id}"),
            "user_id": o.user_id,
            "user_email": user_obj.email if user_obj else email,
            "customer": user_obj.name if user_obj else "Customer",
            "total_amount": o.total_amount,
            "total": o.total_amount,
            "status": o.status,
            "created_at": str(o.created_at),
            "date": str(o.created_at),
            "items": items_list
        })

    return res


# =====================================
# PLACE ORDER
# =====================================

@router.post("/")
def place_order(
    payload: dict,
    db: Session = Depends(get_db)
):
    email = payload.get("email", "guest@gadgetworld.com").strip().lower()
    user = db.query(User).filter(User.email.ilike(email)).first()

    if not user:
        user = User(
            email=email,
            password="customerpass123",
            name=payload.get("name", "Customer"),
            role="customer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    total_amount = float(payload.get("total", payload.get("total_amount", 999.0)))

    order = Order(
        user_id=user.id,
        total_amount=total_amount,
        status="Placed"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Add Order Items
    items = payload.get("items", [])
    for item in items:
        prod_id = item.get("id", 1)
        price = float(item.get("price", 999.0))
        qty = int(item.get("quantity", 1))

        order_item = OrderItem(
            order_id=order.id,
            product_id=prod_id,
            quantity=qty,
            price=price
        )
        db.add(order_item)

    db.commit()

    return {
        "message": "Order Placed Successfully",
        "order_id": order.id,
        "order_number": f"GW-{order.id}",
        "user_id": order.user_id,
        "user_email": user.email,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": str(order.created_at)
    }


# =====================================
# GET SINGLE ORDER
# =====================================

@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user_obj = db.query(User).filter(User.id == order.user_id).first()
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

    items_list = []
    for item in order_items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        items_list.append({
            "product_id": item.product_id,
            "title": prod.product_name if prod else "Electronics Item",
            "price": item.price,
            "quantity": item.quantity,
            "img": prod.image_url if prod else "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100"
        })

    return {
        "id": order.id,
        "order_number": f"GW-{order.id}",
        "user_id": order.user_id,
        "user_email": user_obj.email if user_obj else "",
        "customer": user_obj.name if user_obj else "Customer",
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": str(order.created_at),
        "items": items_list
    }