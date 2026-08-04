import os
import pandas as pd
from database import SessionLocal, engine
from models import Product, Base

csv_path = "../datasets/amazon_flipkart_products_1000.csv"
if not os.path.exists(csv_path):
    csv_path = "datasets/amazon_flipkart_products_1000.csv"

df = pd.read_csv(csv_path, encoding="latin1")

# High-resolution Unsplash product image pools by category & type
mobile_imgs = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format&fit=crop&q=80"
]

laptop_imgs = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"
]

watch_imgs = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80"
]

headphone_imgs = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80"
]

mouse_imgs = [
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=800&auto=format&fit=crop&q=80"
]

keyboard_imgs = [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541140532154-b024d715b909?w=800&auto=format&fit=crop&q=80"
]

charger_imgs = [
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622445268121-23344f3f6199?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592890288564-76628a30a657?w=800&auto=format&fit=crop&q=80"
]

cable_imgs = [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80"
]

other_acc_imgs = [
    "https://images.unsplash.com/photo-1609592424074-88484196144e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
]

def get_real_image(name, cat, idx):
    name_lower = str(name).lower()
    cat_lower = str(cat).lower()

    if "mouse" in name_lower:
        return mouse_imgs[idx % len(mouse_imgs)]
    elif "keyboard" in name_lower:
        return keyboard_imgs[idx % len(keyboard_imgs)]
    elif "charger" in name_lower or "adapter" in name_lower or "magsafe" in name_lower or "charging" in name_lower:
        return charger_imgs[idx % len(charger_imgs)]
    elif "cable" in name_lower or "hub" in name_lower or "hdmi" in name_lower:
        return cable_imgs[idx % len(cable_imgs)]
    elif "power" in name_lower or "bank" in name_lower or "webcam" in name_lower or "stand" in name_lower or "tag" in name_lower or "card" in name_lower:
        return other_acc_imgs[idx % len(other_acc_imgs)]
    elif "mobile" in cat_lower or "phone" in name_lower or "iphone" in name_lower or "pixel" in name_lower or "galaxy s" in name_lower:
        return mobile_imgs[idx % len(mobile_imgs)]
    elif "laptop" in cat_lower or "macbook" in name_lower or "xps" in name_lower or "zenbook" in name_lower or "thinkpad" in name_lower:
        return laptop_imgs[idx % len(laptop_imgs)]
    elif "watch" in cat_lower or "watch" in name_lower:
        return watch_imgs[idx % len(watch_imgs)]
    elif "headphone" in cat_lower or "audio" in cat_lower or "airpods" in name_lower or "sony wh" in name_lower or "earbuds" in name_lower:
        return headphone_imgs[idx % len(headphone_imgs)]
    else:
        return mobile_imgs[idx % len(mobile_imgs)]

# Update all 200 rows with real high-resolution images
updated_image_urls = []
for idx, row in df.iterrows():
    p_name = row.get("product_name", f"Product #{row['id']}")
    p_cat = row.get("category", "General")
    real_url = get_real_image(p_name, p_cat, idx)
    updated_image_urls.append(real_url)

df["image_url"] = updated_image_urls

# Save updated CSV
df.to_csv(csv_path, index=False, encoding="latin1")
print(f"Updated CSV image URLs for all {len(df)} products!")

# Now sync with PostgreSQL Database
Base.metadata.create_all(bind=engine)
db = SessionLocal()

for idx, row in df.iterrows():
    p_id = int(row["id"])
    p_img = str(row["image_url"])
    
    product = db.query(Product).filter(Product.id == p_id).first()
    if product:
        product.image_url = p_img

db.commit()
db.close()
print("PostgreSQL Database updated with all Real Product Images successfully!")
