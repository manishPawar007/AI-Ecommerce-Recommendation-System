from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from database import get_db
from ml.recommendation import (
    recommend_products,
    personalized_recommendations,
    bought_together,
    smart_bundle,
    user_persona_insights,
    trending_products,
    smart_search_recommendations
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
def similar_products(
    product_id: Optional[int] = Query(None, description="Product ID to find similar items for"),
    product_name: Optional[str] = Query(None, description="Product Name to find similar items for"),
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    identifier = product_id if product_id is not None else (product_name or "")
    return recommend_products(identifier, top_n=limit, db=db)


@router.get("/personalized")
def personalized(
    user_id: int = Query(1, description="Customer User ID"),
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return personalized_recommendations(user_id=user_id, top_n=limit, db=db)


@router.get("/user-persona")
def get_user_persona(
    user_id: int = Query(1, description="Customer User ID"),
    db: Session = Depends(get_db)
):
    """Returns real-time AI behavioral shopper persona and purchase intent."""
    return user_persona_insights(user_id=user_id, db=db)


@router.get("/bundle")
def get_smart_bundle(
    product_id: int = Query(..., description="Main product ID for smart bundle"),
    db: Session = Depends(get_db)
):
    """Returns 3-piece complete ecosystem bundle with instant 10% discount."""
    return smart_bundle(product_identifier=product_id, db=db)

@router.get("/similar/{product_id}")
def get_similar_by_id(
    product_id: int,
    limit: int = 6
):
    return recommend_products(product_id, top_n=limit)

@router.get("/bought-together")
def frequently_bought(
    product_id: Optional[int] = Query(None, description="Product ID for bundle recommendations"),
    product_name: Optional[str] = Query(None, description="Product Name for bundle recommendations"),
    limit: int = Query(4, ge=1, le=20),
    db: Session = Depends(get_db)
):
    identifier = product_id if product_id is not None else (product_name or "")
    return bought_together(identifier, top_n=limit, db=db)

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
def trending(
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return trending_products(top_n=limit, db=db)


@router.get("/smart-search")
def smart_search(
    query: str = Query(..., min_length=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return smart_search_recommendations(query=query, top_n=limit, db=db)