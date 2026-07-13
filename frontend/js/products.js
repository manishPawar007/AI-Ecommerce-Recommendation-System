// =====================================================
// GadgetWorld Products
// =====================================================

let allProducts = [];

// ======================================
// LOAD PRODUCTS
// ======================================

async function loadProducts() {

    try {

        const products = await apiRequest(
            "/products/?skip=0&limit=1000"
        );

        allProducts = Array.isArray(products)
            ? products
            : [];

        if (allProducts.length === 0) {

            alert("No products available.");

            return;

        }

        searchProducts();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to load products."
        );

    }

}

// ======================================
// ADD TO WISHLIST
// ======================================

function addWishlist(id) {

    const product = allProducts.find(
        p => p.id === id
    );

    if (!product) {

        alert("Product not found.");

        return;

    }

    const userId = localStorage.getItem("user_id");

    const wishlistKey = `wishlist_${userId}`;

    let wishlist =
    JSON.parse(
    localStorage.getItem(wishlistKey)
    ) || [];

    const exists = wishlist.some(

        item => item.id === product.id

    );

    if (exists) {

        alert("❤️ Product is already in your wishlist.");

        return;

    }

    wishlist.push({

        id: product.id,

        description: product.description,

        category: product.category,

        image_url: product.image_url,

        price: Number(product.price),

        stock: Number(product.stock || 0),

        rating: Number(product.rating || 4.5)

    });

    localStorage.setItem(

        wishlistKey,

        JSON.stringify(wishlist)

    );

    alert("❤️ Added to Wishlist");

}

// ======================================
// REMOVE FROM WISHLIST
// ======================================

function removeWishlist(id) {

    let wishlist = JSON.parse(

        localStorage.getItem(wishlistKey)

    ) || [];

    wishlist = wishlist.filter(

        item => item.id !== id

    );

    localStorage.setItem(

        wishlistKey,

        JSON.stringify(wishlist)

    );

}

// ======================================
// GET WISHLIST COUNT
// ======================================

function getWishlistCount() {

    return (

        JSON.parse(

            localStorage.getItem(wishlistKey)

        ) || []

    ).length;

}

// ======================================
// START
// ======================================

document.addEventListener(

    "DOMContentLoaded",

    loadProducts

);

console.log(

    "✅ GadgetWorld Products Loaded"

);