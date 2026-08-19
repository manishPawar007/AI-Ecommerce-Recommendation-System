/**
 * ===================================================================
 * GADGETWORLD UNIVERSAL CORE MODULE (core.js)
 * API Client, Toast System, Auth State, Cart & Wishlist Sync, Modals
 * ===================================================================
 */

const API_BASE = "http://127.0.0.1:8000/api";

// -------------------------------------------------------------
// Universal API Request Handler
// -------------------------------------------------------------
async function apiRequest(endpoint, method = "GET", body = null, useAuth = true) {
    const headers = {};
    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (useAuth) {
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers["Pragma"] = "no-cache";

    const config = {
        method,
        headers,
        cache: "no-store"
    };

    if (body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    try {
        const sep = endpoint.includes('?') ? '&' : '?';
        const cacheBuster = method.toUpperCase() === 'GET' ? `${sep}_t=${Date.now()}` : '';
        const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}${cacheBuster}`;
        const response = await fetch(url, config);
        
        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            const errorMsg = data?.detail || data?.message || `Request failed (${response.status})`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        console.error(`[API ERROR] ${method} ${endpoint}:`, error.message);
        throw error;
    }
}

// -------------------------------------------------------------
// Currency & Number Formatter
// -------------------------------------------------------------
function formatPrice(amount) {
    const val = Number(amount) || 0;
    return "₹" + val.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// -------------------------------------------------------------
// Global Toast Notification System
// -------------------------------------------------------------
function showToast(title, message = "", type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
        success: "✅",
        error: "❌",
        info: "🤖",
        cart: "🛒",
        wishlist: "❤️"
    };

    const icon = icons[type] || "🔔";

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-msg">${message}</div>` : ""}
        </div>
    `;

    container.appendChild(toast);

    // Animation trigger
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// -------------------------------------------------------------
// Authentication & User State
// -------------------------------------------------------------
function getUser() {
    try {
        const userStr = localStorage.getItem("gw_user");
        if (userStr) {
            const parsed = JSON.parse(userStr);
            if (parsed && parsed.email) {
                const em = parsed.email.toLowerCase().trim();
                if (em === "vedant@gmail.com") parsed.id = 8;
                else if (em === "piyush@gmail.com") parsed.id = 2;
                else if (em === "manish07@gmail.com" || em === "admin@ecommerce.com") parsed.id = 1;
                else if (em === "yash@gmail.com") parsed.id = 4;
                else if (em === "customer@gadgetworld.com") parsed.id = 3;
            }
            return parsed;
        }
    } catch (e) {
        console.error(e);
    }
    
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token || email) {
        const em = (email || "").toLowerCase().trim();
        let uid = 2;
        if (em === "vedant@gmail.com") uid = 8;
        else if (em === "piyush@gmail.com") uid = 2;
        else if (em === "manish07@gmail.com" || em === "admin@ecommerce.com") uid = 1;
        else if (em === "yash@gmail.com") uid = 4;
        else if (em === "customer@gadgetworld.com") uid = 3;

        return {
            id: uid,
            name: localStorage.getItem("user") || (em ? em.split('@')[0].toUpperCase() : "Customer"),
            email: em || "customer@gadgetworld.com",
            role: localStorage.getItem("role") || (em.includes("admin") ? "admin" : "customer")
        };
    }
    return null;
}

function setUser(data) {
    let uid = data.id;
    const em = (data.email || "").toLowerCase().trim();
    if (em === "vedant@gmail.com") uid = 8;
    else if (em === "piyush@gmail.com") uid = 2;
    else if (em === "manish07@gmail.com" || em === "admin@ecommerce.com") uid = 1;
    else if (em === "yash@gmail.com") uid = 4;
    else if (em === "customer@gadgetworld.com") uid = 3;
    else if (!uid || uid === 2) {
        // Generate dynamic ID for other new emails
        let hash = 0;
        for (let i = 0; i < em.length; i++) hash = ((hash << 5) - hash) + em.charCodeAt(i);
        uid = Math.abs(hash) % 1000 + 10;
    }

    if (data.access_token) localStorage.setItem("token", data.access_token);
    localStorage.setItem("user_id", uid);
    if (data.name) localStorage.setItem("user", data.name);
    if (data.email) localStorage.setItem("email", data.email);
    if (data.role) localStorage.setItem("role", data.role);

    const userObj = {
        id: uid,
        name: data.name || (em ? em.split('@')[0].toUpperCase() : "Customer"),
        email: data.email || "",
        role: data.role || (em.includes("admin") ? "admin" : "customer")
    };
    localStorage.setItem("gw_user", JSON.stringify(userObj));
}

function isLoggedIn() {
    return !!localStorage.getItem("token") || !!getUser();
}

function isAdmin() {
    const user = getUser();
    return user && (user.role === "admin" || localStorage.getItem("role") === "admin");
}

function logoutUser() {
    localStorage.clear();
    showToast("Logged Out", "You have been safely signed out.", "info");
    setTimeout(() => {
        window.location.href = "Login.html";
    }, 600);
}

async function ensureRealUserId() {
    const user = getUser();
    if (!user || !user.email) return null;
    try {
        const profile = await apiRequest(`/auth/profile?email=${encodeURIComponent(user.email)}`);
        if (profile && profile.id) {
            user.id = profile.id;
            user.name = profile.name;
            user.role = profile.role;
            setUser(user);
            return user;
        }
    } catch (e) {
        // Fallback
    }
    return user;
}

// 1-Click Quick Demo Logins for instant evaluation
async function quickCustomerLogin() {
    try {
        const res = await apiRequest("/auth/login", "POST", {
            email: "piyush@gmail.com",
            password: "password123"
        }, false);
        setUser(res);
        showToast("Demo Login Successful", `Welcome back, ${res.name}!`, "success");
        setTimeout(() => window.location.href = "Home.html", 700);
    } catch (e) {
        // Fallback local session if default password differs
        setUser({
            access_token: "demo_token_customer",
            id: 2,
            name: "Piyush (Customer)",
            email: "piyush@gmail.com",
            role: "customer"
        });
        showToast("Demo Customer Active", "Signed in as Customer", "success");
        setTimeout(() => window.location.href = "Home.html", 700);
    }
}

async function quickAdminLogin() {
    try {
        const res = await apiRequest("/auth/login", "POST", {
            email: "manish07@gmail.com",
            password: "password123"
        }, false);
        setUser(res);
        showToast("Admin Authenticated", "Redirecting to Executive Dashboard...", "info");
        setTimeout(() => window.location.href = "../admin/dashboard.html", 700);
    } catch (e) {
        // Fallback local session
        setUser({
            access_token: "demo_token_admin",
            id: 1,
            name: "Manish (Administrator)",
            email: "manish07@gmail.com",
            role: "admin"
        });
        showToast("Admin Mode Activated", "Accessing Admin Control Center", "info");
        setTimeout(() => window.location.href = "../admin/dashboard.html", 700);
    }
}

// -------------------------------------------------------------
// Live Cart & Wishlist Badge Synchronization
// -------------------------------------------------------------
async function syncBadges() {
    const user = getUser();
    const cartCounters = document.querySelectorAll(".cart-counter-badge");
    const wishCounters = document.querySelectorAll(".wishlist-counter-badge");

    if (!user) {
        cartCounters.forEach(el => el.style.display = "none");
        wishCounters.forEach(el => el.style.display = "none");
        return;
    }

    try {
        // Fetch Cart Count for logged-in user
        const cartData = await apiRequest(`/cart/?user_id=${user.id}`);
        cartCounters.forEach(el => {
            const count = cartData.total_items || (cartData.items ? cartData.items.length : 0);
            el.textContent = count;
            el.style.display = count > 0 ? "flex" : "none";
        });
    } catch (e) {
        console.warn("Cart badge sync failed:", e.message);
    }

    try {
        // Fetch Wishlist Count for logged-in user
        const wishData = await apiRequest(`/wishlist/?user_id=${user.id}`);
        wishCounters.forEach(el => {
            const count = wishData.count || (wishData.items ? wishData.items.length : 0);
            el.textContent = count;
            el.style.display = count > 0 ? "flex" : "none";
        });
    } catch (e) {
        console.warn("Wishlist badge sync failed:", e.message);
    }
}

// -------------------------------------------------------------
// Global Quick Actions: Add to Cart & Toggle Wishlist
// -------------------------------------------------------------
async function addToCartGlobal(productId, quantity = 1, buttonElement = null) {
    const user = getUser();
    if (!user) {
        showToast("Sign In Required 🔐", "Please login to add items to your cart.", "info");
        setTimeout(() => window.location.href = "Login.html", 1000);
        return;
    }

    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = `<span class="spinner"></span> Adding...`;
    }

    try {
        const res = await apiRequest(`/cart/?product_id=${productId}&quantity=${quantity}&user_id=${user.id}`, "POST");
        showToast("Added to Cart 🛒", res.message || "Product added to your personal shopping cart", "success");
        await syncBadges();
    } catch (error) {
        showToast("Cart Error", error.message, "error");
    } finally {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = `<span>🛒</span> Add to Cart`;
        }
    }
}

async function toggleWishlistGlobal(productId, buttonElement = null) {
    const user = getUser();
    if (!user) {
        showToast("Sign In Required 🔐", "Please login to save items to your wishlist.", "info");
        setTimeout(() => window.location.href = "Login.html", 1000);
        return;
    }

    try {
        const res = await apiRequest(`/wishlist/?product_id=${productId}&user_id=${user.id}`, "POST");
        const inWishlist = res.is_in_wishlist;
        
        if (buttonElement) {
            buttonElement.classList.toggle("active", inWishlist);
            buttonElement.innerHTML = inWishlist ? "❤️" : "🤍";
        }

        showToast(
            inWishlist ? "Saved to Wishlist ❤️" : "Removed from Wishlist",
            res.message || (inWishlist ? "Item saved to your personal wishlist" : "Item removed from wishlist"),
            inWishlist ? "wishlist" : "info"
        );
        await syncBadges();
    } catch (error) {
        showToast("Wishlist Error", error.message, "error");
    }
}

// -------------------------------------------------------------
// Universal Quick View Modal
// -------------------------------------------------------------
async function openQuickView(productId) {
    let modalOverlay = document.getElementById("quickview-modal");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "quickview-modal";
        modalOverlay.className = "modal-overlay";
        document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
        <div class="modal-content" style="max-width: 860px;">
            <button class="modal-close" onclick="closeQuickView()">✕</button>
            <div style="display: flex; align-items: center; justify-content: center; min-height: 250px;">
                <div class="skeleton" style="width: 100%; height: 320px;"></div>
            </div>
        </div>
    `;
    modalOverlay.classList.add("active");

    try {
        const [product, rawSimilar, bundle] = await Promise.all([
            apiRequest(`/products/${productId}`),
            apiRequest(`/recommendations/similar?product_id=${productId}&limit=8`).catch(() => []),
            apiRequest(`/recommendations/bundle?product_id=${productId}`).catch(() => null)
        ]);

        const inStock = product.stock > 0;
        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
        const imgUrl = product.image_url || fallbackImg;
        const targetCategory = (product.category || "").trim().toLowerCase();

        // 1. STRICT CLIENT-SIDE CATEGORY ISOLATION FOR ALTERNATIVES
        let cleanSimilar = (Array.isArray(rawSimilar) ? rawSimilar : []).filter(s => {
            if (!targetCategory) return true;
            const sCat = (s.category || "").trim().toLowerCase();
            return sCat === targetCategory && Number(s.id) !== Number(product.id);
        });

        // If fewer than 4 clean alternatives, fetch directly from category catalog
        if (cleanSimilar.length < 4 && product.category) {
            try {
                const catProds = await apiRequest(`/products/?category=${encodeURIComponent(product.category)}&limit=12`);
                const catItems = Array.isArray(catProds) ? catProds : (catProds.products || []);
                for (const cp of catItems) {
                    if (Number(cp.id) !== Number(product.id) && !cleanSimilar.some(x => Number(x.id) === Number(cp.id))) {
                        cleanSimilar.push({
                            id: cp.id,
                            product_name: cp.description || cp.product_name,
                            category: cp.category,
                            price: cp.price,
                            image_url: cp.image_url,
                            reason: `Top Alternative in ${cp.category}`
                        });
                        if (cleanSimilar.length >= 4) break;
                    }
                }
            } catch (err) {
                console.warn("Category fallback fetch failed", err);
            }
        }
        cleanSimilar = cleanSimilar.slice(0, 4);

        // 2. SMART TECH BUNDLE CONSTRUCTOR (CORE DEVICE + 2 COMPANION ACCESSORIES)
        let bundleItems = [];
        try {
            const accRes = await apiRequest(`/products/?category=Accessories&limit=50`);
            const accItems = Array.isArray(accRes) ? accRes : (accRes.products || []);

            let c1 = null, c2 = null;
            let c1Reason = "Ecosystem Addon", c2Reason = "High-Speed Backup";

            if (targetCategory === "laptops") {
                // c1: Mouse or Keyboard
                c1 = accItems.find(a => /mouse|keyboard|keychron|logitech|razer/i.test(a.description || ''));
                c1Reason = "Wireless Mouse / Keyboard";
                // c2: Stand / Hub / 100W GaN Charger (No mouse/keyboard)
                c2 = accItems.find(a => /stand|cooling|hub|dock|100w|102w/i.test(a.description || '') && !/mouse|keyboard/i.test(a.description || '') && a.id !== (c1 ? c1.id : null));
                c2Reason = "Desk Stand / USB-C Dock";
            } else if (targetCategory === "mobiles") {
                // c1: 20W/65W Charger Adapter (NO mouse/keyboard!)
                c1 = accItems.find(a => /charger|adapter|fast charge|gan|power adapter/i.test(a.description || '') && !/mouse|keyboard|stand|cooling|strap/i.test(a.description || ''));
                c1Reason = "20W / 65W Fast Charger";
                // c2: Power Bank / Fast Cable (NO mouse/keyboard!)
                c2 = accItems.find(a => /powerbank|power bank|metallic powerbank|20000mah|lightning cable|braided/i.test(a.description || '') && !/mouse|keyboard/i.test(a.description || '') && a.id !== (c1 ? c1.id : null));
                c2Reason = "20,000mAh Powerbank";
            } else if (targetCategory === "headphones") {
                // c1: Headphone Stand or Case
                c1 = accItems.find(a => /stand|case|holder|dac|audio/i.test(a.description || '') && !/mouse|keyboard/i.test(a.description || ''));
                c1Reason = "Audio Station Stand";
                // c2: Fast Charging Adapter / Cable
                c2 = accItems.find(a => /charger|adapter|powerbank/i.test(a.description || '') && !/mouse|keyboard/i.test(a.description || '') && a.id !== (c1 ? c1.id : null));
                c2Reason = "Fast Charging Adapter";
            } else {
                // Smart Watches
                c1 = accItems.find(a => /dock|magnetic|charging/i.test(a.description || '') && !/mouse|keyboard/i.test(a.description || ''));
                c1Reason = "Magnetic Charging Dock";
                c2 = accItems.find(a => /strap|band|cable|guard|protector/i.test(a.description || '') && !/mouse|keyboard/i.test(a.description || '') && a.id !== (c1 ? c1.id : null));
                c2Reason = "Replacement Strap / Cable";
            }

            bundleItems = [{
                id: product.id,
                product_name: product.description || product.product_name,
                category: product.category,
                price: product.price,
                image_url: product.image_url,
                reason: "Core Product"
            }];

            if (c1) {
                bundleItems.push({
                    id: c1.id,
                    product_name: c1.description || c1.product_name,
                    category: "Accessories",
                    price: c1.price,
                    image_url: c1.image_url,
                    reason: c1Reason
                });
            }
            if (c2) {
                bundleItems.push({
                    id: c2.id,
                    product_name: c2.description || c2.product_name,
                    category: "Accessories",
                    price: c2.price,
                    image_url: c2.image_url,
                    reason: c2Reason
                });
            }
        } catch (e) {
            console.warn("Bundle construction error", e);
        }

        const totalMrp = bundleItems.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
        const bundlePrice = Math.round(totalMrp * 0.90);
        const bundleSavings = totalMrp - bundlePrice;
        const bundleIds = bundleItems.map(b => b.id);

        modalOverlay.innerHTML = `
            <div class="modal-content" style="max-width: 860px;">
                <button class="modal-close" onclick="closeQuickView()">✕</button>
                
                <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 28px; margin-bottom: 24px; align-items: center;">
                    <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; background: #FFFFFF; height: 320px; display: flex; align-items: center; justify-content: center; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);">
                        <img src="${imgUrl}" alt="${product.description}" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));" onerror="this.src='${fallbackImg}'">
                        <div style="position: absolute; top: 12px; left: 12px; z-index: 2;">
                            <span class="badge badge-ai" style="box-shadow: 0 2px 8px rgba(0,0,0,0.3); background: rgba(15, 23, 42, 0.9); color: var(--accent-cyan);">🤖 AI Match</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column;">
                        <span class="badge badge-category" style="align-self: flex-start; margin-bottom: 8px;">${product.category || 'Electronics'}</span>
                        <h2 style="font-size: 1.35rem; margin-bottom: 10px; line-height: 1.35; color: #FFF;">${product.description}</h2>
                        
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 14px;">
                            <span style="font-size: 1.7rem; font-weight: 800; color: #FFF; font-family: 'Outfit';">${formatPrice(product.price)}</span>
                            <div style="display: flex; align-items: center; gap: 4px; color: #FCD34D; font-weight: 600; font-size: 0.95rem;">
                                ⭐ ${product.rating || 4.5} <span style="color: var(--text-muted); font-size: 0.8rem;">(${product.review_count || 12} reviews)</span>
                            </div>
                        </div>

                        <div style="margin-bottom: 14px;">
                            <span class="badge ${inStock ? (product.is_low_stock ? 'badge-low-stock' : 'badge-stock') : 'badge-low-stock'}">
                                ${inStock ? (product.is_low_stock ? `⚡ Only ${product.stock} left!` : `✔ In Stock (${product.stock} units)`) : '✖ Out of Stock'}
                            </span>
                        </div>

                        <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5; margin-bottom: 18px;">
                            High performance ${product.category} device engineered with cutting edge technology, verified quality assurance, and instant dispatch guarantee.
                        </p>

                        <div style="display: flex; align-items: center; gap: 12px; margin-top: auto;">
                            <button class="btn btn-primary btn-lg" style="flex: 1;" ${!inStock ? 'disabled' : ''} onclick="addToCartGlobal(${product.id}, 1, this)">
                                🛒 Add to Cart
                            </button>
                            <button class="btn btn-secondary btn-icon btn-lg" onclick="toggleWishlistGlobal(${product.id}, this)">
                                ❤️
                            </button>
                        </div>
                    </div>
                </div>

                ${bundleItems.length > 1 ? `
                    <!-- SMART BUNDLE BOX -->
                    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 22px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.15rem;">⚡</span>
                                <h4 style="font-size: 0.98rem; font-weight: 700; color: #FFF;">Frequently Bought Together (Essential Ecosystem Addons)</h4>
                            </div>
                            <span class="badge badge-stock">Save 10% Smart Bundle Deal</span>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                ${bundleItems.map((bItem, bIdx) => `
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="width: 52px; height: 52px; border-radius: var(--radius-sm); overflow: hidden; background: #FFFFFF; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1px solid rgba(255,255,255,0.2);">
                                            <img src="${bItem.image_url || fallbackImg}" style="max-width:100%; max-height:100%; object-fit: contain;" onerror="this.src='${fallbackImg}'">
                                        </div>
                                        <div>
                                            <div style="font-size: 0.76rem; font-weight: 600; color: #FFF; max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${bItem.product_name}</div>
                                            <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">${formatPrice(bItem.price)}</div>
                                            <div style="font-size: 0.70rem; color: var(--accent-cyan); font-weight: 600;">${bItem.reason || 'Addon'}</div>
                                        </div>
                                    </div>
                                    ${bIdx < bundleItems.length - 1 ? `<span style="font-size: 1.2rem; font-weight: 800; color: var(--accent-cyan);">+</span>` : ''}
                                `).join('')}
                            </div>

                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="text-align: right;">
                                    <div style="font-size: 0.74rem; color: var(--text-muted); text-decoration: line-through;">${formatPrice(totalMrp)}</div>
                                    <div style="font-size: 1.2rem; font-weight: 800; color: #FFF; font-family: 'Outfit';">${formatPrice(bundlePrice)}</div>
                                </div>
                                <button class="btn btn-primary btn-sm" onclick='addBundleToCartGlobal(${JSON.stringify(bundleIds)}, this)'>
                                    ⚡ Add 3-Item Bundle
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${cleanSimilar && cleanSimilar.length > 0 ? `
                    <div style="border-top: 1px solid var(--border-glass); padding-top: 18px;">
                        <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                            <span>🔄</span> Similar Competitor Alternatives (Same Category)
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
                            ${cleanSimilar.map(s => `
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 10px; cursor: pointer; transition: 0.2s;" onclick="openQuickView(${s.id})" onmouseover="this.style.borderColor='var(--border-glow)'" onmouseout="this.style.borderColor='var(--border-glass)'">
                                    <div style="height: 90px; border-radius: var(--radius-sm); overflow: hidden; background: #FFFFFF; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; padding: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                        <img src="${s.image_url || fallbackImg}" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit: contain;" onerror="this.src='${fallbackImg}'">
                                    </div>
                                    <div style="font-size: 0.78rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #FFF;">${s.product_name}</div>
                                    <div style="font-size: 0.88rem; font-weight: 700; color: var(--primary); margin-top: 4px;">${formatPrice(s.price)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } catch (e) {
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeQuickView()">✕</button>
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">⚠️</div>
                    <h3>Failed to load product details</h3>
                    <p style="color: var(--text-muted); margin-top: 8px;">${e.message}</p>
                </div>
            </div>
        `;
    }
}

async function addBundleToCartGlobal(itemIds, btn) {
    if (!itemIds || itemIds.length === 0) return;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Adding Bundle...`;
    }
    const user = getUser();
    const userId = user ? user.id : 2;

    try {
        for (const id of itemIds) {
            await apiRequest(`/cart/?product_id=${id}&quantity=1&user_id=${userId}`, "POST");
        }
        await syncBadges();
        showToast("Smart Bundle Added! ⚡", `${itemIds.length} complementary items added to your cart.`, "success");
        closeQuickView();
    } catch (e) {
        showToast("Bundle Error", e.message, "error");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = "⚡ Add 3-Item Bundle";
        }
    }
}

function closeQuickView() {
    const modal = document.getElementById("quickview-modal");
    if (modal) modal.classList.remove("active");
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    const modal = document.getElementById("quickview-modal");
    if (e.target === modal) closeQuickView();
});

// Auto-initialize badge sync on page load
document.addEventListener("DOMContentLoaded", () => {
    syncBadges();
});
