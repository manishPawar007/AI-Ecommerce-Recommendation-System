import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load Amazon/Flipkart Dataset
df = pd.read_csv(
    "../datasets/amazon_flipkart_products_1000.csv",
    encoding="latin1"
)

# Product Data
products = (
    df[
        [
            "id",
            "product_name",
            "brand",
            "category",
            "description",
            "price",
            "rating",
            "stock",
            "image_url"
        ]
    ]
    .drop_duplicates()
    .reset_index(drop=True)
)

# TF-IDF
vectorizer = TfidfVectorizer(
    stop_words="english"
)

tfidf_matrix = vectorizer.fit_transform(
    products["product_name"]
)

similarity_matrix = cosine_similarity(
    tfidf_matrix
)


# Similar Products
def recommend_products(
        product_name,
        top_n=10
):

    matches = products[
        products["product_name"]
        .str.contains(
            product_name,
            case=False,
            na=False
        )
    ]

    if matches.empty:
        return []

    index = matches.index[0]

    scores = list(
        enumerate(
            similarity_matrix[index]
        )
    )

    scores = sorted(
        scores,
        key=lambda x: x[1],
        reverse=True
    )[1:top_n + 1]

    recommendations = []

    for i, score in scores:

        product = products.iloc[i]

        recommendations.append(
            {
                "id": int(product["id"]),
                "product_name": product["product_name"],
                "brand": product["brand"],
                "category": product["category"],
                "description": product["description"],
                "price": float(product["price"]),
                "rating": float(product["rating"]),
                "stock": int(product["stock"]),
                "image_url": product["image_url"],
                "similarity": round(
                    float(score),
                    3
                )
            }
        )

    return recommendations


# Trending Products
def trending_products():

    trending = (
        products
        .sort_values(
            by="rating",
            ascending=False
        )
        .head(20)
    )

    return trending.to_dict(
        orient="records"
    )


# Bought Together
def bought_together(
        product_name,
        top_n=10
):
    return recommend_products(
        product_name,
        top_n
    )