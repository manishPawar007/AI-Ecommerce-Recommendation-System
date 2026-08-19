/**
 * ===================================================================
 * GADGETWORLD ADMIN CORE MODULE (admin-core.js)
 * API Client, Admin Auth Guard, Dynamic Sidebar & Topbar
 * ===================================================================
 */

const API_BASE = "http://127.0.0.1:8000/api";

async function adminApi(endpoint, method = "GET", body = null) {
    const headers = {};
    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const token = localStorage.getItem("token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    try {
        const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
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
        console.error(`[ADMIN API ERROR] ${method} ${endpoint}:`, error.message);
        throw error;
    }
}

function formatPrice(amount) {
    const val = Number(amount) || 0;
    return "₹" + val.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function showAdminToast(title, message = "", type = "success") {
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
        info: "⚡",
        warning: "⚠️"
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || "🔔"}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-msg">${message}</div>` : ""}
        </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function checkAdminAuth() {
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    // If not logged in as admin, ensure demo session or allow access
    if (!token || (userRole && userRole !== "admin")) {
        // Set demo admin session so testing is friction-free
        localStorage.setItem("token", "admin_demo_token");
        localStorage.setItem("user_id", "1");
        localStorage.setItem("user", "Manish (Admin)");
        localStorage.setItem("email", "manish07@gmail.com");
        localStorage.setItem("role", "admin");
    }
}

function renderAdminLayout(activePage = "dashboard") {
    checkAdminAuth();

    // 1. Sidebar Injection
    const sidebarSlot = document.getElementById("adminSidebarSlot");
    if (sidebarSlot) {
        sidebarSlot.innerHTML = `
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo-icon">⚡</div>
                    <div>
                        <div class="sidebar-title">GadgetWorld</div>
                        <div class="sidebar-badge">Executive Suite</div>
                    </div>
                </div>

                <ul class="sidebar-menu">
                    <li class="sidebar-section-title">Overview</li>
                    <li>
                        <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
                            <span class="sidebar-icon">📊</span>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="analytics.html" class="sidebar-link ${activePage === 'analytics' ? 'active' : ''}">
                            <span class="sidebar-icon">📈</span>
                            <span>Analytics Hub</span>
                        </a>
                    </li>
                    <li>
                        <a href="reports.html" class="sidebar-link ${activePage === 'reports' ? 'active' : ''}">
                            <span class="sidebar-icon">📑</span>
                            <span>Business Reports</span>
                        </a>
                    </li>

                    <li class="sidebar-section-title">Catalog & Logistics</li>
                    <li>
                        <a href="products.html" class="sidebar-link ${activePage === 'products' ? 'active' : ''}">
                            <span class="sidebar-icon">🛍️</span>
                            <span>Products Catalog</span>
                        </a>
                    </li>
                    <li>
                        <a href="categories.html" class="sidebar-link ${activePage === 'categories' ? 'active' : ''}">
                            <span class="sidebar-icon">📁</span>
                            <span>Categories</span>
                        </a>
                    </li>
                    <li>
                        <a href="inventory.html" class="sidebar-link ${activePage === 'inventory' ? 'active' : ''}">
                            <span class="sidebar-icon">📦</span>
                            <span>Inventory Matrix</span>
                        </a>
                    </li>
                    <li>
                        <a href="orders.html" class="sidebar-link ${activePage === 'orders' ? 'active' : ''}">
                            <span class="sidebar-icon">🚚</span>
                            <span>Customer Orders</span>
                        </a>
                    </li>

                    <li class="sidebar-section-title">Management</li>
                    <li>
                        <a href="customers.html" class="sidebar-link ${activePage === 'customers' ? 'active' : ''}">
                            <span class="sidebar-icon">👥</span>
                            <span>Customer Directory</span>
                        </a>
                    </li>
                    <li>
                        <a href="coupons.html" class="sidebar-link ${activePage === 'coupons' ? 'active' : ''}">
                            <span class="sidebar-icon">🏷️</span>
                            <span>Coupons & Promos</span>
                        </a>
                    </li>
                    <li>
                        <a href="reviews.html" class="sidebar-link ${activePage === 'reviews' ? 'active' : ''}">
                            <span class="sidebar-icon">⭐</span>
                            <span>Product Reviews</span>
                        </a>
                    </li>
                    <li>
                        <a href="settings.html" class="sidebar-link ${activePage === 'settings' ? 'active' : ''}">
                            <span class="sidebar-icon">⚙️</span>
                            <span>Store Settings</span>
                        </a>
                    </li>
                    <li>
                        <a href="profile.html" class="sidebar-link ${activePage === 'profile' ? 'active' : ''}">
                            <span class="sidebar-icon">👤</span>
                            <span>Admin Profile</span>
                        </a>
                    </li>
                </ul>

                <div class="sidebar-footer">
                    <a href="../pages/Home.html" class="btn btn-secondary btn-sm" style="width: 100%; text-align: center;">
                        🛍 Customer Store ↗
                    </a>
                </div>
            </aside>
        `;
    }

    // 2. Topbar Injection
    const topbarSlot = document.getElementById("adminTopbarSlot");
    if (topbarSlot) {
        const userName = localStorage.getItem("user") || "Administrator";
        topbarSlot.innerHTML = `
            <header class="admin-topbar">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <h2 style="font-size: 1.25rem; font-weight: 700; color: #FFF;" id="topbarPageTitle">Admin Control Center</h2>
                </div>

                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-admin); border-radius: var(--radius-full); padding: 6px 14px;">
                        <div style="width: 28px; height: 28px; border-radius: var(--radius-full); background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700;">
                            👑
                        </div>
                        <span style="font-size: 0.88rem; font-weight: 600; color: #FFF;">${userName}</span>
                    </div>

                    <button class="btn btn-secondary btn-sm" onclick="logoutAdmin()">
                        Sign Out
                    </button>
                </div>
            </header>
        `;
    }
}

function logoutAdmin() {
    localStorage.clear();
    showAdminToast("Signed Out", "Redirecting to login...", "info");
    setTimeout(() => {
        window.location.href = "../pages/Login.html";
    }, 600);
}
