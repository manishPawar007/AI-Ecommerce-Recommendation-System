from fastapi import APIRouter
from ml.recommendation import (
    recommend_products,
    bought_together,
    trending_products
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


@router.get("/similar")
def similar_products(
        product_name: str
):
    return recommend_products(
        product_name
    )


@router.get("/bought-together")
def frequently_bought(
        product_name: str
):
    return bought_together(
        product_name
    )


@router.get("/trending")
def trending():
    return trending_products()