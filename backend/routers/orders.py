from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional, List, Dict, Any

from database import get_db
from models import Order, OrderItem, Cart, Product, User

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


def _format_order(order: Order) -> Dict[str, Any]:
    """Helper to serialize an order with its items and products."""
    items = []
    if order.items:
        for it in order.items:
            items.append({
                "id": it.id,
                "product_id": it.product_id,
                "product_name": it.product.description if it.product else f"Product #{it.product_id}",
                "category": it.product.category if it.product else "General",
                "image_url": it.product.image_url if it.product else "",
                "price": float(it.price or 0.0),
                "quantity": int(it.quantity or 1),
                "subtotal": float((it.price or 0.0) * (it.quantity or 1))
            })

    return {
        "id": order.id,
        "order_number": f"ORD-{order.id:05d}",
        "user_id": order.user_id,
        "customer_name": order.user.name if order.user else f"User #{order.user_id}",
        "customer_email": order.user.email if order.user else "",
        "total_amount": float(order.total_amount or 0.0),
        "status": order.status or "Placed",
        "created_at": order.created_at.isoformat() if order.created_at else datetime.utcnow().isoformat(),
        "items_count": sum(it["quantity"] for it in items) if items else 0,
        "items": items
    }


# =====================================
# GET USER ORDERS
# =====================================

@router.get("/")
def get_orders(
    user_id: Optional[int] = Query(None, description="Filter by User ID (optional for admin)"),
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.user)
    )

    if user_id is not None:
        query = query.filter(Order.user_id == user_id)

    orders = query.order_by(Order.created_at.desc()).all()
    return [_format_order(o) for o in orders]


# =====================================
# PLACE ORDER
# =====================================

@router.post("/")
@router.post("/checkout")
@router.post("/place")
def place_order(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Place order from cart or specific items payload.
    Automatically creates Order + OrderItems, decrements stock, and clears the cart.
    """
    user_id = int(payload.get("user_id", 1))
    total_amount = float(payload.get("total_amount", 0.0))
    shipping_address = payload.get("shipping_address", "")
    payment_method = payload.get("payment_method", "Cash on Delivery")
    custom_items = payload.get("items", None)

    user = db.query(User).filter(User.id == user_id).first()
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

    # If items list not provided in payload, fetch from active cart
    items_to_order = []
    if custom_items and isinstance(custom_items, list) and len(custom_items) > 0:
        for item_data in custom_items:
            pid = int(item_data.get("product_id", 0))
            qty = int(item_data.get("quantity", 1))
            prod = db.query(Product).filter(Product.id == pid).first()
            if prod:
                price = float(item_data.get("price", prod.price))
                items_to_order.append({"product": prod, "quantity": qty, "price": price})
    else:
        cart_items = db.query(Cart).options(joinedload(Cart.product)).filter(Cart.user_id == user_id).all()
        if not cart_items:
            raise HTTPException(
                status_code=400,
                detail="Your cart is empty. Add items before checking out."
            )
        for ci in cart_items:
            if ci.product:
                items_to_order.append({"product": ci.product, "quantity": ci.quantity, "price": float(ci.product.price)})

    if not items_to_order:
        raise HTTPException(
            status_code=400,
            detail="No valid items to place order."
        )

    # Calculate computed total if not supplied
    computed_subtotal = sum(it["price"] * it["quantity"] for it in items_to_order)
    tax = computed_subtotal * 0.18
    shipping = 0.0 if computed_subtotal >= 999 else 99.0
    computed_total = computed_subtotal + tax + shipping

    final_total = total_amount if total_amount > 0 else computed_total

    # 1. Create Order
    new_order = Order(
        user_id=user_id,
        total_amount=round(final_total, 2),
        status="Placed",
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.flush()  # get new_order.id

    # 2. Create Order Items & Decrement Stock
    for item in items_to_order:
        prod = item["product"]
        qty = item["quantity"]
        unit_price = item["price"]

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=prod.id,
            quantity=qty,
            price=unit_price
        )
        db.add(order_item)

        # Decrement stock safely
        if prod.stock is not None and prod.stock >= qty:
            prod.stock -= qty
        else:
            prod.stock = 0

    # 3. Clear User's Cart
    db.query(Cart).filter(Cart.user_id == user_id).delete(synchronize_session=False)

    db.commit()
    db.refresh(new_order)

    # Fetch loaded order
    loaded_order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user)
        )
        .filter(Order.id == new_order.id)
        .first()
    )

    return {
        "success": True,
        "message": "Order Placed Successfully! Your order is being processed.",
        "order": _format_order(loaded_order)
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
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user)
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail=f"Order #{order_id} not found"
        )

    return _format_order(order)


# =====================================
# CANCEL ORDER (Customer or Admin)
# =====================================

@router.put("/{order_id}/cancel")
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in ["Delivered", "Cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled because it is already {order.status}"
        )

    order.status = "Cancelled"

    # Restore stock
    if order.items:
        for item in order.items:
            if item.product:
                item.product.stock = (item.product.stock or 0) + item.quantity

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "Order Cancelled Successfully. Inventory has been restored.",
        "order": _format_order(order)
    }