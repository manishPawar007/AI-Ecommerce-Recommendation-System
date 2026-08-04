// =========================================================
// CUSTOMER AUTH & PER-USER STORAGE HELPER - GADGETWORLD STOREFRONT
// =========================================================

function getUserEmail() {
    return (localStorage.getItem("userEmail") || localStorage.getItem("adminEmail") || "guest@gadgetworld.com").toLowerCase().trim();
}

function getCartKey() {
    return `cart_${getUserEmail()}`;
}

function getWishlistKey() {
    return `wishlist_${getUserEmail()}`;
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(getCartKey()) || "[]");
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const badgeEl = document.getElementById("cart-badge");
    if (badgeEl) {
        badgeEl.textContent = totalCount;
    }
}

function updateWishlistBadge() {
    const wishlist = JSON.parse(localStorage.getItem(getWishlistKey()) || "[]");
    const badgeEl = document.getElementById("wishlist-badge");
    if (badgeEl) {
        badgeEl.textContent = wishlist.length;
    }
}

function renderStoreNavbar() {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) return;

    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    const userEmail = getUserEmail();
    
    let userName = localStorage.getItem("userName") || localStorage.getItem("adminName") || "";
    if (!userName || userName === "Demo Customer" || userName === "Account") {
        if (userEmail && userEmail !== "guest@gadgetworld.com") {
            const handle = userEmail.split('@')[0];
            userName = handle.charAt(0).toUpperCase() + handle.slice(1);
        } else {
            userName = "Customer";
        }
    }

    navbarContainer.innerHTML = `
        <!-- Top Announcement Delivery Bar -->
        <div class="announcement-bar">
            <div class="container d-flex align-items-center justify-content-between">
                <div>
                    <i class="bi bi-truck text-warning me-1"></i>
                    <span>Free Express Delivery on orders over ₹999 | 100% Original Brands Guaranteed</span>
                </div>
                <div class="d-none d-md-block">
                    <i class="bi bi-geo-alt-fill text-primary me-1"></i> Deliver to: <strong class="text-white">Mumbai 400001</strong>
                </div>
            </div>
        </div>

        <!-- Main Header Navbar -->
        <header class="store-navbar">
            <div class="container d-flex align-items-center justify-content-between gap-3">
                <!-- Brand Logo -->
                <a href="Home.html" class="brand-logo">
                    <i class="bi bi-cpu-fill"></i>
                    <span>GadgetWorld <small class="text-primary fs-6">AI</small></span>
                </a>

                <!-- Search Bar with Live Autocomplete -->
                <div class="nav-search-bar d-none d-md-block">
                    <i class="bi bi-search"></i>
                    <input type="text" id="global-store-search" placeholder="Search gadgets, smartphones, laptops..." oninput="handleSearchAutocomplete(event)" onkeypress="handleGlobalSearch(event)">
                    <div id="autocomplete-menu" class="search-autocomplete-dropdown"></div>
                </div>

                <!-- Action Icons -->
                <div class="d-flex align-items-center gap-3">
                    <a href="Products.html" class="btn btn-sm btn-secondary-glass d-none d-lg-inline-flex">
                        <i class="bi bi-grid-fill me-1"></i> All Products
                    </a>

                    <a href="Wishlist.html" class="nav-icon-btn" title="Wishlist">
                        <i class="bi bi-heart"></i>
                        <span id="wishlist-badge" class="badge-count">0</span>
                    </a>

                    <a href="Cart.html" class="nav-icon-btn" title="Shopping Cart">
                        <i class="bi bi-cart3"></i>
                        <span id="cart-badge" class="badge-count">0</span>
                    </a>

                    ${token ? `
                        <div class="dropdown">
                            <button class="btn btn-sm btn-secondary-glass dropdown-toggle text-white d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                <i class="bi bi-person-circle fs-5 text-primary"></i> <span class="fw-bold text-white">${userName}</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow p-2" style="min-width: 220px; background: #0f172a; border: 1px solid rgba(99, 102, 241, 0.3);">
                                <li class="px-2 py-1 mb-1 border-bottom border-secondary border-opacity-25">
                                    <div class="fw-bold text-white small">${userName}</div>
                                    <div class="text-muted extra-small" style="font-size: 0.75rem;">${userEmail}</div>
                                </li>
                                <li><a class="dropdown-item py-2 rounded" href="Profile.html"><i class="bi bi-person-badge text-primary me-2"></i> My Profile Info</a></li>
                                <li><a class="dropdown-item py-2 rounded" href="Orders.html"><i class="bi bi-box-seam text-success me-2"></i> My Orders History</a></li>
                                <li><a class="dropdown-item py-2 rounded" href="Wishlist.html"><i class="bi bi-heart text-danger me-2"></i> Saved Wishlist</a></li>
                                ${userEmail.includes('admin') || localStorage.getItem('userRole') === 'admin' ? `
                                    <li><a class="dropdown-item py-2 rounded text-warning" href="../admin/dashboard.html"><i class="bi bi-shield-lock me-2"></i> Admin Panel</a></li>
                                ` : ''}
                                <li><hr class="dropdown-divider border-secondary border-opacity-25"></li>
                                <li><a class="dropdown-item py-2 rounded text-danger" href="#" onclick="handleCustomerLogout()"><i class="bi bi-box-arrow-right me-2"></i> Sign Out</a></li>
                            </ul>
                        </div>
                    ` : `
                        <a href="Login.html" class="btn btn-sm btn-primary-gradient">
                            <i class="bi bi-box-arrow-in-right"></i> Sign In
                        </a>
                    `}
                </div>
            </div>
        </header>
    `;

    updateCartBadge();
    updateWishlistBadge();
}

let autocompleteTimeout = null;

async function handleSearchAutocomplete(e) {
    const q = e.target.value.trim().toLowerCase();
    const menu = document.getElementById("autocomplete-menu");
    if (!menu) return;

    if (!q || q.length < 2) {
        menu.style.display = "none";
        return;
    }

    clearTimeout(autocompleteTimeout);
    autocompleteTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/api/products/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const products = await res.json();
                if (products && products.length > 0) {
                    menu.innerHTML = products.slice(0, 5).map(p => `
                        <div class="autocomplete-item" onclick="selectAutocompleteItem('${p.product_name || p.title || p.description}')">
                            <img src="${p.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80'}" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80';">
                            <div>
                                <div class="text-white fw-semibold small">${p.product_name || p.title || 'Product'}</div>
                                <div class="text-success small fw-bold">₹${(p.price || 999).toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    `).join("");
                    menu.style.display = "block";
                    return;
                }
            }
        } catch (err) {
            console.warn("Autocomplete error");
        }
        menu.style.display = "none";
    }, 200);
}

function selectAutocompleteItem(query) {
    window.location.href = `Products.html?search=${encodeURIComponent(query)}`;
}

function handleGlobalSearch(e) {
    if (e.key === "Enter") {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `Products.html?search=${encodeURIComponent(query)}`;
        }
    }
}

function handleCustomerLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    showToast("Signed out successfully", "success");
    setTimeout(() => {
        window.location.href = "Login.html";
    }, 400);
}

function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast-custom border-${type}`;
    const icon = type === "success" ? "bi-check-circle-fill text-success" : "bi-exclamation-triangle-fill text-danger";
    toast.innerHTML = `<i class="bi ${icon} fs-5"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function mergeGuestStorageToUser(userEmail) {
    if (!userEmail || userEmail === "guest@gadgetworld.com") return;
    const cleanEmail = userEmail.toLowerCase().trim();

    // 1. Merge Cart
    const guestCartKey = "cart_guest@gadgetworld.com";
    const userCartKey = `cart_${cleanEmail}`;
    let guestCart = JSON.parse(localStorage.getItem(guestCartKey) || "[]");
    let legacyCart = JSON.parse(localStorage.getItem("cart") || "[]");
    let userCart = JSON.parse(localStorage.getItem(userCartKey) || "[]");

    let cartModified = false;
    [...guestCart, ...legacyCart].forEach(gItem => {
        if (!gItem || (!gItem.id && !gItem.title)) return;
        const existing = userCart.find(u => (u.id && gItem.id && u.id === gItem.id) || (u.title && gItem.title && u.title === gItem.title));
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (gItem.quantity || 1);
        } else {
            userCart.push(gItem);
        }
        cartModified = true;
    });

    if (cartModified || userCart.length > 0) {
        localStorage.setItem(userCartKey, JSON.stringify(userCart));
    }
    localStorage.removeItem(guestCartKey);
    localStorage.removeItem("cart");

    // 2. Merge Wishlist
    const guestWishlistKey = "wishlist_guest@gadgetworld.com";
    const userWishlistKey = `wishlist_${cleanEmail}`;
    let guestWishlist = JSON.parse(localStorage.getItem(guestWishlistKey) || "[]");
    let legacyWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let userWishlist = JSON.parse(localStorage.getItem(userWishlistKey) || "[]");

    let wishlistModified = false;
    [...guestWishlist, ...legacyWishlist].forEach(gItem => {
        if (!gItem || (!gItem.id && !gItem.title)) return;
        if (!userWishlist.some(u => (u.id && gItem.id && u.id === gItem.id) || (u.title && gItem.title && u.title === gItem.title))) {
            userWishlist.push(gItem);
            wishlistModified = true;
        }
    });

    if (wishlistModified || userWishlist.length > 0) {
        localStorage.setItem(userWishlistKey, JSON.stringify(userWishlist));
    }
    localStorage.removeItem(guestWishlistKey);
    localStorage.removeItem("wishlist");

    // 3. Merge Orders
    const guestOrderKey = "userOrders_guest@gadgetworld.com";
    const userOrderKey = `userOrders_${cleanEmail}`;
    let guestOrders = JSON.parse(localStorage.getItem(guestOrderKey) || "[]");
    let userOrders = JSON.parse(localStorage.getItem(userOrderKey) || "[]");

    let ordersModified = false;
    guestOrders.forEach(gOrder => {
        if (!userOrders.some(u => u.id === gOrder.id || u.order_number === gOrder.order_number)) {
            gOrder.user_email = cleanEmail;
            userOrders.push(gOrder);
            ordersModified = true;
        }
    });

    if (ordersModified || userOrders.length > 0) {
        localStorage.setItem(userOrderKey, JSON.stringify(userOrders));
    }
    localStorage.removeItem(guestOrderKey);
}

document.addEventListener("DOMContentLoaded", () => {
    const currentEmail = getUserEmail();
    if (currentEmail && currentEmail !== "guest@gadgetworld.com") {
        mergeGuestStorageToUser(currentEmail);
    }
    renderStoreNavbar();
});