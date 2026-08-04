// =========================================================
// SIDEBAR COMPONENTS & ACTIVE NAVIGATION - GADGETWORLD ADMIN
// =========================================================

function renderSidebar() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) return;

    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    
    const menuItems = [
        { section: "Main" },
        { name: "Dashboard", icon: "bi-speedometer2", href: "dashboard.html" },
        { name: "Products", icon: "bi-box-seam", href: "products.html" },
        { name: "Categories", icon: "bi-grid", href: "categories.html" },
        { name: "Orders", icon: "bi-cart-check", href: "orders.html", badge: "Live" },
        { name: "Customers", icon: "bi-people", href: "customers.html" },
        { name: "Inventory", icon: "bi-boxes", href: "inventory.html" },
        
        { section: "Marketing & Feedback" },
        { name: "Analytics", icon: "bi-bar-chart-line", href: "analytics.html" },
        { name: "Reports", icon: "bi-file-earmark-bar-graph", href: "reports.html" },
        { name: "Coupons", icon: "bi-ticket-perforated", href: "coupons.html" },
        { name: "Reviews", icon: "bi-star", href: "reviews.html" },

        { section: "System & Settings" },
        { name: "Store Settings", icon: "bi-gear", href: "settings.html" },
        { name: "My Profile", icon: "bi-person-badge", href: "profile.html" }
    ];

    let navHTML = `
    <aside class="sidebar">
        <div class="sidebar-brand">
            <div class="brand-icon">
                <i class="bi bi-cpu-fill"></i>
            </div>
            <div class="brand-text">
                <h2>GadgetWorld</h2>
                <span>ADMIN PANEL v2.0</span>
            </div>
        </div>
        
        <nav class="sidebar-nav">
            <ul class="nav-list">
    `;

    menuItems.forEach(item => {
        if (item.section) {
            navHTML += `<li class="nav-section-title">${item.section}</li>`;
        } else {
            const isActive = currentPage === item.href ? "active" : "";
            const badgeHTML = item.badge ? `<span class="nav-badge">${item.badge}</span>` : "";
            navHTML += `
                <li class="nav-item ${isActive}">
                    <a href="${item.href}" class="nav-link">
                        <div class="nav-link-content">
                            <i class="bi ${item.icon}"></i>
                            <span>${item.name}</span>
                        </div>
                        ${badgeHTML}
                    </a>
                </li>
            `;
        }
    });

    const adminName = localStorage.getItem("adminName") || "Manish Admin";
    const adminEmail = localStorage.getItem("adminEmail") || "manish07@gmail.com";

    navHTML += `
            </ul>
        </nav>

        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="user-info">
                    <div class="user-icon-badge me-2" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center; color: #818cf8; font-size: 1.1rem; flex-shrink: 0;">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="user-details">
                        <h5>${adminName}</h5>
                        <span>${adminEmail}</span>
                    </div>
                </div>
                <button class="btn-logout" onclick="handleLogout()" title="Logout">
                    <i class="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </div>
    </aside>
    `;

    sidebarContainer.innerHTML = navHTML;
}

// Ping Backend Health
async function checkBackendHealth() {
    const statusPill = document.getElementById("backend-status");
    if (!statusPill) return;

    try {
        const res = await fetch("http://127.0.0.1:8001/health");
        if (res.ok) {
            statusPill.innerHTML = `<span class="status-dot"></span> Backend Active (:8001)`;
            statusPill.className = "backend-status-badge";
        } else {
            throw new Error("Port 8001 unresponsive");
        }
    } catch (e) {
        statusPill.innerHTML = `<span class="status-dot" style="background:#ef4444;box-shadow:0 0 8px #ef4444;"></span> Backend Offline`;
        statusPill.style.color = "#f87171";
        statusPill.style.background = "rgba(239, 68, 68, 0.15)";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    checkBackendHealth();
});
