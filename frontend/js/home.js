// =========================================================
// HOME PAGE LOGIC - GADGETWORLD ADVANCED STOREFRONT
// =========================================================

let homeProducts = [];

async function loadHomeProducts() {
    const grid = document.getElementById("home-products-grid");
    try {
        const products = await getRequest("/products?limit=1000");
        homeProducts = products || [];
        renderHomeProducts(homeProducts);
        if (typeof renderPersonalizedRecommendations === "function") {
            renderPersonalizedRecommendations("ai-personalized-grid");
        }
        if (typeof renderEcosystemBuilder === "function") {
            renderEcosystemBuilder(4, "ai-home-ecosystem-builder");
        }
    } catch (e) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-danger">Error loading products from backend API</div>`;
    }
}

function renderHomeProducts(list) {
    const grid = document.getElementById("home-products-grid");
    if (!list || list.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">No products available for selected category</div>`;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400";

    grid.innerHTML = list.map(p => {
        const name = p.product_name || p.title || "Premium Electronics Device";
        const desc = p.description || "High-performance tech gadget with flagship build.";
        const cat = p.category || "General";
        const brand = p.brand || cat;
        const price = p.price || 999;
        const mrp = Math.round(price * 1.15);
        const savings = Math.round(((mrp - price) / mrp) * 100);
        const rating = p.rating || 4.5;
        const img = p.image_url || fallbackImg;

        const nameEscaped = name.replace(/'/g, "\\'");
        const descEscaped = desc.replace(/'/g, "\\'");

        return `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="product-card">
                    <div class="product-img-wrapper" onclick="openProductQuickView(${p.id}, '${nameEscaped}', ${price}, '${img}', '${cat}', '${brand}', '${descEscaped}')">
                        <img src="${img}" alt="${name}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                        <span class="brand-badge">${brand}</span>
                        <button class="product-wishlist-btn" onclick="event.stopPropagation(); addToWishlist(${p.id}, '${nameEscaped}', ${price}, '${img}')" title="Add to Wishlist">
                            <i class="bi bi-heart-fill"></i>
                        </button>
                    </div>

                    <div class="product-content">
                        <div onclick="openProductQuickView(${p.id}, '${nameEscaped}', ${price}, '${img}', '${cat}', '${brand}', '${descEscaped}')">
                            <div class="d-flex align-items-center justify-content-between mb-1">
                                <span class="product-category">${cat}</span>
                                <span class="savings-badge">${savings}% OFF</span>
                            </div>
                            <h5 class="product-title fw-bold text-white mb-2" style="font-size: 1.05rem;" title="${name}">${name}</h5>
                            
                            <!-- Star Rating with High-Contrast Text -->
                            <div class="d-flex align-items-center gap-1 mb-2">
                                <span class="star-rating"><i class="bi bi-star-fill"></i></span>
                                <span class="text-warning fw-bold small">${rating}</span>
                                <span class="extra-small fw-medium" style="font-size: 0.78rem; color: #cbd5e1;">(1k+ bought)</span>
                            </div>
                        </div>

                        <!-- Price & Action Buttons -->
                        <div class="pt-2 border-top border-secondary border-opacity-10">
                            <div class="d-flex align-items-baseline mb-2">
                                <span class="product-price fw-bold text-success fs-5 me-2">₹${price.toLocaleString('en-IN')}</span>
                                <span class="mrp-price">₹${mrp.toLocaleString('en-IN')}</span>
                            </div>

                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-primary-gradient flex-grow-1" onclick="addToCart(${p.id}, '${nameEscaped}', ${price}, '${img}')">
                                    <i class="bi bi-cart-plus"></i> Add
                                </button>
                                <button class="btn btn-buy-now flex-grow-1" onclick="buyNowInstant(${p.id}, '${nameEscaped}', ${price}, '${img}')">
                                    <i class="bi bi-lightning-fill"></i> Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function filterHomeCategory(cat, btnElement) {
    if (btnElement) {
        const pills = document.querySelectorAll("#category-pills button");
        pills.forEach(btn => {
            btn.classList.remove("btn-primary-gradient");
            btn.classList.add("btn-secondary-glass");
        });
        btnElement.classList.remove("btn-secondary-glass");
        btnElement.classList.add("btn-primary-gradient");
    }

    if (!cat) {
        renderHomeProducts(homeProducts);
    } else {
        const targetCat = cat.toLowerCase().trim();
        const filtered = homeProducts.filter(p => {
            const pCat = (p.category || "").toLowerCase().trim();
            if (!pCat) return false;

            if (pCat === targetCat) return true;

            const isTargetMobile = targetCat === 'mobiles' || targetCat === 'smartphones' || targetCat === 'mobile' || targetCat === 'smartphone';
            const isPCatMobile = pCat === 'mobiles' || pCat === 'smartphones' || pCat === 'mobile' || pCat === 'smartphone';

            const isTargetLaptop = targetCat === 'laptops' || targetCat === 'laptop';
            const isPCatLaptop = pCat === 'laptops' || pCat === 'laptop';

            const isTargetWatch = targetCat === 'smart watches' || targetCat === 'smartwatches' || targetCat === 'watch';
            const isPCatWatch = pCat === 'smart watches' || pCat === 'smartwatches' || pCat === 'watch';

            const isTargetAudio = targetCat === 'headphones' || targetCat === 'headphone' || targetCat === 'audio';
            const isPCatAudio = pCat === 'headphones' || pCat === 'headphone' || pCat === 'audio';

            const isTargetAccessory = targetCat === 'accessories' || targetCat === 'accessory';
            const isPCatAccessory = pCat === 'accessories' || pCat === 'accessory';

            if (isTargetMobile) return isPCatMobile;
            if (isTargetLaptop) return isPCatLaptop;
            if (isTargetWatch) return isPCatWatch;
            if (isTargetAudio) return isPCatAudio;
            if (isTargetAccessory) return isPCatAccessory;

            return pCat.includes(targetCat) || targetCat.includes(pCat);
        });
        renderHomeProducts(filtered);
    }
}

function addToCart(id, title, price, img) {
    const key = typeof getCartKey === "function" ? getCartKey() : "cart";
    let cart = JSON.parse(localStorage.getItem(key) || "[]");
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ id, title, price, img, quantity: 1 });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge();
    showToast(`Added "${title.substring(0, 20)}..." to Cart!`, "success");
}

function addToWishlist(id, title, price, img) {
    const key = typeof getWishlistKey === "function" ? getWishlistKey() : "wishlist";
    let wishlist = JSON.parse(localStorage.getItem(key) || "[]");
    if (!wishlist.some(item => item.id === id)) {
        wishlist.push({ id, title, price, img });
        localStorage.setItem(key, JSON.stringify(wishlist));
        updateWishlistBadge();
        showToast(`Saved to Wishlist!`, "success");
    } else {
        showToast(`Item already in Wishlist`, "warning");
    }
}

document.addEventListener("DOMContentLoaded", loadHomeProducts);