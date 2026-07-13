from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Cart, Product

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


# ==========================
# Add To Cart
# ==========================
@router.post("/")
def add_to_cart(
    product_id: int,
    quantity: int = 1,
    user_id: int = 1,
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

    cart_item = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id
        )
        .first()
    )

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = Cart(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)

    return {
        "success": True,
        "message": "Product Added To Cart Successfully",
        "cart_id": cart_item.id
    }


# ==========================
# Get Cart
# ==========================
@router.get("/")
def get_cart(
    user_id: int = 1,
    db: Session = Depends(get_db)
):

    items = (
        db.query(Cart)
        .options(joinedload(Cart.product))
        .filter(Cart.user_id == user_id)
        .all()
    )

    return items


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