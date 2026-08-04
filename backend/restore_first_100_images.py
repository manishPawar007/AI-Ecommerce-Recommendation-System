import os
import subprocess
import pandas as pd
from database import SessionLocal, engine
from models import Product

csv_path = "../datasets/amazon_flipkart_products_1000.csv"
if not os.path.exists(csv_path):
    csv_path = "datasets/amazon_flipkart_products_1000.csv"

# Load current 200 products CSV
df_current = pd.read_csv(csv_path, encoding="latin1")

# Extract original first 100 products from git HEAD
try:
    git_cmd = ["git", "show", "HEAD:datasets/amazon_flipkart_products_1000.csv"]
    output = subprocess.check_output(git_cmd, encoding="latin1")
    from io import StringIO
    df_head = pd.read_csv(StringIO(output), encoding="latin1")
    print(f"Successfully loaded {len(df_head)} original rows from git HEAD")
    
    # Restore original image_url for first 100 items
    for idx in range(min(100, len(df_head))):
        orig_img = df_head.iloc[idx]["image_url"]
        df_current.at[idx, "image_url"] = orig_img

except Exception as e:
    print("Could not fetch git HEAD directly, using current df first 100 rows", e)

# Save updated 200 products CSV
df_current.to_csv(csv_path, index=False, encoding="latin1")
print("Saved 200 products to CSV with original first 100 images restored!")

# Sync to PostgreSQL Database
db = SessionLocal()

for idx, row in df_current.iterrows():
    p_id = int(row["id"])
    p_img = str(row["image_url"])
    
    product = db.query(Product).filter(Product.id == p_id).first()
    if product:
        product.image_url = p_img

db.commit()
db.close()

print("PostgreSQL Database successfully synced with restored images!")
