/**
 * ===================================================================
 * GADGETWORLD PRODUCTS CATALOG LOGIC (products.js)
 * Live Filtering, Search, Pagination, and Sorting
 * ===================================================================
 */

let currentPage = 1;
const itemsPerPage = 12;
let searchDebounceTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    await loadCategoryFilters();

    // Check URL parameters for pre-selected category or search keyword
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("category");
    const searchParam = urlParams.get("search");

    if (catParam) {
        const catRadio = document.querySelector(`input[name="catFilter"][value="${catParam}"]`);
        if (catRadio) catRadio.checked = true;
    }

    if (searchParam) {
        const searchInput = document.getElementById("catalogSearchInput");
        if (searchInput) searchInput.value = searchParam;
    }

    await fetchAndRenderProducts();
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

async function loadCategoryFilters() {
    const container = document.getElementById("categoryFilterList");
    if (!container) return;

    try {
        const categories = await apiRequest("/products/categories/list");
        const optionsHTML = categories.map(cat => `
            <label class="filter-option">
                <input type="radio" name="catFilter" value="${cat.name}" onchange="currentPage=1; applyFilters();">
                <span>${cat.icon} ${cat.name} (${cat.product_count})</span>
            </label>
        `).join('');

        container.innerHTML = `
            <label class="filter-option">
                <input type="radio" name="catFilter" value="all" checked onchange="currentPage=1; applyFilters();">
                <span>🛍 All Categories</span>
            </label>
            ${optionsHTML}
        `;
    } catch (e) {
        console.error("Failed to load category filters:", e);
    }
}

function debounceSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        currentPage = 1;
        applyFilters();
    }, 350);
}

function resetFilters() {
    const searchInput = document.getElementById("catalogSearchInput");
    if (searchInput) searchInput.value = "";

    const allCatRadio = document.querySelector('input[name="catFilter"][value="all"]');
    if (allCatRadio) allCatRadio.checked = true;

    const priceSlider = document.getElementById("priceRange");
    if (priceSlider) {
        priceSlider.value = 150000;
        document.getElementById("priceDisplay").textContent = "₹1,50,000";
    }

    const inStockBox = document.getElementById("inStockFilter");
    if (inStockBox) inStockBox.checked = false;

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = "featured";

    currentPage = 1;
    applyFilters();
}

async function applyFilters() {
    await fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
    const grid = document.getElementById("productsCatalogGrid");
    if (!grid) return;

    grid.innerHTML = `
        <div class="skeleton" style="height: 360px;"></div>
        <div class="skeleton" style="height: 360px;"></div>
        <div class="skeleton" style="height: 360px;"></div>
        <div class="skeleton" style="height: 360px;"></div>
    `;

    // Gather filter parameters
    const searchInput = document.getElementById("catalogSearchInput");
    const searchVal = searchInput ? searchInput.value.trim() : "";

    const selectedCat = document.querySelector('input[name="catFilter"]:checked')?.value || "all";
    const maxPrice = document.getElementById("priceRange")?.value || 150000;
    const inStock = document.getElementById("inStockFilter")?.checked || false;
    const sortBy = document.getElementById("sortSelect")?.value || "featured";

    const skip = (currentPage - 1) * itemsPerPage;

    let queryUrl = `/products/?skip=${skip}&limit=${itemsPerPage}&max_price=${maxPrice}&in_stock_only=${inStock}&sort_by=${sortBy}`;
    if (selectedCat && selectedCat !== "all") {
        queryUrl += `&category=${encodeURIComponent(selectedCat)}`;
    }
    if (searchVal) {
        queryUrl += `&search=${encodeURIComponent(searchVal)}`;
    }

    try {
        const response = await apiRequest(queryUrl);
        const products = response.products || [];
        const total = response.total || 0;

        document.getElementById("showingCount").textContent = products.length;
        document.getElementById("totalCount").textContent = total;

        if (products.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;" class="glass-panel">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No Products Found</h3>
                    <p style="color: var(--text-muted); margin-bottom: 18px;">Try adjusting your search criteria or resetting filters.</p>
                    <button class="btn btn-primary btn-sm" onclick="resetFilters()">Reset Filters</button>
                </div>
            `;
            renderPagination(0);
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
        grid.innerHTML = products.map(p => {
            const inStockProd = (p.stock || 0) > 0;
            return `
                <div class="product-card">
                    <div class="product-image-container" onclick="openQuickView(${p.id})" style="cursor: pointer;">
                        <img src="${p.image_url || fallbackImg}" alt="${p.description}" class="product-image" onerror="this.src='${fallbackImg}'">
                        <div class="product-badge-float">
                            <span class="badge ${p.is_low_stock ? 'badge-low-stock' : 'badge-stock'}">
                                ${inStockProd ? (p.is_low_stock ? `⚡ Only ${p.stock} left` : '✔ In Stock') : '✖ Out of Stock'}
                            </span>
                        </div>
                        <button class="product-wishlist-float" title="Add to Wishlist" onclick="event.stopPropagation(); toggleWishlistGlobal(${p.id}, this)">
                            🤍
                        </button>
                    </div>

                    <div class="product-info">
                        <div class="product-category">${p.category || 'General'}</div>
                        <h4 class="product-title" title="${p.description}" onclick="openQuickView(${p.id})" style="cursor: pointer;">
                            ${p.description}
                        </h4>

                        <div class="product-meta">
                            <div class="product-price">${formatPrice(p.price)}</div>
                            <div class="product-rating">⭐ ${p.rating || 4.5}</div>
                        </div>

                        <div class="product-actions">
                            <button class="btn btn-primary btn-sm" ${!inStockProd ? 'disabled' : ''} onclick="addToCartGlobal(${p.id}, 1, this)">
                                <span>🛒</span> Add to Cart
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="openQuickView(${p.id})" title="Quick View & AI Match">
                                👁️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        renderPagination(total);
    } catch (e) {
        console.error("Products fetch failed:", e);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Error loading products: ${e.message}</div>`;
    }
}

function renderPagination(total) {
    const container = document.getElementById("paginationControls");
    if (!container) return;

    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let buttonsHTML = `
        <button class="btn btn-secondary btn-sm" ${currentPage === 1 ? 'disabled style="opacity:0.4;"' : ''} onclick="changePage(${currentPage - 1})">
            ← Prev
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            buttonsHTML += `
                <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            buttonsHTML += `<span style="color: var(--text-muted); padding: 0 4px;">...</span>`;
        }
    }

    buttonsHTML += `
        <button class="btn btn-secondary btn-sm" ${currentPage === totalPages ? 'disabled style="opacity:0.4;"' : ''} onclick="changePage(${currentPage + 1})">
            Next →
        </button>
    `;

    container.innerHTML = buttonsHTML;
}

function changePage(page) {
    currentPage = page;
    window.scrollTo({ top: 120, behavior: 'smooth' });
    fetchAndRenderProducts();
}