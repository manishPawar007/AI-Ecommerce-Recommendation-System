from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy import or_, desc, asc, func
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional, List, Dict, Any

from database import get_db
from models import Product, Review, User, Category

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


def _format_product(p: Product) -> Dict[str, Any]:
    reviews = p.reviews or []
    avg_rating = 4.5
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)

    return {
        "id": p.id,
        "product_name": p.description,
        "description": p.description,
        "category": p.category or "General",
        "price": float(p.price or 0.0),
        "stock": int(p.stock or 0),
        "image_url": p.image_url or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
        "rating": round(float(avg_rating), 1),
        "review_count": len(reviews),
        "is_low_stock": bool(p.stock is not None and 0 < p.stock <= 10),
        "is_out_of_stock": bool(p.stock is not None and p.stock <= 0)
    }


# ==========================================
# Get All Products (Filter, Sort, Paginate)
# ==========================================
@router.get("/")
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: float = Query(0.0, ge=0),
    max_price: float = Query(500000.0, ge=0),
    in_stock_only: bool = Query(False),
    sort_by: str = Query("featured", description="featured, price_asc, price_desc, rating, newest"),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(joinedload(Product.reviews))

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.description.ilike(term),
                Product.category.ilike(term)
            )
        )

    # Category filter
    if category and category.strip() and category.lower() != "all":
        query = query.filter(Product.category.ilike(category.strip()))

    # Price filter
    query = query.filter(Product.price >= min_price, Product.price <= max_price)

    # Stock filter
    if in_stock_only:
        query = query.filter(Product.stock > 0)

    # Total Count before pagination
    total_count = query.count()

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort_by == "newest":
        query = query.order_by(desc(Product.id))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.stock))  # fallback ranking
    else:
        query = query.order_by(asc(Product.id))

    products = query.offset(skip).limit(limit).all()

    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "products": [_format_product(p) for p in products]
    }


# ==========================================
# Get Categories List with Counts
# ==========================================
@router.get("/categories/list")
def get_categories_list(db: Session = Depends(get_db)):
    results = (
        db.query(
            Product.category,
            func.count(Product.id).label("product_count"),
            func.min(Product.price).label("min_price"),
            func.max(Product.price).label("max_price")
        )
        .filter(Product.category.isnot(None))
        .group_by(Product.category)
        .order_by(desc("product_count"))
        .all()
    )

    icons = {
        "Mobiles": "📱",
        "Laptops": "💻",
        "Headphones": "🎧",
        "Smart Watches": "⌚",
        "Electronics": "⚡",
        "Accessories": "🔌",
        "Audio": "🔊",
        "Cameras": "📷"
    }

    categories = []
    for r in results:
        cat_name = r[0] or "General"
        categories.append({
            "name": cat_name,
            "product_count": r[1],
            "min_price": float(r[2] or 0),
            "max_price": float(r[3] or 0),
            "icon": icons.get(cat_name, "🛍")
        })

    return categories


# ==========================================
# Search Products Quick
# ==========================================
@router.get("/search")
def search_products(
    keyword: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    term = f"%{keyword.strip()}%"
    products = (
        db.query(Product)
        .options(joinedload(Product.reviews))
        .filter(
            or_(
                Product.description.ilike(term),
                Product.category.ilike(term)
            )
        )
        .limit(limit)
        .all()
    )

    return [_format_product(p) for p in products]


# ==========================================
# Filter Products by Price
# ==========================================
@router.get("/filter")
def filter_products(
    min_price: float = 0,
    max_price: float = 1000000,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(
        Product.price >= min_price,
        Product.price <= max_price
    )
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(category))

    products = query.limit(50).all()
    return [_format_product(p) for p in products]


# ==========================================
# Get Single Product Details & Reviews
# ==========================================
@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .options(joinedload(Product.reviews).joinedload(Review.user))
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    formatted = _format_product(product)

    # Include detailed reviews
    reviews_data = []
    if product.reviews:
        for r in product.reviews:
            reviews_data.append({
                "id": r.id,
                "user_id": r.user_id,
                "user_name": r.user.name if r.user else "Verified Buyer",
                "rating": r.rating,
                "comment": r.comment or "",
                "created_at": r.created_at.isoformat() if r.created_at else datetime.utcnow().isoformat()
            })

    formatted["reviews"] = reviews_data
    return formatted


# ==========================================
# Add Customer Review for Product
# ==========================================
@router.post("/{product_id}/reviews")
def add_review(
    product_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    user_id = int(payload.get("user_id", 1))
    rating = int(payload.get("rating", 5))
    comment = str(payload.get("comment", "")).strip()

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_review = Review(
        product_id=product_id,
        user_id=user_id,
        rating=max(1, min(5, rating)),
        comment=comment,
        created_at=datetime.utcnow()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "success": True,
        "message": "Thank you! Your review has been published.",
        "review": {
            "id": new_review.id,
            "rating": new_review.rating,
            "comment": new_review.comment,
            "user_name": user.name,
            "created_at": new_review.created_at.isoformat()
        }
    }