from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Order, User

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# =====================================
# GET USER ORDERS
# =====================================

@router.get("/")
def get_orders(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return orders


# =====================================
# PLACE ORDER
# =====================================

@router.post("/")
def place_order(
    user_id: int,
    total_amount: float,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    order = Order(
        user_id=user_id,
        total_amount=total_amount,
        status="Placed"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return {
        "message": "Order Placed Successfully",
        "order_id": order.id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at
    }


# =====================================
# GET SINGLE ORDER
# =====================================

@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order