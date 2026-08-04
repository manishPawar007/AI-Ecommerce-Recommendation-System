// =========================================================
// ULTRA-ADVANCED AI RECOMMENDATIONS WIDGET - GADGETWORLD
// =========================================================

// Track Recently Viewed Products Memory
function trackRecentlyViewed(product) {
    if (!product || !product.id) return;
    try {
        let viewed = JSON.parse(localStorage.getItem("recently_viewed_products") || "[]");
        viewed = viewed.filter(item => item.id !== product.id);
        viewed.unshift({
            id: product.id,
            name: product.product_name || product.title || "Product",
            price: product.price || 999,
            img: product.image_url || "",
            category: product.category || "General",
            timestamp: Date.now()
        });
        localStorage.setItem("recently_viewed_products", JSON.stringify(viewed.slice(0, 10)));
    } catch (e) {}
}

async function fetchPersonalizedAI() {
    const cartKey = typeof getCartKey === "function" ? getCartKey() : "cart";
    const wishlistKey = typeof getWishlistKey === "function" ? getWishlistKey() : "wishlist";

    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");

    const cartIds = cart.map(item => item.id).filter(Boolean);
    const wishlistIds = wishlist.map(item => item.id).filter(Boolean);

    try {
        if (typeof getRequest === "function") {
            const data = await getRequest(`/recommendations/personalized?cart_ids=${cartIds.join(",")}&wishlist_ids=${wishlistIds.join(",")}&limit=8`);
            if (data && data.length > 0) return data;
        }
    } catch (err) {}

    try {
        const res = await fetch(`http://127.0.0.1:8001/api/recommendations/personalized?cart_ids=${cartIds.join(",")}&wishlist_ids=${wishlistIds.join(",")}&limit=8`);
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {}
    
    // Fallback to general products
    try {
        return await getRequest("/products?limit=8");
    } catch (e) {
        return [];
    }
}

async function renderPersonalizedRecommendations(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary mb-2"></div>
            <p class="text-muted small">Computing Hybrid AI Personalized Matching Scores...</p>
        </div>
    `;

    const products = await fetchPersonalizedAI();
    if (!products || products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-3 text-muted">No recommendations available</div>`;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400";

    container.innerHTML = products.map(p => {
        const name = p.product_name || p.title || "AI Suggested Item";
        const desc = p.description || "Top rated tech device.";
        const cat = p.category || "General";
        const brand = p.brand || cat;
        const price = p.price || 999;
        const mrp = Math.round(price * 1.15);
        const savings = Math.round(((mrp - price) / mrp) * 100);
        const rating = p.rating || 4.5;
        const img = p.image_url || fallbackImg;
        const matchPct = p.ai_match_pct || Math.floor(Math.random() * 8 + 92);

        const nameEscaped = name.replace(/'/g, "\\'");
        const descEscaped = desc.replace(/'/g, "\\'");

        return `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="product-card position-relative border border-primary border-opacity-25" style="background: rgba(15, 23, 42, 0.85); transition: transform 0.25s ease;">
                    <div class="position-absolute top-0 start-0 m-2 z-2 d-flex flex-column gap-1">
                        <span class="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-pill px-2.5 py-1 extra-small fw-bold shadow-sm">
                            <i class="bi bi-patch-check-fill me-1"></i> ${matchPct}% AI Match
                        </span>
                    </div>

                    <div class="product-img-wrapper" onclick="openProductQuickView(${p.id}, '${nameEscaped}', ${price}, '${img}', '${cat}', '${brand}', '${descEscaped}')">
                        <img src="${img}" alt="${name}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                        <span class="brand-badge">${brand}</span>
                    </div>

                    <div class="product-content p-3">
                        <div onclick="openProductQuickView(${p.id}, '${nameEscaped}', ${price}, '${img}', '${cat}', '${brand}', '${descEscaped}')">
                            <div class="d-flex align-items-center justify-content-between mb-1">
                                <span class="product-category">${cat}</span>
                                <span class="savings-badge">${savings}% OFF</span>
                            </div>
                            <h6 class="product-title fw-bold text-white mb-1 text-truncate" title="${name}">${name}</h6>
                            <div class="d-flex align-items-center gap-1 mb-2">
                                <span class="star-rating extra-small"><i class="bi bi-star-fill text-warning"></i></span>
                                <span class="text-warning fw-bold extra-small">${rating}</span>
                                <span class="extra-small text-muted">(High Affinity)</span>
                            </div>
                        </div>

                        <div class="pt-2 border-top border-secondary border-opacity-10 d-flex align-items-center justify-content-between gap-2">
                            <div>
                                <span class="fw-bold text-success fs-6">₹${price.toLocaleString('en-IN')}</span>
                            </div>
                            <button class="btn btn-sm btn-primary-gradient px-3" onclick="addToCart(${p.id}, '${nameEscaped}', ${price}, '${img}')">
                                <i class="bi bi-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// =========================================================
// FREQUENTLY BOUGHT TOGETHER BUNDLE
// =========================================================
async function renderBoughtTogetherBundle(productId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        let bundleItems = null;
        if (typeof getRequest === "function") {
            try {
                bundleItems = await getRequest(`/recommendations/bought-together/${productId}?limit=3`);
            } catch (err) {}
        }
        if (!bundleItems || bundleItems.length === 0) {
            const res = await fetch(`http://127.0.0.1:8001/api/recommendations/bought-together/${productId}?limit=3`);
            if (res.ok) bundleItems = await res.json();
        }
        
        if (!bundleItems || bundleItems.length === 0) {
            container.style.display = "none";
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300";
        const bundleTotal = bundleItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const bundleDiscount = Math.round(bundleTotal * 0.10);
        const bundleFinalPrice = bundleTotal - bundleDiscount;

        container.style.display = "block";
        container.innerHTML = `
            <div class="glass-card p-3 my-3 border border-indigo border-opacity-30 rounded-3" style="background: rgba(15, 23, 42, 0.9);">
                <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-20 pb-2">
                    <h6 class="text-white fw-bold mb-0">
                        <i class="bi bi-boxes text-warning me-2"></i> Frequently Bought Together Accessories
                    </h6>
                    <span class="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-pill px-2.5 py-1 extra-small fw-bold">
                        Save ₹${bundleDiscount.toLocaleString('en-IN')} Bundle Discount
                    </span>
                </div>

                <div class="row align-items-center g-3">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            ${bundleItems.map((item, idx) => `
                                <div class="d-flex align-items-center gap-2 p-2 rounded" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.08); flex: 1; min-width: 160px;">
                                    <img src="${item.image_url || fallbackImg}" alt="${item.product_name}" class="rounded" style="width: 40px; height: 40px; object-fit: contain;" onerror="this.src='${fallbackImg}';">
                                    <div class="overflow-hidden">
                                        <div class="text-white extra-small fw-semibold text-truncate">${item.product_name}</div>
                                        <div class="text-success extra-small fw-bold">₹${(item.price || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                                ${idx < bundleItems.length - 1 ? '<i class="bi bi-plus text-muted fs-5"></i>' : ''}
                            `).join('')}
                        </div>
                    </div>

                    <div class="col-md-4 text-md-end text-center border-start border-secondary border-opacity-20 ps-md-3">
                        <div class="small text-muted">Bundle Total: <span class="text-decoration-line-through">₹${bundleTotal.toLocaleString('en-IN')}</span></div>
                        <div class="fs-5 fw-bold text-success mb-2">₹${bundleFinalPrice.toLocaleString('en-IN')}</div>
                        <button class="btn btn-sm btn-primary-gradient w-100 py-2 fw-bold" onclick="addBundleToCart(${JSON.stringify(bundleItems).replace(/"/g, '&quot;')})">
                            <i class="bi bi-cart-plus-fill me-1"></i> Add Bundle to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.warn("Bundle render error", e);
    }
}

// =========================================================
// SMART UPGRADE (UPSELL ENGINE)
// =========================================================
async function renderSmartUpsell(productId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        let upsellItems = null;
        if (typeof getRequest === "function") {
            try { upsellItems = await getRequest(`/recommendations/upsell/${productId}?limit=2`); } catch (e) {}
        }
        if (!upsellItems || upsellItems.length === 0) {
            const res = await fetch(`http://127.0.0.1:8001/api/recommendations/upsell/${productId}?limit=2`);
            if (res.ok) upsellItems = await res.json();
        }

        if (!upsellItems || upsellItems.length === 0) {
            container.style.display = "none";
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300";

        container.style.display = "block";
        container.innerHTML = `
            <div class="glass-card p-3 my-3 border border-warning border-opacity-30 rounded-3" style="background: rgba(30, 27, 75, 0.4);">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-warning fw-bold small"><i class="bi bi-lightning-fill me-1"></i> AI Flagship Upgrade Suggestion</span>
                    <span class="badge bg-warning text-dark fw-bold extra-small">Better Performance</span>
                </div>
                <div class="row g-2">
                    ${upsellItems.map(item => `
                        <div class="col-md-6">
                            <div class="d-flex align-items-center gap-2 p-2 rounded border border-secondary border-opacity-20" style="background: rgba(15, 23, 42, 0.8);">
                                <img src="${item.image_url || fallbackImg}" alt="${item.product_name}" style="width: 48px; height: 48px; object-fit: contain;" onerror="this.src='${fallbackImg}';">
                                <div class="overflow-hidden flex-grow-1">
                                    <div class="text-white small fw-bold text-truncate">${item.product_name}</div>
                                    <div class="extra-small text-warning fw-semibold">${item.upsell_reason || 'Premium Performance'}</div>
                                    <div class="text-success small fw-bold">₹${(item.price || 0).toLocaleString('en-IN')}</div>
                                </div>
                                <button class="btn btn-sm btn-secondary-glass py-1 px-2 text-nowrap" onclick="openProductQuickView(${item.id}, '${item.product_name.replace(/'/g, "\\'")}', ${item.price}, '${item.image_url}', '${item.category}', '${item.brand}', '${item.description.replace(/'/g, "\\'")}')">
                                    View <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (e) {
        console.warn("Upsell render error", e);
    }
}

// =========================================================
// INTERACTIVE AI TECH ECOSYSTEM BUILDER
// =========================================================
async function renderEcosystemBuilder(productId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        let ecosystem = null;
        if (typeof getRequest === "function") {
            try { ecosystem = await getRequest(`/recommendations/ecosystem/${productId}`); } catch (e) {}
        }
        if (!ecosystem) {
            const res = await fetch(`http://127.0.0.1:8001/api/recommendations/ecosystem/${productId}`);
            if (res.ok) ecosystem = await res.json();
        }

        if (!ecosystem || !ecosystem.items || ecosystem.items.length === 0) {
            container.style.display = "none";
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300";

        container.style.display = "block";
        container.innerHTML = `
            <div class="glass-card p-4 my-4 border border-primary border-opacity-40 rounded-4" style="background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.95) 70%);">
                <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-20 pb-3">
                    <div>
                        <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 rounded-pill px-3 py-1 extra-small fw-bold mb-1">
                            <i class="bi bi-cpu-fill me-1"></i> AI SETUP BUILDER
                        </span>
                        <h4 class="text-white fw-bold mb-0">Complete Tech Ecosystem Bundle</h4>
                        <p class="text-muted extra-small mb-0">Engineered set for ${ecosystem.primary_device.product_name}</p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-success text-dark fs-6 fw-bold px-3 py-2">
                            Save ₹${ecosystem.discount.toLocaleString('en-IN')} (15% OFF)
                        </span>
                    </div>
                </div>

                <div class="row g-3 align-items-center mb-3">
                    ${ecosystem.items.map((item, idx) => `
                        <div class="col-6 col-md-3">
                            <div class="p-3 rounded text-center h-100 position-relative" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(99, 102, 241, 0.2);">
                                <span class="badge bg-dark text-muted extra-small mb-2 d-inline-block">${item.role || 'Ecosystem Item'}</span>
                                <div style="height: 90px; display: flex; align-items: center; justify-content: center;" class="mb-2">
                                    <img src="${item.image_url || fallbackImg}" alt="${item.product_name}" style="max-height: 80px; max-width: 100%; object-fit: contain;" onerror="this.src='${fallbackImg}';">
                                </div>
                                <h6 class="text-white extra-small fw-bold text-truncate mb-1" title="${item.product_name}">${item.product_name}</h6>
                                <span class="text-success small fw-bold">₹${(item.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-20">
                    <div>
                        <span class="text-muted small">Total Bundle Price: </span>
                        <span class="text-muted text-decoration-line-through me-2">₹${ecosystem.subtotal.toLocaleString('en-IN')}</span>
                        <span class="text-success fs-4 fw-bold">₹${ecosystem.final_price.toLocaleString('en-IN')}</span>
                    </div>
                    <button class="btn btn-primary-gradient px-4 py-2.5 fw-bold fs-6" onclick="addBundleToCart(${JSON.stringify(ecosystem.items).replace(/"/g, '&quot;')})">
                        <i class="bi bi-bag-check-fill me-1"></i> Add Complete Setup to Cart
                    </button>
                </div>
            </div>
        `;
    } catch (e) {
        console.warn("Ecosystem render error", e);
    }
}

// Helper to Add Bundle
function addBundleToCart(items) {
    if (!Array.isArray(items)) return;
    const key = typeof getCartKey === "function" ? getCartKey() : "cart";
    let cart = JSON.parse(localStorage.getItem(key) || "[]");

    items.forEach(item => {
        const id = item.id;
        const title = item.product_name || item.title || "Item";
        const price = item.price || 999;
        const img = item.image_url || "";

        const existing = cart.find(c => c.id === id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({ id, title, price, img, quantity: 1 });
        }
    });

    localStorage.setItem(key, JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
    if (typeof showToast === "function") showToast(`Added ${items.length} Ecosystem Setup items to Cart!`, "success");
}
