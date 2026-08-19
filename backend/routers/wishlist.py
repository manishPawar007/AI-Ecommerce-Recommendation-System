from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, Dict, Any
from datetime import datetime

from database import get_db
from models import Wishlist, Product, Cart, User

router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)


def _format_wishlist_item(item: Wishlist) -> Dict[str, Any]:
    prod = item.product
    return {
        "id": item.id,
        "wishlist_id": item.id,
        "user_id": item.user_id,
        "product_id": item.product_id,
        "created_at": item.created_at.isoformat() if item.created_at else datetime.utcnow().isoformat(),
        "product": {
            "id": prod.id if prod else item.product_id,
            "product_name": prod.description if prod else "Product",
            "description": prod.description if prod else "",
            "category": prod.category if prod else "General",
            "price": float(prod.price or 0.0) if prod else 0.0,
            "stock": prod.stock if prod else 0,
            "image_url": prod.image_url if prod else ""
        } if prod else None
    }


# ==========================
# Get User Wishlist
# ==========================
@router.get("/")
def get_wishlist(
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    items = (
        db.query(Wishlist)
        .options(joinedload(Wishlist.product))
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )

    formatted = [_format_wishlist_item(it) for it in items]
    return {
        "items": formatted,
        "count": len(formatted)
    }


# ==========================
# Add / Toggle Wishlist Item
# ==========================
@router.post("/")
def toggle_wishlist(
    product_id: int = Query(...),
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return {
            "success": True,
            "action": "removed",
            "message": f"Removed '{product.description[:25]}...' from Wishlist",
            "is_in_wishlist": False
        }
    else:
        new_item = Wishlist(
            user_id=user_id,
            product_id=product_id,
            created_at=datetime.utcnow()
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {
            "success": True,
            "action": "added",
            "message": f"Added '{product.description[:25]}...' to Wishlist ❤️",
            "is_in_wishlist": True,
            "wishlist_id": new_item.id
        }


# ==========================
# Remove Item from Wishlist
# ==========================
@router.delete("/{item_id}")
def remove_from_wishlist(
    item_id: int,
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    # Try finding by wishlist id or product id
    item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            (Wishlist.id == item_id) | (Wishlist.product_id == item_id)
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Wishlist item not found"
        )

    db.delete(item)
    db.commit()

    return {
        "success": True,
        "message": "Item Removed from Wishlist"
    }


# ==========================
# Move Wishlist Item To Cart
# ==========================
@router.post("/move-to-cart")
def move_to_cart(
    product_id: int = Query(...),
    user_id: int = Query(1),
    db: Session = Depends(get_db)
):
    # 1. Check Product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock is not None and product.stock <= 0:
        raise HTTPException(status_code=400, detail="Product is out of stock")

    # 2. Remove from Wishlist
    db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == product_id
    ).delete(synchronize_session=False)

    # 3. Add to Cart
    cart_item = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id
        )
        .first()
    )
    if cart_item:
        cart_item.quantity += 1
    else:
        cart_item = Cart(
            user_id=user_id,
            product_id=product_id,
            quantity=1
        )
        db.add(cart_item)

    db.commit()

    return {
        "success": True,
        "message": f"Moved '{product.description[:30]}...' to your Cart!"
    }
