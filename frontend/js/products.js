// =========================================================
// PRODUCTS CATALOG LOGIC - GADGETWORLD ADVANCED STOREFRONT
// =========================================================

let catalogProducts = [];

async function initCatalog() {
    await loadCatalog();
    checkUrlSearchQuery();
}

async function loadCatalog() {
    const grid = document.getElementById("catalog-grid");
    try {
        const [products, categories] = await Promise.all([
            getRequest("/products?limit=1000"),
            getRequest("/admin/categories").catch(() => [])
        ]);

        catalogProducts = products || [];
        populateCategoriesFilter(categories);
        checkUrlSearchQuery();
        filterCatalog();
    } catch (e) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-danger">Error loading product catalog from backend</div>`;
    }
}

function populateCategoriesFilter(categories) {
    const filter = document.getElementById("catalog-category-filter");
    if (!filter) return;

    let catList = [];
    if (catalogProducts && catalogProducts.length > 0) {
        catList = [...new Set(catalogProducts.map(p => p.category).filter(Boolean))];
    } else if (categories && categories.length > 0) {
        catList = categories.map(c => c.name || c.category_name).filter(Boolean);
    }

    if (catList.length === 0) {
        catList = ["Mobiles", "Laptops", "Smart Watches", "Headphones"];
    }

    filter.innerHTML = `<option value="">All Categories</option>` + 
        catList.map(c => `<option value="${c}">${c}</option>`).join("");
}

function checkUrlSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search");
    const categoryQuery = params.get("category");

    if (searchQuery) {
        const input = document.getElementById("catalog-search");
        if (input) {
            input.value = searchQuery;
        }
    }

    if (categoryQuery) {
        const filter = document.getElementById("catalog-category-filter");
        if (filter) {
            // Find best matching option or add option
            let found = Array.from(filter.options).find(opt => 
                opt.value.toLowerCase() === categoryQuery.toLowerCase() ||
                opt.value.toLowerCase().includes(categoryQuery.toLowerCase()) ||
                categoryQuery.toLowerCase().includes(opt.value.toLowerCase())
            );
            if (found) {
                filter.value = found.value;
            } else {
                const newOpt = document.createElement("option");
                newOpt.value = categoryQuery;
                newOpt.textContent = categoryQuery;
                filter.appendChild(newOpt);
                filter.value = categoryQuery;
            }
        }
    }
}

function resetCatalogFilters() {
    document.getElementById("catalog-search").value = "";
    document.getElementById("catalog-category-filter").value = "";
    document.getElementById("catalog-sort").value = "default";
    const radioAny = document.querySelector('input[name="ratingFilter"][value="0"]');
    if (radioAny) radioAny.checked = true;
    filterCatalog();
}

function filterCatalog() {
    const query = (document.getElementById("catalog-search")?.value || "").toLowerCase().trim();
    const cat = document.getElementById("catalog-category-filter")?.value || "";
    const minRating = parseFloat(document.querySelector('input[name="ratingFilter"]:checked')?.value || "0");
    const sort = document.getElementById("catalog-sort")?.value || "default";

    let filtered = catalogProducts.filter(p => {
        const name = (p.product_name || p.title || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();

        const matchesQuery = !query || name.includes(query) || desc.includes(query) || brand.includes(query);
        
        let matchesCat = true;
        if (cat) {
            const targetCat = cat.toLowerCase().trim();
            const pCat = (p.category || "").toLowerCase().trim();

            if (pCat === targetCat) {
                matchesCat = true;
            } else {
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

                if (isTargetMobile) matchesCat = isPCatMobile;
                else if (isTargetLaptop) matchesCat = isPCatLaptop;
                else if (isTargetWatch) matchesCat = isPCatWatch;
                else if (isTargetAudio) matchesCat = isPCatAudio;
                else if (isTargetAccessory) matchesCat = isPCatAccessory;
                else matchesCat = pCat.includes(targetCat) || targetCat.includes(pCat);
            }
        }

        const matchesRating = (p.rating || 4.5) >= minRating;

        return matchesQuery && matchesCat && matchesRating;
    });

    if (sort === "price_low") {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price_high") {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === "title_az") {
        filtered.sort((a, b) => (a.product_name || a.title || "").localeCompare(b.product_name || b.title || ""));
    }

    renderCatalog(filtered);
}

function renderCatalog(list) {
    const grid = document.getElementById("catalog-grid");
    const count = document.getElementById("catalog-count");
    if (count) count.textContent = list.length;

    if (!list || list.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">No products found matching criteria</div>`;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400";

    grid.innerHTML = list.map(p => {
        const name = p.product_name || p.title || "Product Item";
        const desc = p.description || "High-tech electronics item with premium build quality.";
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
            <div class="col-sm-6 col-md-4">
                <div class="product-card">
                    <div class="product-img-wrapper" onclick="openProductQuickView(${p.id}, '${nameEscaped}', ${price}, '${img}', '${cat}', '${brand}', '${descEscaped}')">
                        <img src="${img}" alt="${name}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                        <span class="brand-badge">${brand}</span>
                        <button class="product-wishlist-btn" onclick="event.stopPropagation(); addToWishlist(${p.id}, '${nameEscaped}', ${price}, '${img}')" title="Save to Wishlist">
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
                                <span class="extra-small fw-medium" style="font-size: 0.78rem; color: #cbd5e1;">(1.2k+ reviews)</span>
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

document.addEventListener("DOMContentLoaded", initCatalog);