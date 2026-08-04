// =========================================================
// WISHLIST LOGIC - GADGETWORLD STOREFRONT
// =========================================================

function getWishlistStorageKey() {
    return typeof getWishlistKey === "function" ? getWishlistKey() : "wishlist";
}

function loadWishlist() {
    const grid = document.getElementById("wishlist-grid");
    const key = getWishlistStorageKey();
    const wishlist = JSON.parse(localStorage.getItem(key) || "[]");

    if (!wishlist || wishlist.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-heart-break fs-1 d-block mb-3 text-primary"></i>
                <h4 class="text-white fw-bold">Your Wishlist is Empty</h4>
                <p class="small mb-4" style="color: #cbd5e1;">Save flagship electronics products to your wishlist while shopping to review them later.</p>
                <a href="Products.html" class="btn btn-primary-gradient px-4 py-2.5">
                    <i class="bi bi-grid-fill me-1"></i> Explore Product Catalog
                </a>
            </div>
        `;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400";

    grid.innerHTML = wishlist.map((p, index) => {
        const title = p.title || "Electronics Gadget";
        const price = p.price || 999;
        const mrp = Math.round(price * 1.15);
        const savings = Math.round(((mrp - price) / mrp) * 100);
        const img = p.img || fallbackImg;
        const brand = p.brand || "Flagship";

        return `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="product-card">
                    <div class="product-img-wrapper" style="height: 220px; background: #0f172a; padding: 0.75rem; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="${img}" alt="${title}" onerror="this.onerror=null; this.src='${fallbackImg}';" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        <span class="brand-badge">${brand}</span>
                    </div>

                    <div class="product-content">
                        <div>
                            <div class="d-flex align-items-center justify-content-between mb-1">
                                <span class="product-category">Saved Item</span>
                                <span class="savings-badge">${savings}% OFF</span>
                            </div>

                            <h5 class="product-title fw-bold text-white mb-2" style="font-size: 1.05rem;" title="${title}">${title}</h5>

                            <div class="d-flex align-items-center gap-1 mb-2">
                                <span class="star-rating"><i class="bi bi-star-fill"></i></span>
                                <span class="text-warning fw-bold small">4.8</span>
                                <span class="extra-small fw-medium" style="font-size: 0.78rem; color: #cbd5e1;">(Top Rated)</span>
                            </div>
                        </div>

                        <div class="pt-2 border-top border-secondary border-opacity-10">
                            <div class="d-flex align-items-baseline mb-2">
                                <span class="product-price fw-bold text-success fs-5 me-2">₹${price.toLocaleString('en-IN')}</span>
                                <span class="mrp-price">₹${mrp.toLocaleString('en-IN')}</span>
                            </div>

                            <div class="d-flex align-items-center justify-content-between gap-2">
                                <button class="btn btn-sm btn-primary-gradient flex-grow-1" onclick="moveToCart(${index})">
                                    <i class="bi bi-cart-plus me-1"></i> Move to Cart
                                </button>
                                <button class="btn btn-sm btn-danger py-1.5 px-2.5" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="removeFromWishlist(${index})" title="Remove">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function moveToCart(index) {
    const wKey = getWishlistStorageKey();
    let wishlist = JSON.parse(localStorage.getItem(wKey) || "[]");
    const item = wishlist[index];
    if (!item) return;

    const cKey = typeof getCartKey === "function" ? getCartKey() : "cart";
    let cart = JSON.parse(localStorage.getItem(cKey) || "[]");
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ id: item.id, title: item.title, price: item.price, img: item.img, quantity: 1 });
    }

    localStorage.setItem(cKey, JSON.stringify(cart));
    wishlist.splice(index, 1);
    localStorage.setItem(wKey, JSON.stringify(wishlist));

    updateCartBadge();
    updateWishlistBadge();
    showToast("Moved to Cart!", "success");
    loadWishlist();
}

function removeFromWishlist(index) {
    const wKey = getWishlistStorageKey();
    let wishlist = JSON.parse(localStorage.getItem(wKey) || "[]");
    wishlist.splice(index, 1);
    localStorage.setItem(wKey, JSON.stringify(wishlist));
    updateWishlistBadge();
    showToast("Item removed from Wishlist", "info");
    loadWishlist();
}

document.addEventListener("DOMContentLoaded", loadWishlist);