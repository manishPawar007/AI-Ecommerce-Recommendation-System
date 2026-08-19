# 🛒 GadgetWorld — AI-Powered E-Commerce & Smart Recommendation System

<p align="center">
  <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80" alt="GadgetWorld Banner" width="100%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript ES6" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License" />
</p>

---

## 📌 Executive Summary

**GadgetWorld** is an enterprise-grade, full-stack **AI E-Commerce Platform** engineered with **FastAPI, PostgreSQL, Machine Learning (TF-IDF & Cosine Similarity), and a High-Performance Obsidian Glassmorphic Web Client**. 

The system delivers a personalized shopping experience with real-time product discovery, category-isolated competitor alternatives, ecosystem accessory smart bundles, behavioral shopper persona predictions, secure universal authentication, multi-tenant user isolation, and a comprehensive Executive Admin Dashboard.

---

## 🌟 Key Highlights & Engineering Features

### 🧠 1. Advanced Machine Learning Recommendation Engine
- **Competitor Similar Alternatives**: Employs **TF-IDF Vectorization** with strict **Category Isolation** to ensure Mobiles only suggest flagship phones, Laptops only suggest laptops, and Headphones only suggest audio devices with cosine similarity score ranking.
- **Frequently Bought Together (Ecosystem Smart Bundles)**: Dynamically constructs multi-item bundles with cross-accessory compatibility (e.g. Mobiles are bundled with GaN 65W fast chargers and 20,000mAh metallic power banks; Laptops are bundled with 8K DPI wireless mice and aluminum cooling stands) with an automatic 10% bundle discount.
- **AI Shopper Persona & Behavioral Prediction**: Real-time analysis of cart items, browsing patterns, and order history to predict shopper intent (e.g., *👑 Flagship Power User*, *⚡ Smart Tech Adopter*, *🎧 Audiophile Enthusiast*).
- **Live Trending Feed**: Real-time sales frequency ranking powered by SQL aggregations.

### 💎 2. Ultra-Modern Obsidian Glassmorphism UI
- **Design System**: Tailored dark mode color palette (Slate Obsidian `#0B0F19`, Neon Indigo `#6366F1`, Cyan `#06B6D4`, Emerald `#10B981`, Rose `#F43F5E`).
- **Responsive Layout**: Zero image cropping with `object-fit: contain` and clean product cards.
- **Real-Time Toast Notifications**: Interactive alerts for cart updates, wishlist toggles, and order confirmations.
- **Quick View Modal (👁️)**: Instant access to product details, high-res previews, stock indicators, and embedded AI bundle widgets without full page reloads.

### 🛒 3. Authentic Catalog & Indian Market Pricing
- **1,000 Authentic Tech Gadgets**: Real-world flagship smartphones (iPhone 16 Pro, Samsung Galaxy S26 Ultra, Vivo X100), laptops (MacBook Air M5, Dell XPS, MSI Stealth), noise-cancelling headphones (Sony WH-1000XM5, Bose QC Ultra), smartwatches (Apple Watch Ultra 2), and GaN accessories.
- **Real Indian Retail Prices**: Synchronized pricing in INR (₹) with 18% GST calculation and dynamic shipping thresholds.

### 🔐 4. Universal Authentication & Multi-Tenant Isolation
- **Modern Native Bcrypt Hashing**: Secure password hashing without legacy library bottlenecks.
- **1-Click Evaluation Logins**: Pre-configured demo buttons for instant Customer and Admin evaluation.
- **Multi-Tenant Privacy**: Each user's **Order History, Shopping Bag, Saved Wishlist, and Lifetime Analytics** are isolated and private.

### 👑 5. Executive Admin Control Center
- **Live KPI Dashboard**: Real-time revenue metrics, order volumes, customer acquisition stats, and low-stock warnings.
- **Comprehensive Management Suite**: Product catalog CRUD, Order fulfillment status transitions, Customer directories, Inventory adjustments, Coupon management, and Analytics visual charts.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Browser Web Client   │
                                  │ (Glassmorphic ES6+ UI) │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON API
                                              ▼
                                  ┌────────────────────────┐
                                  │    FastAPI Gateway     │
                                  │  (Uvicorn Async ASGI)  │
                                  └───────────┬────────────┘
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
               ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
               │  Authentication  │ │ E-Commerce Logic │ │  AI ML Engine    │
               │  (JWT + Bcrypt)  │ │ (Cart/Order/Cat) │ │ (TF-IDF + Cosine)│
               └─────────┬────────┘ └─────────┬────────┘ └─────────┬────────┘
                         │                    │                    │
                         └────────────────────┼────────────────────┘
                                              ▼
                                 ┌─────────────────────────┐
                                 │   PostgreSQL Database   │
                                 │ (1000 Products / Users) │
                                 └─────────────────────────┘
```

---

## 🔑 Quick Evaluation Logins

You can test the system using the pre-configured 1-click login buttons on the **[Login Page](frontend/pages/Login.html)**:

| Role | Email Address | Password | Landing Page |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `manish07@gmail.com` | `admin123` | Executive Admin Dashboard (`/admin/dashboard.html`) |
| **👤 Customer Demo 1** | `piyush@gmail.com` | `password123` | Customer Storefront (`/pages/Home.html`) |
| **👤 Customer Demo 2** | `vedant@gmail.com` | `password123` | Customer Storefront (`/pages/Home.html`) |
| **👤 Customer Demo 3** | `yash@gmail.com` | `password123` | Customer Storefront (`/pages/Home.html`) |
| **✨ Any New User** | `your_email@example.com` | `any_password` | Auto-Provisioned Customer Account |

---

## 📁 Repository Structure

```
├── backend/
│   ├── auth.py                  # Native Bcrypt hashing & JWT token handling
│   ├── config.py                # Database connection & environment configuration
│   ├── database.py              # SQLAlchemy Session factory & DB Engine
│   ├── main.py                  # FastAPI Application Entrypoint & Router Ingestion
│   ├── models.py                # SQLAlchemy Relational Models (User, Product, Order, Cart...)
│   ├── schemas.py               # Pydantic Request & Response Validation Schemas
│   ├── ml/
│   │   └── recommendation.py    # TF-IDF & Cosine Similarity ML Recommendation Engine
│   └── routers/
│       ├── admin.py             # Admin Dashboard, Inventory & User Management APIs
│       ├── analytics.py         # Customer Shopping Habits & AI Intent Insights APIs
│       ├── auth.py              # Registration, Login & User Profile Lookup APIs
│       ├── cart.py              # Shopping Cart CRUD & Quantity Control APIs
│       ├── orders.py            # Checkout, Order Creation & Multi-Tenant Tracking APIs
│       ├── products.py          # PostgreSQL Catalog Query, Search & Filter APIs
│       ├── recommendations.py   # AI Similar, Smart Bundle, & Trending APIs
│       └── wishlist.py          # Wishlist Toggle & Badge Sync APIs
├── datasets/
│   └── amazon_flipkart_products_1000.csv  # Cleaned 1000 items electronics dataset
├── frontend/
│   ├── admin/                   # Executive Admin Dashboard & Control Modules
│   │   ├── dashboard.html       # KPI Overview & Sales Metrics
│   │   ├── products.html        # Admin Product CRUD & Stock Control
│   │   ├── orders.html          # Order Fulfillment & Status Dispatcher
│   │   ├── customers.html       # Customer Directory & History Manager
│   │   ├── analytics.html       # Revenue & Category Performance Charts
│   │   └── js/                  # Admin Controller Modules
│   ├── css/
│   │   ├── style.css            # Core Glassmorphic Design System & CSS Variables
│   │   └── theme.css            # Dark Theme Layout Tokens & Micro-Animations
│   ├── js/
│   │   ├── core.js              # Universal State Manager, API Bridge & Toast System
│   │   ├── home.js              # Home Page Carousels, Category Grids & Persona Banner
│   │   ├── products.js          # Catalog Filters, Dynamic Search & Quick View Modal
│   │   ├── cart.js              # Cart Summary, GST Calculation & Addon Prompts
│   │   ├── checkout.js          # Delivery Address, UPI Payment & Order Execution
│   │   ├── orders.js            # User-Isolated Order History & Timeline Tracking
│   │   ├── wishlist.js          # Saved Items Grid & Move-to-Cart Logic
│   │   └── analytics.js         # Customer Spending Habits & Persona Visualizations
│   └── pages/
│       ├── index.html           # Storefront Redirect Entry
│       ├── Home.html            # Main Customer Storefront
│       ├── Products.html        # Product Catalog Browser
│       ├── Cart.html            # Interactive Shopping Cart
│       ├── Checkout.html        # Secure Checkout & Payment
│       ├── Orders.html          # Personal Order History
│       ├── Wishlist.html        # Saved Wishlist Items
│       ├── Profile.html         # User Account & Metrics
│       ├── Analytics.html       # Personal AI Insights & Spending Visualizer
│       ├── Login.html           # Authentication Gateway
│       └── Register.html        # New User Registration
├── requirements.txt             # Python Package Dependencies
├── Dockerfile                   # Production Container Specification
├── docker-compose.yml           # Multi-Container Orchestration
└── README.md                    # Project Documentation
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- Python 3.10+
- PostgreSQL Server installed & running locally (or remote connection)
- Modern Web Browser (Chrome, Edge, Firefox, Brave)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/manishPawar007/AI-Ecommerce-Recommendation-System.git
cd AI-Ecommerce-Recommendation-System
```

---

### Step 2: Set Up Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

---

### Step 4: Configure PostgreSQL Database
Ensure your PostgreSQL server is active and configure connection settings in `backend/config.py` (or `.env`):
```python
DATABASE_URL = "postgresql://postgres:admin@123@localhost:5432/ecommerce_db"
```

---

### Step 5: Populate 1,000 Products Catalog
Populate the PostgreSQL database with the clean electronics dataset:
```bash
cd backend
python load_products.py
```

---

### Step 6: Launch FastAPI Backend Server
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- 🌐 **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 🔍 **ReDoc Specifications**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 7: Open the Frontend Application
Simply open `frontend/pages/Login.html` in your browser (or use Live Server / double click).

---

## 📡 REST API Reference Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue JWT bearer token |
| **Auth** | `POST` | `/api/auth/register` | Register new customer account |
| **Auth** | `GET` | `/api/auth/profile` | Synchronize and fetch verified user profile |
| **Products** | `GET` | `/api/products/` | Query catalog with pagination, search, category filter |
| **Products** | `GET` | `/api/products/{id}` | Fetch full product specifications and stock |
| **Products** | `GET` | `/api/products/categories/list` | List categories with icon and live product count |
| **AI ML** | `GET` | `/api/recommendations/similar` | Cosine similarity competitor alternatives (same category) |
| **AI ML** | `GET` | `/api/recommendations/bundle` | Category-aligned ecosystem accessory smart bundle |
| **AI ML** | `GET` | `/api/recommendations/personalized` | User-tailored product recommendation feed |
| **AI ML** | `GET` | `/api/recommendations/trending` | Sales velocity ranked trending gadgets |
| **AI ML** | `GET` | `/api/recommendations/user-persona` | Shopper behavioral persona & intent prediction |
| **Cart** | `GET` | `/api/cart/?user_id={id}` | Retrieve customer's active shopping cart |
| **Cart** | `POST` | `/api/cart/` | Add product to user cart or adjust quantity |
| **Cart** | `DELETE` | `/api/cart/{id}` | Remove specific item from cart |
| **Wishlist** | `GET` | `/api/wishlist/?user_id={id}` | Fetch user saved wishlist items |
| **Wishlist** | `POST` | `/api/wishlist/` | Toggle add/remove item from wishlist |
| **Orders** | `POST` | `/api/orders/` | Execute checkout, stock reduction & order creation |
| **Orders** | `GET` | `/api/orders/?user_id={id}` | Retrieve private order history for customer |
| **Admin** | `GET` | `/api/admin/dashboard` | Executive KPI stats (Revenue, Orders, Low Stock) |
| **Admin** | `GET` | `/api/admin/orders` | Admin order fulfillment & status dispatcher |
| **Admin** | `GET` | `/api/admin/customers` | Registered customer directory & order metrics |
| **Admin** | `GET` | `/api/admin/inventory` | Real-time stock audit & reorder alert list |

---

## 👨‍💻 Author & Credits

**Developed by:** [Manish Pawar](https://github.com/manishPawar007)  
**Project Title:** AI-Powered E-Commerce Recommendation System  
**Specialization:** Advanced Agentic AI, Machine Learning & Full-Stack Systems

---

<p align="center">
  <b>⭐ If you found this project helpful, give it a star on <a href="https://github.com/manishPawar007/AI-Ecommerce-Recommendation-System">GitHub</a>! ⭐</b>
</p>