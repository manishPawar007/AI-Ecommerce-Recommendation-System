import requests

BASE_URL = "http://127.0.0.1:8001/api"


def login(email, password):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    return response


def register(name, email, password):
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password
        }
    )
    return response


def get_products():
    response = requests.get(
        f"{BASE_URL}/products"
    )
    return response.json()


def get_trending():
    response = requests.get(
        f"{BASE_URL}/recommendations/trending"
    )
    return response.json()


def get_similar(product):
    response = requests.get(
        f"{BASE_URL}/recommendations/similar",
        params={
            "product_name": product
        }
    )
    return response.json()


def get_bought_together(product):
    response = requests.get(
        f"{BASE_URL}/recommendations/bought-together",
        params={
            "product_name": product
        }
    )
    return response.json()