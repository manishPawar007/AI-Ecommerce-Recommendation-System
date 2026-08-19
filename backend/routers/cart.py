from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session, joinedload
from typing import Optional, Dict, Any

from database import get_db
from models import Cart, Product, User

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


def _format_cart_item(item: Cart) -> Dict[str, Any]:
    prod = item.product
    price = float(prod.price if prod and prod.price is not None else 0.0)
    qty = int(item.quantity or 1)
    return {
        "id": item.id,
        "cart_id": item.id,
        "user_id": item.user_id,
        "product_id": item.product_id,
        "quantity": qty,
        "product": {
            "id": prod.id if prod else item.product_id,
            "product_name": prod.description if prod else "Product",
            "description": prod.description if prod else "",
            "category": prod.category if prod else "General",
            "price": price,
            "stock": prod.stock if prod else 0,
            "image_url": prod.image_url if prod else ""
        } if prod else None,
        "unit_price": price,
        "subtotal": round(price * qty, 2)
    }


# ==========================
# Add To Cart
# ==========================
@router.post("/")
def add_to_cart(
    product_id: int = Query(...),
    quantity: int = Query(1, ge=1),
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if product.stock is not None and product.stock <= 0:
        raise HTTPException(
            status_code=400,
            detail="Sorry, this product is currently out of stock."
        )

    cart_item = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id
        )
        .first()
    )

    if cart_item:
        new_qty = cart_item.quantity + quantity
        if product.stock is not None and new_qty > product.stock:
            cart_item.quantity = product.stock
        else:
            cart_item.quantity = new_qty
    else:
        cart_item = Cart(
            user_id=user_id,
            product_id=product_id,
            quantity=min(quantity, product.stock) if product.stock else quantity
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)

    # Fetch loaded cart item with product relationship
    loaded = db.query(Cart).options(joinedload(Cart.product)).filter(Cart.id == cart_item.id).first()

    return {
        "success": True,
        "message": f"Added '{product.description[:30]}...' to your Cart",
        "cart_item": _format_cart_item(loaded)
    }


# ==========================
# Get Cart
# ==========================
@router.get("/")
def get_cart(
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    items = (
        db.query(Cart)
        .options(joinedload(Cart.product))
        .filter(Cart.user_id == user_id)
        .order_by(Cart.id.desc())
        .all()
    )

    formatted_items = [_format_cart_item(it) for it in items]
    subtotal = sum(it["subtotal"] for it in formatted_items)
    tax = round(subtotal * 0.18, 2)
    shipping = 0.0 if subtotal >= 999 or subtotal == 0 else 99.0
    total = round(subtotal + tax + shipping, 2)

    return {
        "items": formatted_items,
        "count": len(formatted_items),
        "total_items": sum(it["quantity"] for it in formatted_items),
        "subtotal": round(subtotal, 2),
        "tax": tax,
        "shipping": shipping,
        "total": total
    }


# ==========================
# Update Item Quantity
# ==========================
@router.put("/{cart_id}")
def update_cart_quantity(
    cart_id: int,
    quantity: int = Query(..., ge=1),
    db: Session = Depends(get_db)
):
    item = (
        db.query(Cart)
        .options(joinedload(Cart.product))
        .filter(Cart.id == cart_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Cart Item Not Found"
        )

    if item.product and item.product.stock is not None and quantity > item.product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {item.product.stock} units available in stock."
        )

    item.quantity = quantity
    db.commit()
    db.refresh(item)

    return {
        "success": True,
        "message": "Cart Updated",
        "cart_item": _format_cart_item(item)
    }


# ==========================
# Remove Item
# ==========================
@router.delete("/{cart_id}")
def remove_cart(
    cart_id: int,
    db: Session = Depends(get_db)
):
    item = (
        db.query(Cart)
        .filter(Cart.id == cart_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Cart Item Not Found"
        )

    db.delete(item)
    db.commit()

    return {
        "success": True,
        "message": "Item Removed Successfully"
    }


# ==========================
# Clear All Cart Items
# ==========================
@router.delete("/clear/all")
def clear_cart(
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    deleted_count = db.query(Cart).filter(Cart.user_id == user_id).delete(synchronize_session=False)
    db.commit()

    return {
        "success": True,
        "message": f"Cleared {deleted_count} items from cart."
    }