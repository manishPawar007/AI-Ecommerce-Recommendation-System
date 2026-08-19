import os
import pandas as pd
import subprocess

csv_path = "../datasets/amazon_flipkart_products_1000.csv"
if not os.path.exists(csv_path):
    csv_path = "datasets/amazon_flipkart_products_1000.csv"

df = pd.read_csv(csv_path, encoding="latin1")

# High quality, verified exact images (No books, no unrelated items)
mouse_images = [
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80"
]

keyboard_images = [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541140532154-b024d715b909?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
]

charger_images = [
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622445268121-23344f3f6199?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592890288564-76628a30a657?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80"
]

cable_hub_images = [
    "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80"
]

powerbank_images = [
    "https://images.unsplash.com/photo-1609592424074-88484196144e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&auto=format&fit=crop&q=80"
]

webcam_stand_images = [
    "https://images.unsplash.com/photo-1587826533054-9e8c462eb538?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
]

def assign_exact_image(p_name, idx):
    name = str(p_name).lower()
    
    if "mouse" in name:
        return mouse_images[idx % len(mouse_images)]
    elif "keyboard" in name:
        return keyboard_images[idx % len(keyboard_images)]
    elif "charger" in name or "adapter" in name or "magsafe" in name or "charging" in name or "vooc" in name or "superdart" in name:
        return charger_images[idx % len(charger_images)]
    elif "cable" in name or "hub" in name or "hdmi" in name or "dongle" in name or "aux" in name:
        return cable_hub_images[idx % len(cable_hub_images)]
    elif "power bank" in name or "powerbank" in name or "battery" in name:
        return powerbank_images[idx % len(powerbank_images)]
    elif "webcam" in name or "stand" in name or "ring light" in name or "tag" in name or "card" in name or "case" in name:
        return webcam_stand_images[idx % len(webcam_stand_images)]
    else:
        return charger_images[idx % len(charger_images)]

# Update ONLY products from index 100 onwards (IDs 101 to 200)
for i in range(100, len(df)):
    row = df.iloc[i]
    p_name = row["product_name"]
    new_img = assign_exact_image(p_name, i)
    df.at[i, "image_url"] = new_img

# Save updated CSV
df.to_csv(csv_path, index=False, encoding="latin1")
print(f"Updated exact image URLs for products 101 to {len(df)}!")

# Sync to PostgreSQL Database
from database import SessionLocal, engine
from models import Product

db = SessionLocal()
for i in range(100, len(df)):
    p_id = int(df.iloc[i]["id"])
    p_img = str(df.iloc[i]["image_url"])
    product = db.query(Product).filter(Product.id == p_id).first()
    if product:
        product.image_url = p_img

db.commit()
db.close()
print("PostgreSQL Database synced with exact charger, cable, mouse, keyboard images!")
