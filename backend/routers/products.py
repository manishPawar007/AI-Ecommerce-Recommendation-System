from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Product

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.get("/")
def get_products(
        skip: int = 0,
        limit: int = 20,
        db: Session = Depends(get_db)
):

    return (
        db.query(Product)
        .offset(skip)
        .limit(limit)
        .all()
    )

@router.get("/search")
def search_products(
        keyword: str,
        db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .filter(
            Product.description
            .ilike(
                f"%{keyword}%"
            )
        )
        .all()
    )

    return products

@router.get("/filter")
def filter_products(
    min_price: float = 0,
    max_price: float = 100000,
    db: Session = Depends(get_db)
):
    return (
        db.query(Product)
        .filter(
            Product.price >= min_price,
            Product.price <= max_price
)
        .all()
    )


@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )