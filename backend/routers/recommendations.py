from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel

from ml.recommendation import (
    recommend_products,
    bought_together,
    get_smart_upsells,
    get_tech_ecosystem,
    get_personalized_recommendations,
    trending_products
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)

class PersonalizeRequest(BaseModel):
    cart_ids: Optional[List[int]] = []
    wishlist_ids: Optional[List[int]] = []
    top_n: Optional[int] = 8

@router.get("/similar")
def get_similar_query(
    product_name: Optional[str] = "",
    product_id: Optional[int] = None,
    limit: int = 6
):
    identifier = product_id if product_id is not None else product_name
    return recommend_products(identifier, top_n=limit)

@router.get("/similar/{product_id}")
def get_similar_by_id(
    product_id: int,
    limit: int = 6
):
    return recommend_products(product_id, top_n=limit)

@router.get("/bought-together")
def get_bought_together_query(
    product_name: Optional[str] = "",
    product_id: Optional[int] = None,
    limit: int = 3
):
    identifier = product_id if product_id is not None else product_name
    return bought_together(identifier, top_n=limit)

@router.get("/bought-together/{product_id}")
def get_bought_together_by_id(
    product_id: int,
    limit: int = 3
):
    return bought_together(product_id, top_n=limit)

@router.get("/upsell/{product_id}")
def get_upsells_by_id(
    product_id: int,
    limit: int = 2
):
    return get_smart_upsells(product_id, top_n=limit)

@router.get("/ecosystem/{product_id}")
def get_ecosystem_by_id(
    product_id: int
):
    return get_tech_ecosystem(product_id)

@router.get("/personalized")
def get_personalized(
    cart_ids: str = Query("", description="Comma separated cart product IDs"),
    wishlist_ids: str = Query("", description="Comma separated wishlist product IDs"),
    limit: int = 8
):
    c_ids = [int(x.strip()) for x in cart_ids.split(",") if x.strip().isdigit()]
    w_ids = [int(x.strip()) for x in wishlist_ids.split(",") if x.strip().isdigit()]
    return get_personalized_recommendations(c_ids, w_ids, top_n=limit)

@router.post("/personalized")
def post_personalized(req: PersonalizeRequest):
    return get_personalized_recommendations(req.cart_ids, req.wishlist_ids, top_n=req.top_n or 8)

@router.get("/trending")
def get_trending(limit: int = 10):
    return trending_products(top_n=limit)