# 🛒 AI Powered E-Commerce Recommendation System

## 📌 Project Description

The **AI Powered E-Commerce Recommendation System** is a full-stack web application developed using **FastAPI, PostgreSQL, HTML, CSS, JavaScript, and Machine Learning**. The system provides an intelligent online shopping experience by recommending similar products using a **Content-Based Recommendation System** built with **TF-IDF Vectorization** and **Cosine Similarity**.

The application supports secure authentication, product browsing, AI recommendations, shopping cart, wishlist, order management, analytics dashboard, and responsive user interface.

---

# 🎯 Project Objectives

- Develop a complete AI-powered E-Commerce website.
- Provide personalized product recommendations.
- Implement secure JWT Authentication.
- Manage products, carts, wishlists and orders efficiently.
- Perform sales and product analytics.
- Integrate Machine Learning into an E-Commerce platform.
- Build a responsive and user-friendly shopping interface.

---

# 🚀 Key Features

## 👤 User Authentication

- User Registration
- User Login
- JWT Authentication
- Logout
- Session Management
- Password Encryption (Bcrypt)
- Role Based Login (Admin/User)

---

## 🛍 Product Management

- Browse Products
- Product Details
- Product Images
- Product Categories
- Product Ratings
- Product Search
- Category Filter
- Price Filter
- Stock Availability
- Low Stock Indicator
- Trending Products

---

## ❤️ Wishlist Management

- Add to Wishlist
- Remove from Wishlist
- User-specific Wishlist
- Wishlist Search
- Wishlist Category Filter
- Move Wishlist Product to Cart

---

## 🛒 Shopping Cart

- Add to Cart
- Remove from Cart
- User-specific Cart
- Quantity Management
- Cart Summary
- Coupon Discount
- Automatic Total Calculation
- Checkout

---

## 📦 Order Management

- Place Order
- User-specific Orders
- Order History
- Order Status
- Delivery Details
- Payment Method Selection
- Order Tracking
- Buy Again
- Order Search
- Order Filtering

---

## 👤 User Profile

- View Profile
- Edit Profile
- User Information
- Wishlist Count
- Order Count
- Logout
- Session Management

---

## 📊 Analytics Dashboard (Admin)

- Total Users
- Total Products
- Total Orders
- Total Revenue
- Cart Analytics
- Product Analytics
- Sales Analytics
- Refresh Dashboard

---

## 🤖 AI Recommendation System

- Similar Product Recommendation
- Content-Based Filtering
- TF-IDF Vectorization
- Cosine Similarity
- AI Suggested Products
- Trending Recommendations

---

# 🧠 Machine Learning Used

## Recommendation Technique

### Content-Based Filtering

The recommendation engine recommends products that are similar to the currently selected product based on:

- Product Description
- Product Category

---

## TF-IDF Vectorizer

Converts product descriptions into numerical vectors.

### Library

```python
from sklearn.feature_extraction.text import TfidfVectorizer
```

Example

```
Apple iPhone 15 Pro Max 256GB

↓

[0.12, 0.56, 0.22, 0.78, ...]
```

---

## Cosine Similarity

Calculates similarity between product vectors.

### Formula

```
Similarity(A,B)

=

(A · B)

/ (||A|| × ||B||)
```

Range

- 1 → Exactly Similar
- 0 → Completely Different

### Library

```python
from sklearn.metrics.pairwise import cosine_similarity
```

---

# 🔄 Machine Learning Workflow

```
Dataset

↓

Data Cleaning

↓

Text Preprocessing

↓

TF-IDF Vectorization

↓

Cosine Similarity Matrix

↓

Content-Based Recommendation

↓

Top Similar Products
```

---

# 📚 Machine Learning Libraries

- Pandas
- NumPy
- Scikit-Learn
- TfidfVectorizer
- Cosine Similarity

---

# 💻 Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Font Awesome
- Google Fonts
- Local Storage

---

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib
- Bcrypt
- Uvicorn

---

## Database

- PostgreSQL

---

## Machine Learning

- Pandas
- NumPy
- Scikit-Learn
- TF-IDF Vectorizer
- Cosine Similarity
- Content-Based Recommendation

---

# 📂 Project Structure

```
AI-Ecommerce-Recommendation-System
│
├── backend
│
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── load_products.py
│   │
│   ├── routers
│   │
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── orders.py
│   │   ├── analytics.py
│   │   └── recommendations.py
│
├── frontend
│
│   ├── pages
│   │
│   │   ├── Login.html
│   │   ├── Register.html
│   │   ├── Home.html
│   │   ├── Products.html
│   │   ├── Wishlist.html
│   │   ├── Cart.html
│   │   ├── Checkout.html
│   │   ├── Orders.html
│   │   ├── Profile.html
│   │   └── Analytics.html
│   │
│   ├── js
│   │   └── api.js
│   │
│   ├── css
│   │   └── style.css
│   │
│   └── assets
│
├── datasets
│
│   └── amazon_flipkart_products_1000.csv
│
├── requirements.txt
│
└── README.md
```

---

# 🔥 Advanced Features

✅ JWT Authentication

✅ Password Encryption

✅ Admin/User Roles

✅ Product Search

✅ Category Filter

✅ Price Sorting

✅ Stock Filter

✅ Wishlist

✅ Shopping Cart

✅ Checkout

✅ Coupon System

✅ Order Management

✅ User Profile

✅ Analytics Dashboard

✅ Product Recommendations

✅ Trending Products

✅ AI Recommendation Engine

✅ PostgreSQL Database

✅ REST APIs

✅ Responsive UI

✅ Machine Learning Integration

---

# ⚙ Installation

## Install Dependencies

```bash
pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install psycopg2
pip install pandas
pip install numpy
pip install scikit-learn
pip install python-jose
pip install passlib
pip install bcrypt
```

Or

```bash
pip install -r requirements.txt
```

---

# ▶ Run Backend

```bash
uvicorn main:app --reload
```

---

# ▶ Import Dataset

```bash
python load_products.py
```

---

# ▶ Open Frontend

Open

```
frontend/pages/Login.html
```

---

# 📸 Project Screens

- Login Page
- Register Page
- Home Page
- Products Page
- Wishlist Page
- Cart Page
- Checkout Page
- Orders Page
- Profile Page
- Analytics Dashboard
- AI Recommendation Page

---

# 🤖 Machine Learning Algorithms

| Algorithm | Purpose |
|------------|----------|
| Content-Based Filtering | Product Recommendation |
| TF-IDF Vectorizer | Text Vectorization |
| Cosine Similarity | Similar Product Detection |

---

# 📈 Future Enhancements

- Collaborative Filtering
- Deep Learning Recommendation
- Email Notifications
- Online Payment Gateway
- Product Reviews
- Product Ratings
- Inventory Management
- Admin Product CRUD
- Sales Reports
- Invoice Generation
- Chatbot Support
- Voice Search
- Image-Based Product Search

---

# 🎓 Conclusion

The **AI Powered E-Commerce Recommendation System** successfully combines **FastAPI**, **PostgreSQL**, **Machine Learning**, and a modern responsive frontend to create a smart online shopping platform. The project demonstrates the implementation of **Content-Based Recommendation using TF-IDF Vectorization and Cosine Similarity**, secure authentication with **JWT**, RESTful APIs, user-specific shopping features, analytics dashboard, and a complete end-to-end E-Commerce workflow.

---

# 👨‍💻 Developed By

## Manish Pawar

### Internship Project

**Project Title**

**AI Powered E-Commerce Recommendation System**

---

## ⭐ Technologies

FastAPI • PostgreSQL • SQLAlchemy • HTML • CSS • JavaScript • Machine Learning • Scikit-Learn • TF-IDF • Cosine Similarity • JWT Authentication • REST API