/**
 * ===================================================================
 * GADGETWORLD WISHLIST LOGIC (wishlist.js)
 * PostgreSQL Wishlist Sync, 1-Click Move to Cart, AI Recommendation Matches
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    await loadWishlist();
});

function renderUserNav() {
    const userSlot = document.getElementById("userNavSlot");
    if (!userSlot) return;

    const user = getUser();
    if (user) {
        userSlot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <a href="Profile.html" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
                    <span>👤</span> <span>${user.name.split(' ')[0]}</span>
                </a>
                ${user.role === 'admin' ? `
                    <a href="../admin/dashboard.html" class="btn btn-primary btn-sm" style="background: var(--gradient-accent);">
                        👑 Admin
                    </a>
                ` : ''}
            </div>
        `;
    } else {
        userSlot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <a href="Login.html" class="btn btn-primary btn-sm">Sign In</a>
            </div>
        `;
    }
}

async function loadWishlist() {
    const user = getUser();
    const grid = document.getElementById("wishlistGrid");
    if (!grid) return;

    if (!user) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;" class="glass-panel">
                <div style="font-size: 3.5rem; margin-bottom: 12px;">🤍</div>
                <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Sign In to View Wishlist</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Please sign in to view and manage your saved dream gadgets.</p>
                <a href="Login.html" class="btn btn-primary">Sign In to Continue 🚀</a>
            </div>
        `;
        loadWishlistRecommendations(null);
        return;
    }

    try {
        const response = await apiRequest(`/wishlist/?user_id=${user.id}`);
        const items = response.items || [];
        await syncBadges();

        if (items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;" class="glass-panel">
                    <div style="font-size: 3.5rem; margin-bottom: 12px;">🤍</div>
                    <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Your Wishlist is Empty</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Browse products and click the heart icon to save items for later.</p>
                    <a href="Products.html" class="btn btn-primary">
                        Explore Catalog →
                    </a>
                </div>
            `;
            loadWishlistRecommendations(null);
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

        grid.innerHTML = items.map(item => {
            const prod = item.product || {};
            const img = prod.image_url || fallbackImg;
            const inStock = (prod.stock || 0) > 0;
            const title = prod.description || prod.product_name || `Product #${item.product_id}`;

            return `
                <div class="product-card" id="wishlist-card-${item.id}">
                    <div class="product-image-container" onclick="openQuickView(${item.product_id})" style="cursor: pointer;">
                        <img src="${img}" alt="${title}" class="product-image" onerror="this.src='${fallbackImg}'">
                        <div class="product-badge-float">
                            <span class="badge ${inStock ? 'badge-stock' : 'badge-low-stock'}">
                                ${inStock ? '✔ In Stock' : '✖ Out of Stock'}
                            </span>
                        </div>
                        <button class="product-wishlist-float active" title="Remove from Wishlist" onclick="event.stopPropagation(); removeFromWishlistUI(${item.product_id})">
                            ❤️
                        </button>
                    </div>

                    <div class="product-info">
                        <div class="product-category">${prod.category || 'General'}</div>
                        <h4 class="product-title" title="${title}" onclick="openQuickView(${item.product_id})" style="cursor: pointer;">
                            ${title}
                        </h4>

                        <div class="product-meta">
                            <div class="product-price">${formatPrice(prod.price)}</div>
                            <div class="product-rating">⭐ 4.5</div>
                        </div>

                        <div class="product-actions">
                            <button class="btn btn-primary btn-sm" ${!inStock ? 'disabled' : ''} onclick="moveToCartUI(${item.product_id}, this)">
                                <span>🛒</span> Move to Cart
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="removeFromWishlistUI(${item.product_id})" title="Remove">
                                🗑
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Load recommendations based on first item
        const firstProdId = items[0].product_id;
        loadWishlistRecommendations(firstProdId);
    } catch (e) {
        console.error("Wishlist load error:", e);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Error loading wishlist: ${e.message}</div>`;
    }
}

async function removeFromWishlistUI(productId) {
    const user = getUser();
    const userId = user ? user.id : 2;

    try {
        await apiRequest(`/wishlist/${productId}?user_id=${userId}`, "DELETE");
        showToast("Removed from Wishlist", "Item removed", "info");
        await loadWishlist();
    } catch (e) {
        showToast("Error", e.message, "error");
    }
}

async function moveToCartUI(productId, btnElement) {
    const user = getUser();
    const userId = user ? user.id : 2;

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.textContent = "Moving...";
    }

    try {
        const res = await apiRequest(`/wishlist/move-to-cart?product_id=${productId}&user_id=${userId}`, "POST");
        showToast("Moved to Cart 🛒", res.message || "Moved item into cart", "success");
        await loadWishlist();
    } catch (e) {
        showToast("Move Error", e.message, "error");
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = `<span>🛒</span> Move to Cart`;
        }
    }
}

async function loadWishlistRecommendations(productId) {
    const grid = document.getElementById("wishlistRecommendationsGrid");
    if (!grid) return;

    try {
        let items = [];
        if (productId) {
            items = await apiRequest(`/recommendations/similar?product_id=${productId}&limit=4`);
        } else {
            items = await apiRequest(`/recommendations/trending?limit=4`);
        }

        if (!items || items.length === 0) {
            grid.innerHTML = "";
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
        grid.innerHTML = items.map(p => `
            <div class="product-card">
                <div class="product-image-container" onclick="openQuickView(${p.id})" style="cursor: pointer;">
                    <img src="${p.image_url || fallbackImg}" alt="${p.product_name}" class="product-image" onerror="this.src='${fallbackImg}'">
                    <div class="product-badge-float">
                        <span class="badge badge-ai">🤖 ${p.match_percentage || 95}% Match</span>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-category">${p.category || 'General'}</div>
                    <h4 class="product-title" title="${p.product_name}" onclick="openQuickView(${p.id})" style="cursor: pointer;">
                        ${p.product_name}
                    </h4>

                    <div class="product-meta">
                        <div class="product-price">${formatPrice(p.price)}</div>
                        <div class="product-rating">⭐ ${p.rating || 4.5}</div>
                    </div>

                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="addToCartGlobal(${p.id}, 1, this)">
                            <span>🛒</span> Add to Cart
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="openQuickView(${p.id})" title="Quick View">
                            👁️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("Wishlist recommendations error:", e);
    }
}