/**
 * ===================================================================
 * GADGETWORLD HOME PAGE LOGIC (home.js)
 * Live PostgreSQL Integration & AI Recommendation Feed
 * ===================================================================
 */

let allTrendingProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    await Promise.all([
        loadCategories(),
        loadPersonalizedRecommendations(),
        loadTrendingProducts()
    ]);
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

// -------------------------------------------------------------
// Load Categories from PostgreSQL
// -------------------------------------------------------------
async function loadCategories() {
    const pillsContainer = document.getElementById("heroCategoryPills");
    const gridContainer = document.getElementById("categoriesGrid");

    try {
        const categories = await apiRequest("/products/categories/list");

        if (pillsContainer) {
            pillsContainer.innerHTML = categories.map(cat => `
                <div class="category-pill" onclick="window.location.href='Products.html?category=${encodeURIComponent(cat.name)}'">
                    <span>${cat.icon}</span> ${cat.name} (${cat.product_count})
                </div>
            `).join('');
        }

        if (gridContainer) {
            gridContainer.innerHTML = categories.map(cat => `
                <div class="category-card" onclick="window.location.href='Products.html?category=${encodeURIComponent(cat.name)}'">
                    <div class="category-icon">${cat.icon}</div>
                    <div class="category-name">${cat.name}</div>
                    <div class="category-count">${cat.product_count} Products • From ${formatPrice(cat.min_price)}</div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Failed to load categories:", e);
    }
}

// -------------------------------------------------------------
// Load AI Personalized Recommendations
// -------------------------------------------------------------
async function loadPersonalizedRecommendations() {
    const grid = document.getElementById("personalizedGrid");
    if (!grid) return;

    const user = getUser();
    const banner = document.getElementById("aiPersonaBanner");

    if (!user) {
        if (banner) banner.style.display = "none";
        try {
            const items = await apiRequest(`/recommendations/trending?limit=4`);
            grid.innerHTML = items.map(p => createProductCardHTML(p, true)).join('');
        } catch (e) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Explore our top trending gadgets below.</div>`;
        }
        return;
    }

    try {
        if (banner) banner.style.display = "block";
        const [items, persona] = await Promise.all([
            apiRequest(`/recommendations/personalized?user_id=${user.id}&limit=4`),
            apiRequest(`/recommendations/user-persona?user_id=${user.id}`).catch(() => null)
        ]);

        if (persona) {
            const bannerTitle = document.getElementById("personaTitle");
            const bannerBadge = document.getElementById("personaBadge");
            const bannerIntent = document.getElementById("personaIntent");
            if (bannerTitle) bannerTitle.textContent = `${user.name.split(' ')[0]}'s Persona: ${persona.persona_title || 'Flagship Tech Explorer'}`;
            if (bannerBadge) bannerBadge.textContent = persona.persona_badge || "⚡ Smart Adopter";
            if (bannerIntent) bannerIntent.textContent = persona.predicted_intent || "Curating tailored high-performance gadgets.";
        }

        if (!items || items.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No personalized items found.</div>`;
            return;
        }

        grid.innerHTML = items.map(p => createProductCardHTML(p, true)).join('');
    } catch (e) {
        console.error("Personalized picks load error:", e);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Personalized recommendations temporarily unavailable.</div>`;
    }
}

// -------------------------------------------------------------
// Load Trending Products from PostgreSQL
// -------------------------------------------------------------
async function loadTrendingProducts() {
    const grid = document.getElementById("trendingGrid");
    if (!grid) return;

    try {
        const items = await apiRequest(`/recommendations/trending?limit=12`);
        allTrendingProducts = items;

        if (items && items.length > 0) {
            // Update hero preview card with top trending item
            const topItem = items[0];
            const heroImg = document.getElementById("heroFeaturedImg");
            const heroCat = document.getElementById("heroFeaturedCat");
            const heroTitle = document.getElementById("heroFeaturedTitle");
            const heroPrice = document.getElementById("heroFeaturedPrice");
            const heroBtn = document.getElementById("heroFeaturedBtn");

            if (heroImg) heroImg.src = topItem.image_url;
            if (heroCat) heroCat.textContent = topItem.category;
            if (heroTitle) heroTitle.textContent = topItem.product_name || topItem.description;
            if (heroPrice) heroPrice.textContent = formatPrice(topItem.price);
            if (heroBtn) heroBtn.onclick = () => openQuickView(topItem.id);

            renderTrendingGrid(items);
        }
    } catch (e) {
        console.error("Trending load error:", e);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Trending products temporarily unavailable.</div>`;
    }
}

function renderTrendingGrid(items) {
    const grid = document.getElementById("trendingGrid");
    if (!grid) return;
    grid.innerHTML = items.map(p => createProductCardHTML(p, false)).join('');
}

function filterTrending(category, btnElement) {
    // Update active button state
    const container = document.getElementById("trendingFilterBtns");
    if (container) {
        container.querySelectorAll("button").forEach(b => {
            b.className = "btn btn-secondary btn-sm";
        });
    }
    if (btnElement) {
        btnElement.className = "btn btn-primary btn-sm active";
    }

    if (category === "all") {
        renderTrendingGrid(allTrendingProducts);
    } else {
        const filtered = allTrendingProducts.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
        renderTrendingGrid(filtered);
    }
}

// -------------------------------------------------------------
// Product Card HTML Generator
// -------------------------------------------------------------
function createProductCardHTML(product, isPersonalized = false) {
    const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
    const imgUrl = product.image_url || fallbackImg;
    const title = product.product_name || product.description || "Product";
    const matchBadge = product.match_badge || (isPersonalized ? "🤖 98% Match" : "🔥 Trending");
    const inStock = (product.stock || 0) > 0;

    return `
        <div class="product-card">
            <div class="product-image-container" onclick="openQuickView(${product.id})" style="cursor: pointer;">
                <img src="${imgUrl}" alt="${title}" class="product-image" onerror="this.src='${fallbackImg}'">
                <div class="product-badge-float">
                    <span class="badge ${isPersonalized ? 'badge-ai' : 'badge-trending'}">${matchBadge}</span>
                </div>
                <button class="product-wishlist-float" title="Add to Wishlist" onclick="event.stopPropagation(); toggleWishlistGlobal(${product.id}, this)">
                    🤍
                </button>
            </div>

            <div class="product-info">
                <div class="product-category">${product.category || 'General'}</div>
                <h4 class="product-title" title="${title}" onclick="openQuickView(${product.id})" style="cursor: pointer;">
                    ${title}
                </h4>

                <div class="product-meta">
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <div class="product-rating">⭐ ${product.rating || 4.5}</div>
                </div>

                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" ${!inStock ? 'disabled' : ''} onclick="addToCartGlobal(${product.id}, 1, this)">
                        <span>🛒</span> Add to Cart
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openQuickView(${product.id})" title="Quick View">
                        👁️
                    </button>
                </div>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------
// Hero Search Action
// -------------------------------------------------------------
function handleHeroSearch() {
    const input = document.getElementById("heroSearchInput");
    if (input && input.value.trim()) {
        window.location.href = `Products.html?search=${encodeURIComponent(input.value.trim())}`;
    }
}