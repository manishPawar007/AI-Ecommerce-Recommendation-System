import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

<<<<<<< HEAD

# Load Dataset
=======
# Load Amazon/Flipkart Dataset
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
df = pd.read_csv(
    "../datasets/amazon_flipkart_products_1000.csv",
    encoding="latin1"
)

<<<<<<< HEAD

=======
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
# Product Data
products = (
    df[
        [
            "id",
            "product_name",
            "brand",
            "category",
<<<<<<< HEAD
=======
            "description",
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
            "price",
            "rating",
            "stock",
            "image_url"
        ]
    ]
    .drop_duplicates()
    .reset_index(drop=True)
)

<<<<<<< HEAD

# TF-IDF Vectorization
=======
# TF-IDF
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
vectorizer = TfidfVectorizer(
    stop_words="english"
)

tfidf_matrix = vectorizer.fit_transform(
    products["product_name"]
)

similarity_matrix = cosine_similarity(
    tfidf_matrix
)


<<<<<<< HEAD
# Similar Product Recommendation
=======
# Similar Products
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
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
<<<<<<< HEAD
                "id": int(
                    product["id"]
                ),
                "product_name":
                    product["product_name"],
                "brand":
                    product["brand"],
                "category":
                    product["category"],
                "price":
                    float(
                        product["price"]
                    ),
                "rating":
                    float(
                        product["rating"]
                    ),
                "stock":
                    int(
                        product["stock"]
                    ),
                "image_url":
                    product["image_url"],
                "similarity":
                    round(
                        float(score),
                        3
                    )
=======
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
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
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
<<<<<<< HEAD

=======
>>>>>>> c524416a5c176c6b4bdbabe988be5797983a02d9
    return recommend_products(
        product_name,
        top_n
    )