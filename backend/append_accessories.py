import os
import pandas as pd
import random

csv_path = "../datasets/amazon_flipkart_products_1000.csv"
if not os.path.exists(csv_path):
    csv_path = "datasets/amazon_flipkart_products_1000.csv"

# Load existing 100 products
df_existing = pd.read_csv(csv_path, encoding="latin1")
print(f"Loaded existing products: {len(df_existing)}")

# Ensure we keep existing 100 untouched
assert len(df_existing) >= 100, "Existing products should be at least 100"
df_first_100 = df_existing.iloc[:100].copy()

# List of 100 real accessories products with high quality image URLs
accessory_templates = [
    # MOUSE (20 items)
    ("Logitech MX Master 3S Wireless Performance Mouse", "Logitech", "Accessories", "Ergonomic wireless mouse with 8K DPI tracking and Quiet Clicks for Mac and Windows.", 8995, 9995, 4.8, 4250, 45, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Razer DeathAdder Essential Gaming Mouse", "Razer", "Accessories", "6400 DPI optical sensor ergonomic gaming mouse with 5 programmable buttons.", 1499, 2999, 4.5, 3120, 60, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Portronics Toad 23 Wireless Optical Mouse", "Portronics", "Accessories", "2.4GHz wireless optical mouse with 1600 DPI and ergonomic silent click buttons.", 399, 799, 4.2, 1840, 100, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("HP X1000 Wired USB Optical Mouse", "HP", "Accessories", "Sleek and contoured USB wired optical mouse with smooth responsive cursor control.", 349, 599, 4.3, 2100, 85, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Dell WM126 Wireless Optical Mouse", "Dell", "Accessories", "Compact 1000 DPI wireless mouse with up to 1-year battery life for laptop & PC.", 799, 1299, 4.4, 3890, 75, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Lenovo Legion M300 RGB Gaming Mouse", "Lenovo", "Accessories", "8000 DPI gaming mouse with ambidextrous design and customizable RGB lighting.", 1299, 2499, 4.6, 950, 50, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Logitech Pebble M350 Silent Bluetooth Mouse", "Logitech", "Accessories", "Slim, modern, silent portable Bluetooth mouse for laptop, iPad and PC.", 1595, 2495, 4.7, 5400, 40, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Zebronics ZEB-TRANSFORMER-M Gaming Mouse", "Zebronics", "Accessories", "Gold-plated USB gaming mouse with 3200 DPI and 7-color breathing LED light.", 499, 999, 4.3, 4120, 120, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Apple Magic Mouse (Wireless, Rechargeable)", "Apple", "Accessories", "Multi-Touch surface Bluetooth wireless rechargeable mouse for Mac & iPad.", 7500, 8500, 4.6, 1890, 30, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Asus ROG Gladius III Wireless Gaming Mouse", "Asus", "Accessories", "19000 DPI tri-mode connectivity lightweight ergonomic optical gaming mouse.", 6999, 8999, 4.7, 620, 25, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Logitech G304 Lightspeed Wireless Mouse", "Logitech", "Accessories", "Hero sensor 12000 DPI ultra-fast wireless gaming mouse with 250h battery life.", 2795, 3795, 4.7, 8900, 65, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Cosmic Byte Equinox Gamma Gaming Mouse", "Cosmic Byte", "Accessories", "16000 DPI PixArt sensor RGB gaming mouse with weight tuning system.", 1899, 2999, 4.4, 1420, 55, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("EvoFox Phantom Wired Gaming Mouse", "EvoFox", "Accessories", "7000 DPI gaming mouse with braided cable and dedicated DPI switcher.", 599, 1199, 4.2, 2300, 90, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Anker Ergonomic Vertical Wireless Mouse", "Anker", "Accessories", "Scientific ergonomic design vertical wireless mouse for wrist health.", 2299, 3499, 4.5, 1150, 40, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Dell Alienware 610M Wired/Wireless Mouse", "Dell", "Accessories", "16000 DPI dual-mode gaming mouse with customizable AlienFX RGB lighting.", 5499, 7999, 4.6, 430, 20, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Microsoft Bluetooth Ergonomic Mouse", "Microsoft", "Accessories", "Lightweight durable Bluetooth mouse with soft thumb rest for all-day comfort.", 3199, 4299, 4.5, 870, 35, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("iBall Style 63 Optical Mouse", "iBall", "Accessories", "1600 DPI high-precision optical wired mouse with silent clicks.", 299, 499, 4.1, 1600, 110, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("HP Z3700 Ultra-Thin Wireless Mouse", "HP", "Accessories", "Sleek low-profile wireless mouse with blue LED technology.", 999, 1499, 4.4, 2780, 70, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),
    ("Logitech B100 Optical USB Wired Mouse", "Logitech", "Accessories", "Ambidextrous design plug-and-play USB optical wired mouse for office.", 379, 495, 4.4, 12500, 150, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Razer Basilisk V3 Customizable Gaming Mouse", "Razer", "Accessories", "26000 DPI Focus+ optical sensor mouse with 11 programmable buttons.", 4499, 6999, 4.8, 1950, 30, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"),

    # KEYBOARDS (20 items)
    ("Logitech MX Keys S Wireless Illuminated Keyboard", "Logitech", "Accessories", "Advanced wireless keyboard with smart backlighting and quiet spherical keys.", 11995, 13995, 4.8, 3100, 35, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Keychron K2 Wireless Mechanical Keyboard", "Keychron", "Accessories", "Compact 75% layout RGB mechanical keyboard with Gateron switches for Mac & Windows.", 7499, 8999, 4.7, 1890, 25, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Redragon K552 KUMARA Mechanical Gaming Keyboard", "Redragon", "Accessories", "Tenkeyless compact 87 key RGB LED backlit mechanical keyboard with dustproof switches.", 2599, 3999, 4.5, 6700, 80, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("HP CS10 Wireless Keyboard & Mouse Combo", "HP", "Accessories", "Ergonomic 2.4GHz wireless keyboard and mouse combo with long battery life.", 1199, 1999, 4.3, 4300, 95, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Dell KB216 Wired Multimedia USB Keyboard", "Dell", "Accessories", "Chiclet style keys desktop wired keyboard with multimedia hotkeys.", 699, 999, 4.4, 15400, 120, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Zebronics Transformer K RGB Gaming Keyboard", "Zebronics", "Accessories", "Aluminium body gaming keyboard with multi-mode RGB LED backlighting.", 1099, 1999, 4.4, 5200, 110, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Logitech K380 Multi-Device Bluetooth Keyboard", "Logitech", "Accessories", "Minimalist, slim portable Bluetooth keyboard for computer, tablet & phone.", 2495, 3195, 4.7, 11200, 60, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Cosmic Byte CB-GK-16 Firefly Mechanical Keyboard", "Cosmic Byte", "Accessories", "Outemu Blue mechanical switches RGB TKL gaming keyboard with braided cable.", 2199, 3199, 4.5, 3450, 70, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Apple Magic Keyboard with Touch ID", "Apple", "Accessories", "Wireless rechargeable keyboard with Touch ID for Mac models with Apple Silicon.", 14500, 15500, 4.8, 1200, 20, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Razer BlackWidow V3 Mechanical Gaming Keyboard", "Razer", "Accessories", "Green Mechanical Switches tactile keyboard with Chroma RGB lighting.", 8999, 11999, 4.7, 1420, 30, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Portronics Bubble Wireless Keyboard", "Portronics", "Accessories", "Multi-device Bluetooth 5.0 wireless keyboard with tablet holder slot.", 1199, 1999, 4.2, 2890, 85, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Corsair K55 RGB PRO Gaming Keyboard", "Corsair", "Accessories", "Dynamic 5-Zone RGB backlighting keyboard with 6 dedicated macro keys.", 3899, 4999, 4.6, 2100, 45, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("EvoFox Katana Mechanical Gaming Keyboard", "EvoFox", "Accessories", "Silent Red switches mechanical gaming keyboard with 16 RGB lighting modes.", 1999, 2999, 4.3, 1780, 65, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Logitech G213 Prodigy RGB Gaming Keyboard", "Logitech", "Accessories", "Spill-resistant membrane gaming keyboard with LIGHTSYNC RGB zones.", 3995, 4995, 4.5, 7800, 50, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("TVS Electronics Gold Prime Mechanical Keyboard", "TVS", "Accessories", "Durable Bharat Gold mechanical keyboard with Cherry MX clone switches.", 2850, 3500, 4.6, 9800, 40, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Lenovo 510 Wireless Keyboard & Mouse Combo", "Lenovo", "Accessories", "Island key design wireless keyboard and optical mouse combo.", 1599, 2499, 4.3, 3100, 75, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Ambrane Wireless Keyboard and Mouse Combo", "Ambrane", "Accessories", "Compact 2.4GHz wireless desk combo with spill-proof keycaps.", 899, 1499, 4.1, 1450, 100, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("ASUS ROG Strix Flare II Animate Gaming Keyboard", "Asus", "Accessories", "AniMe Matrix LED display mechanical gaming keyboard with 8000Hz polling rate.", 17999, 21999, 4.9, 310, 15, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
    ("Logitech K120 USB Wired Desktop Keyboard", "Logitech", "Accessories", "Low-profile quiet keys spill-resistant USB wired standard office keyboard.", 549, 795, 4.5, 23000, 200, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Microsoft Ergonomic Wired Keyboard", "Microsoft", "Accessories", "Split keyboard design with cushioned palm rest for reduced fatigue.", 4999, 6499, 4.5, 640, 30, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),

    # CHARGERS & ADAPTERS (20 items)
    ("Anker 65W GaNPrime 3-Port Fast Charger", "Anker", "Accessories", "Compact GaN III 65W USB-C charger for MacBook, iPhone, and Android flagship phones.", 3999, 5499, 4.8, 2890, 50, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Apple 20W USB-C Power Adapter", "Apple", "Accessories", "Official fast wall charger adapter for iPhone 15/14/13 and iPad Air/Pro.", 1699, 1900, 4.7, 18500, 150, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Samsung 25W Super Fast Charging Wall Charger", "Samsung", "Accessories", "USB Type-C 25W Power Delivery wall adapter for Galaxy S24/S23/A-series.", 1299, 1699, 4.6, 14200, 130, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Portronics Adapto 65W Multi-Port Fast Charger", "Portronics", "Accessories", "Dual Type-C and USB-A 65W GaN adapter with Quick Charge 3.0 technology.", 1999, 3499, 4.4, 3200, 80, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Belkin BoostCharge 30W USB-C GaN Wall Charger", "Belkin", "Accessories", "PPS fast charging 30W compact wall charger for smartphones and tablets.", 1899, 2499, 4.6, 1750, 60, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Mi 33W SonicCharge 2.0 Fast Charger Combo", "Xiaomi", "Accessories", "33W super fast wall charger with Type-C cable included.", 999, 1499, 4.5, 8900, 110, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("OnePlus Supervooc 80W Power Adapter", "OnePlus", "Accessories", "Flagship 80W flash charging adapter with multi-layer safety protection.", 2499, 2999, 4.8, 6400, 70, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Realme 65W SuperDart Fast Charger Kit", "Realme", "Accessories", "65W flash charger adapter with 6A Type-C yellow charging cable.", 1799, 2299, 4.6, 4100, 85, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Ambrane 100W GaN Fast Charger", "Ambrane", "Accessories", "Ultra-powerful 4-port 100W GaN desktop charging station for laptops and phones.", 4499, 5999, 4.6, 920, 35, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Stuffcool 102W GaN Multi-Device Fast Charger", "Stuffcool", "Accessories", "Made in India 102W 4-port Type-C power adapter for Macbook Pro & iPhone.", 4999, 6999, 4.7, 830, 30, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Apple MagSafe Wireless Charger Pad", "Apple", "Accessories", "Official magnetic wireless charging pad 15W for iPhone 12 to 15 series.", 4199, 4500, 4.7, 5600, 50, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Samsung Wireless Charger Duo (15W)", "Samsung", "Accessories", "Dual wireless charging pad for Galaxy phone and Galaxy Watch simultaneously.", 3499, 4999, 4.5, 2300, 45, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Boat WCD 20W PD Dual Port Fast Charger", "Boat", "Accessories", "20W Power Delivery and QC 3.0 dual port wall adapter.", 599, 1199, 4.3, 7600, 140, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Anker 313 Wireless Charging Stand (10W)", "Anker", "Accessories", "Qi-certified 10W max wireless charger stand with landscape & portrait mode.", 1899, 2999, 4.5, 3400, 65, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Ambrane 20W Fast Wall Adapter", "Ambrane", "Accessories", "Made in India 20W PD Type-C fast charger for iPhones and Androids.", 499, 999, 4.2, 5800, 120, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Portronics Freedom 4-in-1 Wireless Charging Desk Lamp", "Portronics", "Accessories", "15W wireless fast charger integrated with LED desk reading lamp.", 1599, 2999, 4.4, 1890, 55, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Belkin 15W MagSafe Wireless Charging Stand", "Belkin", "Accessories", "Premium stainless steel 15W wireless MagSafe stand for Apple devices.", 6999, 8999, 4.8, 710, 25, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("CallOne 65W Car Charger Adapter", "CallOne", "Accessories", "Dual port Type-C & USB-A metal fast car charger with voltage LED display.", 799, 1499, 4.3, 2100, 90, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Portronics Car Power 120W Multi-Device Car Charger", "Portronics", "Accessories", "120W high output multi-port car charger for laptops, tablets, and phones.", 1299, 2199, 4.5, 1420, 70, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("DailyObjects 3-in-1 Magnetic Wireless Charging Station", "DailyObjects", "Accessories", "Sleek 3-in-1 foldable charging tree for iPhone, Apple Watch, and AirPods.", 3999, 5999, 4.6, 950, 40, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),

    # CABLES & USB HUBS (20 items)
    ("Anker 100W 6ft Nylon Braided USB-C to USB-C Cable", "Anker", "Accessories", "High-durability 100W Power Delivery braided Type-C cable for laptops.", 1299, 1999, 4.8, 6200, 80, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Portronics Konnect L 1.2m Fast Charging Cable", "Portronics", "Accessories", "3A fast charging Lightning cable with unbreakable TPE jacket for iPhone.", 299, 599, 4.3, 11400, 150, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Belkin Ultra High Speed HDMI 2.1 Cable 2m", "Belkin", "Accessories", "48Gbps 8K@60Hz and 4K@120Hz Dolby Vision HDMI cable for PS5 and TV.", 2299, 2999, 4.8, 1850, 45, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("TP-Link 7-Port USB 3.0 Hub with 2 Charging Ports", "TP-Link", "Accessories", "High-speed 5Gbps data transfer USB hub with dedicated 2.4A charging ports.", 2499, 3499, 4.6, 2100, 60, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Anker 7-in-1 USB-C Hub Adapter", "Anker", "Accessories", "4K HDMI, 100W Power Delivery, SD/TF Card Reader, 2 USB 3.0 ports hub.", 3999, 5499, 4.7, 4300, 40, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Ambrane 60W Type-C to Type-C Braided Cable 1.5m", "Ambrane", "Accessories", "Tough nylon braided 3A fast charging cable with 10,000+ bend lifespan.", 249, 499, 4.4, 8900, 130, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Boat Deuce USB 300 2-in-1 Type-C & Micro USB Cable", "Boat", "Accessories", "3A fast charging tough PVC jacket 2-in-1 combo cable.", 349, 699, 4.2, 5400, 110, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Realme Type-C 6A Yellow SuperDart Cable", "Realme", "Accessories", "Original 6A high-current VOOC/Dart fast charging Type-C cable.", 499, 799, 4.5, 4100, 95, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Ugreen USB-C to 3.5mm Headphone Jack Adapter", "Ugreen", "Accessories", "Hi-Fi DAC chip Type-C to 3.5mm female aux audio adapter.", 899, 1299, 4.5, 3200, 85, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Satechi Aluminium Type-C Pro Hub for MacBook", "Satechi", "Accessories", "Dual Type-C pass-through hub with 4K HDMI, Thunderbolt 3, USB 3.0.", 7999, 9999, 4.7, 850, 20, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Zebronics 4-Port USB 3.0 High Speed Hub", "Zebronics", "Accessories", "Plug and play 5Gbps USB hub with individual power switches.", 499, 899, 4.1, 2900, 100, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("OnePlus Type-C to 3.5mm Audio Adapter", "OnePlus", "Accessories", "Official red oxygen-free copper AUX headphone converter.", 399, 499, 4.4, 6100, 110, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Portronics Mport 45 4-in-1 Type-C Hub", "Portronics", "Accessories", "Multi-port dongle with 4K HDMI, USB 3.0, USB 2.0, Type-C PD port.", 1299, 2499, 4.3, 1950, 75, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Mi 2-in-1 USB Cable (Micro USB to Type-C)", "Xiaomi", "Accessories", "Official 2-in-1 fast charging cable 100cm length.", 299, 499, 4.4, 9400, 140, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Ambrane 100W 3-in-1 Fast Charging Cable", "Ambrane", "Accessories", "Multi-pin Type-C, Lightning & Micro-USB braided cable.", 499, 999, 4.2, 3800, 90, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Belkin BoostCharge USB-C to Lightning Cable 1m", "Belkin", "Accessories", "MFi-certified fast charging Lightning cable for iPhone.", 999, 1499, 4.6, 4500, 65, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Stuffcool Type-C to DisplayPort 1.4 Cable 2m", "Stuffcool", "Accessories", "8K@60Hz Thunderbolt 3 to DisplayPort monitor cable.", 1999, 2999, 4.7, 610, 30, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Portronics Konnect J 3-in-1 Charging Cable", "Portronics", "Accessories", "Heavy duty zinc alloy connectors 3-in-1 multi charger cable.", 399, 799, 4.3, 4200, 80, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Amazon Basics High-Speed HDMI Cable 1.8m", "AmazonBasics", "Accessories", "18Gbps 4K@60Hz Ethernet & Audio Return Channel HDMI cable.", 349, 699, 4.5, 18500, 200, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Baseus 100W 2-in-1 Retractable Type-C Cable", "Baseus", "Accessories", "Tangle-free retractable 100W fast charging cable.", 1499, 2299, 4.6, 1200, 45, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),

    # POWERBANKS, STANDS & WEBCAMS (20 items)
    ("Anker 335 Power Bank (PowerCore 20K 20000mAh)", "Anker", "Accessories", "20000mAh 20W PD fast charging high capacity power bank for smartphones.", 3499, 4999, 4.7, 4100, 50, "https://images.unsplash.com/photo-1609592424074-88484196144e?w=500"),
    ("Mi Power Bank 3i 20000mAh 18W Fast Charging", "Xiaomi", "Accessories", "Triple port output 18W fast charging power bank with power management.", 2199, 3199, 4.6, 24500, 100, "https://images.unsplash.com/photo-1609592424074-88484196144e?w=500"),
    ("Portronics My Buddy K Aluminium Laptop Stand", "Portronics", "Accessories", "Foldable ergonomic height adjustable aluminium laptop cooling stand.", 999, 1999, 4.5, 6800, 85, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Logitech C920 HD Pro Webcam 1080p", "Logitech", "Accessories", "Full HD 1080p video calling with stereo audio and automatic light correction.", 6995, 8995, 4.7, 8900, 35, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Boat EnergyShroom PB300 10000mAh Power Bank", "Boat", "Accessories", "22.5W two-way fast charging slim aluminium body power bank.", 1199, 2499, 4.4, 7300, 90, "https://images.unsplash.com/photo-1609592424074-88484196144e?w=500"),
    ("Ambrane 20000mAh 22.5W Fast Charging Powerbank", "Ambrane", "Accessories", "Made in India 20000mAh metallic powerbank with Quick Charge 3.0.", 1799, 2999, 4.4, 11200, 110, "https://images.unsplash.com/photo-1609592424074-88484196144e?w=500"),
    ("Logitech C270 HD Webcam 720p", "Logitech", "Accessories", "720p widescreen video calls with noise-reducing mic for WFH & classes.", 2195, 2995, 4.5, 16800, 60, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Portronics My Buddy K6 Adjustable Desktop Stand", "Portronics", "Accessories", "360-degree rotating aluminium tablet and laptop riser stand.", 1499, 2999, 4.6, 2100, 70, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"),
    ("Lenovo 300 FHD Webcam with Dual Mics", "Lenovo", "Accessories", "1080p 2MP CMOS camera with physical privacy shutter and 360 rotation.", 2499, 4999, 4.3, 3100, 55, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("URBAN 10000mAh MagSafe Wireless Power Bank", "URBAN", "Accessories", "15W magnetic wireless charging power bank with foldable ring stand.", 2299, 3999, 4.5, 1420, 65, "https://images.unsplash.com/photo-1609592424074-88484196144e?w=500"),
    ("Stuffcool 10000mAh 20W Pocket Power Bank", "Stuffcool", "Accessories", "Super compact credit-card sized 20W PD fast power bank.", 1499, 2499, 4.5, 2900, 75, "https://images.unsplash.com/photo-1609592424074-88484196144e?w=500"),
    ("Razer Kiyo Pro Streaming Webcam 1080p 60FPS", "Razer", "Accessories", "Adaptive light sensor HDR streaming webcam with wide angle lens.", 9999, 14999, 4.8, 940, 20, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Elgato Facecam 1080p60 Full HD Webcam", "Elgato", "Accessories", "Studio camera lens with Sony STARVIS sensor for content creators.", 13999, 16999, 4.8, 620, 15, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Zebronics ZEB-KLIP Ring Light with Phone Holder", "Zebronics", "Accessories", "10-inch LED ring light with tripod stand for video recording.", 799, 1999, 4.2, 4500, 80, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
    ("Apple AirTag 1-Pack", "Apple", "Accessories", "Bluetooth item tracker tag with Precision Finding for Keys and Bags.", 3490, 3790, 4.8, 9800, 100, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Samsung Galaxy SmartTag2 Bluetooth Tracker", "Samsung", "Accessories", "UWB & Bluetooth LE smart finder tag with 500-day battery life.", 2799, 3299, 4.6, 3100, 70, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("Spigen Tough Armor Case for iPhone 15 Pro", "Spigen", "Accessories", "Dual-layer shockproof protective cover with built-in kickstand.", 1699, 2999, 4.7, 5200, 85, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"),
    ("SanDisk Extreme 128GB microSDXC UHS-I Card", "SanDisk", "Accessories", "Up to 190MB/s read speed V30 4K UHD memory card for Action Cam & Phone.", 1299, 2499, 4.7, 18200, 120, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Samsung EVO Plus 256GB MicroSDXC Memory Card", "Samsung", "Accessories", "Full HD & 4K UHD 130MB/s speed class 10 card with adapter.", 1899, 3299, 4.7, 14200, 95, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"),
    ("Portronics Freedom 2 15W Wireless Charging Pad", "Portronics", "Accessories", "Non-slip rubberized 15W wireless fast charging disc for all Qi devices.", 699, 1499, 4.3, 3100, 90, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500")
]

# Generate rows for products 101 to 200
new_rows = []
for i, template in enumerate(accessory_templates, start=101):
    name, brand, cat, desc, price, orig_price, rating, rev_count, stock, img = template
    disc = round(((orig_price - price) / orig_price) * 100, 1)
    new_rows.append({
        "id": i,
        "product_name": name,
        "brand": brand,
        "category": cat,
        "description": desc,
        "price": float(price),
        "original_price": float(orig_price),
        "discount_percent": disc,
        "rating": float(rating),
        "review_count": int(rev_count),
        "stock": int(stock),
        "image_url": img
    })

df_new = pd.DataFrame(new_rows)

# Concatenate first 100 with 100 new rows
df_final = pd.concat([df_first_100, df_new], ignore_index=True)
print(f"Total products after append: {len(df_final)}")
print("Categories in final dataset:", df_final['category'].value_counts().to_dict())

# Save back to CSV
df_final.to_csv(csv_path, index=False, encoding="latin1")
print(f"Successfully saved {len(df_final)} products to {csv_path}")
