// =====================================================
// GadgetWorld Wishlist
// wishlist.js
// =====================================================

// ======================================
// LOAD WISHLIST
// ======================================

function loadWishlist() {

    const container =
        document.getElementById(
            "wishlist"
        );

    if (!container) return;

    const wishlist = JSON.parse(

        localStorage.getItem(
            "wishlist"
        )

    ) || [];

    if (wishlist.length === 0) {

        container.innerHTML = `

        <div class="card text-center">

            <h2>❤️ Your Wishlist is Empty</h2>

            <br>

            <p>

                Save your favourite gadgets here.

            </p>

            <br>

            <a href="Products.html">

                <button class="primary-btn">

                    Browse Products

                </button>

            </a>

        </div>

        `;

        updateWishlistCount();

        return;

    }

    let html = "";

    wishlist.forEach(product => {

        html += `

        <div class="card product-card fade-in">

            <img

                src="${product.image_url || "../assets/default-product.png"}"

                class="product-image"

                alt="${product.description}"

            >

            <span class="discount">

                ❤️ Wishlist

            </span>

            <h3>

                ${product.description}

            </h3>

            <p>

                ${product.category || "Electronics"}

            </p>

            <div class="rating">

                ⭐ ${product.rating || 4.5}

            </div>

            <h2 class="price">

                ₹${Number(product.price).toLocaleString("en-IN")}

            </h2>

            <div class="btn-group">

                <button

                    class="primary-btn"

                    onclick="moveToCart(${product.id})"

                >

                    Add To Cart

                </button>

                <button

                    class="danger-btn"

                    onclick="removeWishlist(${product.id})"

                >

                    Remove

                </button>

            </div>

        </div>

        `;

    });

    container.innerHTML = html;

    updateWishlistCount();

}

// ======================================
// REMOVE FROM WISHLIST
// ======================================

function removeWishlist(id) {

    let wishlist = JSON.parse(

        localStorage.getItem("wishlist")

    ) || [];

    wishlist = wishlist.filter(

        item => item.id !== id

    );

    localStorage.setItem(
    wishlistKey,
    JSON.stringify(wishlist)
    );

    loadWishlist();

}

// ======================================
// MOVE TO CART
// ======================================

async function moveToCart(id) {

    try {

        const userId =
            localStorage.getItem(
                "user_id"
            );

        if (!userId) {

            alert("Please login first.");

            window.location.href =
                "Login.html";

            return;

        }

        await apiRequest(

            `/cart/?user_id=${userId}&product_id=${id}&quantity=1`,

            "POST"

        );

        removeWishlist(id);

        alert(

            "✅ Product Added To Cart"

        );

    }

    catch (error) {

        console.error(error);

        alert(

            error.message ||

            "Unable to add product."

        );

    }

}

// ======================================
// CLEAR WISHLIST
// ======================================

function clearWishlist() {

    if (

        !confirm(

            "Clear your entire wishlist?"

        )

    ) return;

    localStorage.removeItem(

        "wishlist"

    );

    loadWishlist();

}

// ======================================
// WISHLIST COUNT
// ======================================

function updateWishlistCount() {

    const badge =

        document.getElementById(

            "wishlistCount"

        );

    if (!badge) return;

    const userId = localStorage.getItem("user_id");

    const wishlistKey = `wishlist_${userId}`;

    const wishlist =
    JSON.parse(
    localStorage.getItem(wishlistKey)
    ) || [];

    badge.innerText = wishlist.length;

}

// ======================================
// START
// ======================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        loadWishlist();

    }

);

console.log(

    "✅ GadgetWorld Wishlist Loaded"

);