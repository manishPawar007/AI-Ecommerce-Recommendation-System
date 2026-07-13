import pandas as pd

from database import SessionLocal
from models import Product

db = SessionLocal()

df = pd.read_csv(
    "../datasets/amazon_flipkart_products_1000.csv",
    encoding="latin1"
)

for _, row in df.iterrows():

    # Duplicate products skip karo
    existing_product = (
        db.query(Product)
        .filter(
            Product.id == int(row["id"])
        )
        .first()
    )

    if existing_product:
        continue

    product = Product(
        id=int(row["id"]),
        description=str(
            row["description"]
        ),
        category=str(
            row["category"]
        ),
        price=float(
            row["price"]
        ),
        stock=int(
            row["stock"]
        ),
        image_url=str(
            row["image_url"]
        )
    )

    db.add(product)

db.commit()
db.close()

print(
    "Products Imported Successfully"
)