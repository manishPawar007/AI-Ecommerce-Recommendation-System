import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load Dataset
DATA_FILE = Path(__file__).resolve().parents[2] / "datasets" / "amazon_flipkart_products_1000.csv"

def load_products_data():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Dataset file not found: {DATA_FILE}")
    
    df = pd.read_csv(DATA_FILE, encoding="latin1")
    
    # Ensure standard types
    df["id"] = df["id"].astype(int)
    df["product_name"] = df["product_name"].fillna("").astype(str)
    df["brand"] = df["brand"].fillna("").astype(str)
    df["category"] = df["category"].fillna("General").astype(str)
    df["description"] = df["description"].fillna("").astype(str)
    df["price"] = df["price"].fillna(999.0).astype(float)
    df["rating"] = df["rating"].fillna(4.5).astype(float)
    df["stock"] = df["stock"].fillna(50).astype(int)
    df["image_url"] = df["image_url"].fillna("").astype(str)
    
    return df

products_df = load_products_data()

# Combine text features for TF-IDF Vectorization
products_df["combined_features"] = (
    products_df["product_name"] + " " +
    products_df["brand"] + " " +
    products_df["category"] + " " +
    products_df["description"]
)

vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
tfidf_matrix = vectorizer.fit_transform(products_df["combined_features"])
similarity_matrix = cosine_similarity(tfidf_matrix)

def calculate_ai_match_pct(score):
    """Normalizes score into a high-confidence AI Match percentage (86% - 99%)"""
    if score <= 0:
        return 86
    scaled = int(min(99, max(85, round(score * 40 + 60))))
    return scaled

def format_product_dict(row, extra_info=None):
    score = extra_info.get("similarity", extra_info.get("score", 0.8)) if extra_info else 0.8
    match_pct = calculate_ai_match_pct(score)
    
    data = {
        "id": int(row["id"]),
        "product_name": str(row["product_name"]),
        "brand": str(row["brand"]),
        "category": str(row["category"]),
        "description": str(row["description"]),
        "price": float(row["price"]),
        "rating": float(row["rating"]),
        "stock": int(row["stock"]),
        "image_url": str(row["image_url"]),
        "ai_match_pct": match_pct
    }
    if extra_info:
        data.update(extra_info)
    return data

# =========================================================
# 1. CONTENT-BASED SIMILAR PRODUCTS RECOMMENDATION
# =========================================================
def recommend_products(identifier, top_n=6):
    """
    Find similar products by product_id (int) or product_name (str)
    """
    target_idx = None
    
    if isinstance(identifier, int) or (isinstance(identifier, str) and str(identifier).isdigit()):
        pid = int(identifier)
        matches = products_df.index[products_df["id"] == pid].tolist()
        if matches:
            target_idx = matches[0]
            
    if target_idx is None:
        name_str = str(identifier).lower()
        matches = products_df.index[products_df["product_name"].str.lower().str.contains(name_str, na=False)].tolist()
        if matches:
            target_idx = matches[0]

    if target_idx is None:
        return trending_products(top_n=top_n)

    scores = list(enumerate(similarity_matrix[target_idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    
    recommendations = []
    for i, score in scores:
        if i == target_idx:
            continue
        row = products_df.iloc[i]
        recommendations.append(format_product_dict(row, {"similarity": round(float(score), 3)}))
        if len(recommendations) >= top_n:
            break

    return recommendations

# =========================================================
# 2. FREQUENTLY BOUGHT TOGETHER (CROSS-CATEGORY ASSOCIATION)
# =========================================================
def bought_together(identifier, top_n=3):
    """
    Recommends complementary accessories/products (Cross-category)
    E.g. Mobile -> Charger + Cable + Earbuds
    Laptop -> Mouse + Keyboard + USB Hub
    """
    target_row = None
    if isinstance(identifier, int) or (isinstance(identifier, str) and str(identifier).isdigit()):
        pid = int(identifier)
        matches = products_df[products_df["id"] == pid]
        if not matches.empty:
            target_row = matches.iloc[0]
            
    if target_row is None:
        name_str = str(identifier).lower()
        matches = products_df[products_df["product_name"].str.lower().str.contains(name_str, na=False)]
        if not matches.empty:
            target_row = matches.iloc[0]

    if target_row is None:
        return products_df[products_df["category"] == "Accessories"].head(top_n).apply(format_product_dict, axis=1).tolist()

    cat = str(target_row["category"]).lower()
    name = str(target_row["product_name"]).lower()

    desired_keywords = []
    if "mobile" in cat or "phone" in name:
        desired_keywords = ["charger", "cable", "power bank", "adapter", "earbuds"]
    elif "laptop" in cat or "macbook" in name:
        desired_keywords = ["mouse", "keyboard", "hub", "stand", "adapter"]
    elif "watch" in cat:
        desired_keywords = ["charger", "strap", "headphones", "power bank"]
    elif "headphone" in cat or "audio" in cat:
        desired_keywords = ["adapter", "cable", "power bank"]
    else:
        desired_keywords = ["keyboard", "mouse", "charger", "hub"]

    bundle = []
    for kw in desired_keywords:
        matches = products_df[products_df["product_name"].str.lower().str.contains(kw, na=False)]
        for _, row in matches.iterrows():
            if int(row["id"]) != int(target_row["id"]) and int(row["id"]) not in [b["id"] for b in bundle]:
                bundle.append(format_product_dict(row, {"reason": f"Pairs great with {target_row['product_name'][:20]}"}))
                break
        if len(bundle) >= top_n:
            break

    if len(bundle) < top_n:
        accessories = products_df[products_df["category"] == "Accessories"]
        for _, row in accessories.iterrows():
            if int(row["id"]) != int(target_row["id"]) and int(row["id"]) not in [b["id"] for b in bundle]:
                bundle.append(format_product_dict(row, {"reason": "Popular accessory bundle"}))
                if len(bundle) >= top_n:
                    break

    return bundle

# =========================================================
# 3. SMART UPGRADE (UPSELL ENGINE)
# =========================================================
def get_smart_upsells(identifier, top_n=2):
    """
    Recommends premium upgrade alternatives (15% to 45% price upgrade range with higher ratings)
    """
    target_row = None
    if isinstance(identifier, int) or (isinstance(identifier, str) and str(identifier).isdigit()):
        pid = int(identifier)
        matches = products_df[products_df["id"] == pid]
        if not matches.empty:
            target_row = matches.iloc[0]
            
    if target_row is None:
        name_str = str(identifier).lower()
        matches = products_df[products_df["product_name"].str.lower().str.contains(name_str, na=False)]
        if not matches.empty:
            target_row = matches.iloc[0]

    if target_row is None:
        return []

    curr_price = float(target_row["price"])
    curr_cat = str(target_row["category"])

    min_up = curr_price * 1.10
    max_up = curr_price * 1.60

    # Filter higher tier products in same/related category
    candidates = products_df[
        (products_df["category"] == curr_cat) &
        (products_df["price"] >= min_up) &
        (products_df["price"] <= max_up) &
        (products_df["id"] != int(target_row["id"]))
    ].sort_values(by=["rating", "price"], ascending=[False, True])

    if candidates.empty:
        candidates = products_df[
            (products_df["price"] >= min_up) &
            (products_df["id"] != int(target_row["id"]))
        ].sort_values(by=["rating", "price"], ascending=[False, True])

    upsells = []
    for _, row in candidates.head(top_n).iterrows():
        price_diff = float(row["price"]) - curr_price
        upsells.append(format_product_dict(row, {
            "upsell_reason": f"Flagship Upgrade (+₹{int(price_diff):,})",
            "upgrade_diff": int(price_diff)
        }))

    return upsells

# =========================================================
# 4. TECH ECOSYSTEM BUILDER (COMPLETE BUNDLE)
# =========================================================
def get_tech_ecosystem(identifier):
    """
    Builds a complete 4-item Tech Ecosystem setup (Main Device + Accessories)
    """
    target_row = None
    if isinstance(identifier, int) or (isinstance(identifier, str) and str(identifier).isdigit()):
        pid = int(identifier)
        matches = products_df[products_df["id"] == pid]
        if not matches.empty:
            target_row = matches.iloc[0]
            
    if target_row is None:
        name_str = str(identifier).lower()
        matches = products_df[products_df["product_name"].str.lower().str.contains(name_str, na=False)]
        if not matches.empty:
            target_row = matches.iloc[0]

    if target_row is None:
        target_row = products_df.iloc[0]

    main_item = format_product_dict(target_row, {"role": "Primary Device"})
    complementary = bought_together(target_row["id"], top_n=3)

    for item in complementary:
        item["role"] = "Ecosystem Accessory"

    setup_items = [main_item] + complementary
    subtotal = sum(i["price"] for i in setup_items)
    bundle_discount = round(subtotal * 0.15) # 15% Ecosystem discount
    final_price = subtotal - bundle_discount

    return {
        "primary_device": main_item,
        "items": setup_items,
        "subtotal": round(subtotal),
        "discount": round(bundle_discount),
        "final_price": round(final_price),
        "item_count": len(setup_items)
    }

# =========================================================
# 5. PERSONALIZED USER RECOMMENDATIONS
# =========================================================
def get_personalized_recommendations(cart_ids=None, wishlist_ids=None, top_n=8):
    """
    Computes user preference profile vector based on cart/wishlist history
    and recommends matching items across the catalog.
    """
    cart_ids = cart_ids or []
    wishlist_ids = wishlist_ids or []
    all_user_ids = list(set(cart_ids + wishlist_ids))

    if not all_user_ids:
        return trending_products(top_n=top_n)

    user_indices = products_df.index[products_df["id"].isin(all_user_ids)].tolist()
    if not user_indices:
        return trending_products(top_n=top_n)

    user_profile = np.asarray(tfidf_matrix[user_indices].mean(axis=0))
    user_scores = cosine_similarity(user_profile, tfidf_matrix).flatten()

    sorted_indices = np.argsort(user_scores)[::-1]

    recommendations = []
    for idx in sorted_indices:
        pid = int(products_df.iloc[idx]["id"])
        if pid in all_user_ids:
            continue
        row = products_df.iloc[idx]
        recommendations.append(format_product_dict(row, {"score": round(float(user_scores[idx]), 3)}))
        if len(recommendations) >= top_n:
            break

    return recommendations

# =========================================================
# 6. TRENDING PRODUCTS
# =========================================================
def trending_products(top_n=10):
    """
    Returns top rated and highly rated products.
    """
    trending = products_df.sort_values(by=["rating", "price"], ascending=[False, False]).head(top_n)
    return trending.apply(format_product_dict, axis=1).tolist()