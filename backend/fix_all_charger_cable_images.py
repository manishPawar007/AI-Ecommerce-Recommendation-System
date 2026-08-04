import os
import pandas as pd
from database import SessionLocal, engine
from models import Product

csv_path = "../datasets/amazon_flipkart_products_1000.csv"
if not os.path.exists(csv_path):
    csv_path = "datasets/amazon_flipkart_products_1000.csv"

df = pd.read_csv(csv_path, encoding="latin1")

# Clean, verified electronics image pools (ONLY actual devices, NO notebooks/pens/people)
verified_chargers = [
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622445268121-23344f3f6199?w=800&auto=format&fit=crop&q=80"
]

verified_cables = [
    "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80"
]

verified_mice = [
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=800&auto=format&fit=crop&q=80"
]

verified_keyboards = [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541140532154-b024d715b909?w=800&auto=format&fit=crop&q=80"
]

verified_powerbanks = [
    "https://images.unsplash.com/photo-1609592424074-88484196144e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=800&auto=format&fit=crop&q=80"
]

verified_webcam_stands = [
    "https://images.unsplash.com/photo-1587826533054-9e8c462eb538?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
]

# Update products 101 to 200 with STRICT verified URLs
for idx in range(100, len(df)):
    row = df.iloc[idx]
    name = str(row["product_name"]).lower()
    
    if "mouse" in name:
        url = verified_mice[idx % len(verified_mice)]
    elif "keyboard" in name:
        url = verified_keyboards[idx % len(verified_keyboards)]
    elif "charger" in name or "adapter" in name or "magsafe" in name or "charging" in name or "dart" in name or "vooc" in name or "soniccharge" in name:
        url = verified_chargers[idx % len(verified_chargers)]
    elif "cable" in name or "hub" in name or "hdmi" in name or "aux" in name or "dongle" in name or "converter" in name:
        url = verified_cables[idx % len(verified_cables)]
    elif "power bank" in name or "powerbank" in name or "battery" in name:
        url = verified_powerbanks[idx % len(verified_powerbanks)]
    else:
        url = verified_webcam_stands[idx % len(verified_webcam_stands)]

    df.at[idx, "image_url"] = url

# Save updated CSV
df.to_csv(csv_path, index=False, encoding="latin1")
print("Updated all accessory product images in CSV cleanly!")

# Sync to PostgreSQL Database
db = SessionLocal()
for idx in range(100, len(df)):
    p_id = int(df.iloc[idx]["id"])
    p_img = str(df.iloc[idx]["image_url"])
    product = db.query(Product).filter(Product.id == p_id).first()
    if product:
        product.image_url = p_img

db.commit()
db.close()
print("PostgreSQL Database synced with verified clean images!")
