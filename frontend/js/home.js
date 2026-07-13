// =====================================================
// GadgetWorld Recommendation System
// recommendation.js
// =====================================================

// ======================================
// LOAD TRENDING PRODUCTS
// ======================================

async function loadTrending() {

    const container =
        document.getElementById(
            "recommendations"
        );

    if (!container) return;

    container.innerHTML = `

        <div class="loading"></div>

    `;

    try {

        const products =
            await apiRequest(
                "/recommendations/trending"
            );

        if (!products || products.length === 0) {

            container.innerHTML = `

                <div class="card text-center">

                    <h2>

                        No Trending Products Available

                    </h2>

                </div>

            `;

            return;

        }

        let html = "";

        products.forEach(product => {

            html += `

            <div class="card product-card fade-in">

                <span class="discount">

                    🔥 Trending

                </span>

                <img

                    src="${product.image_url || "../assets/default-product.png"}"

                    class="product-image"

                    alt="${product.description}"

                >

                <h3>

                    ${product.description}

                </h3>

                <div class="rating">

                    ⭐ ${product.rating || 4.8}

                </div>

                <p class="price">

                    ₹${Number(product.price).toLocaleString("en-IN")}

                </p>

                <p>

                    Sold :

                    <strong>

                        ${product.sold || 0}

                    </strong>

                </p>

                <div class="btn-group">

                    <button

                        class="primary-btn"

                        onclick="addToCart(${product.id})"

                    >

                        Add To Cart

                    </button>

                    <button

                        class="buy-btn"

                        onclick="buyNow(${product.id})"

                    >

                        Buy Now

                    </button>

                </div>

            </div>

            `;

        });

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="card">

                <h2>

                    Unable To Load Trending Products

                </h2>

            </div>

        `;

    }

}

// ======================================
// ADD TO CART
// ======================================

async function addToCart(productId) {

    try {

        const userId =
            localStorage.getItem("user_id");

        if (!userId) {

            alert("Please login first.");

            window.location.href =
                "Login.html";

            return;

        }

        const data =
            await apiRequest(

                `/cart/?user_id=${userId}&product_id=${productId}&quantity=1`,

                "POST"

            );

        alert(

            data.message ||

            "Product Added To Cart"

        );

    }

    catch (error) {

        console.error(error);

        alert(

            error.message ||

            "Unable To Add Product"

        );

    }

}

// ======================================
// BUY NOW
// ======================================

function buyNow(productId) {

    localStorage.setItem(

        "buy_product",

        productId

    );

    window.location.href =

        "Checkout.html";

}

// ======================================
// START
// ======================================

document.addEventListener(

    "DOMContentLoaded",

    loadTrending

);

console.log(

    "✅ GadgetWorld Recommendation System Loaded"

);