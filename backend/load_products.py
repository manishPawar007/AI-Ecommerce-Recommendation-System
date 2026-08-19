import os
import pandas as pd
from database import SessionLocal, engine
from models import Product, Category, Base

# Ensure all tables exist in PostgreSQL database
Base.metadata.create_all(bind=engine)

db = SessionLocal()

csv_path = "../datasets/amazon_flipkart_products_1000.csv"
if not os.path.exists(csv_path):
    csv_path = "datasets/amazon_flipkart_products_1000.csv"

df = pd.read_csv(csv_path, encoding="latin1")

print(f"Loading {len(df)} products into database...")

# First populate Categories
unique_cats = df["category"].dropna().unique()
for cat_name in unique_cats:
    cat_str = str(cat_name).strip()
    existing_cat = db.query(Category).filter(Category.name.ilike(cat_str)).first()
    if not existing_cat:
        new_cat = Category(
            name=cat_str,
            description=f"Collection of high quality {cat_str} devices and gear."
        )
        db.add(new_cat)

db.commit()

# Now populate Products
inserted_count = 0
updated_count = 0

for _, row in df.iterrows():
    p_id = int(row["id"])
    p_name = str(row["product_name"]) if "product_name" in row and pd.notna(row["product_name"]) else f"Product #{p_id}"
    p_brand = str(row["brand"]) if "brand" in row and pd.notna(row["brand"]) else "Brand"
    p_rating = float(row["rating"]) if "rating" in row and pd.notna(row["rating"]) else 4.5
    p_desc = str(row["description"]) if "description" in row and pd.notna(row["description"]) else ""
    p_cat = str(row["category"]) if "category" in row and pd.notna(row["category"]) else "General"
    p_price = float(row["price"]) if "price" in row and pd.notna(row["price"]) else 999.0
    p_stock = int(row["stock"]) if "stock" in row and pd.notna(row["stock"]) else 50
    p_img = str(row["image_url"]) if "image_url" in row and pd.notna(row["image_url"]) else ""

    existing_product = db.query(Product).filter(Product.id == p_id).first()

    if existing_product:
        existing_product.product_name = p_name
        existing_product.brand = p_brand
        existing_product.rating = p_rating
        existing_product.description = p_desc
        existing_product.category = p_cat
        existing_product.price = p_price
        existing_product.stock = p_stock
        existing_product.image_url = p_img
        updated_count += 1
    else:
        new_product = Product(
            id=p_id,
            product_name=p_name,
            brand=p_brand,
            rating=p_rating,
            description=p_desc,
            category=p_cat,
            price=p_price,
            stock=p_stock,
            image_url=p_img
        )
        db.add(new_product)
        inserted_count += 1

db.commit()
db.close()

print(f"Products Synced Successfully! Inserted: {inserted_count}, Updated: {updated_count}, Total: {inserted_count + updated_count}")