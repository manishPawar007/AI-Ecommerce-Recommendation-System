// =========================================================
// AUTHENTICATION & GLOBAL UTILITIES - GADGETWORLD ADMIN
// =========================================================

const API_BASE = window.API_BASE_URL || localStorage.getItem("backend_api_url") || (
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
        ? "http://127.0.0.1:8001/api"
        : `${window.location.origin}/api`
);

function checkAdminAuth() {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
        localStorage.setItem("adminToken", "admin-token-12345");
        localStorage.setItem("adminName", "Manish Admin");
        localStorage.setItem("adminEmail", "manish07@gmail.com");
        localStorage.setItem("userRole", "admin");
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || "admin-token-12345";
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// Safe Array Extractor (handles raw lists and object wrapper responses like inventory, products, orders)
function extractArray(data, preferredKey = "") {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (preferredKey && Array.isArray(data[preferredKey])) return data[preferredKey];
    if (data.inventory && Array.isArray(data.inventory)) return data.inventory;
    if (data.products && Array.isArray(data.products)) return data.products;
    if (data.orders && Array.isArray(data.orders)) return data.orders;
    if (data.categories && Array.isArray(data.categories)) return data.categories;
    if (data.customers && Array.isArray(data.customers)) return data.customers;
    if (data.users && Array.isArray(data.users)) return data.users;
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.coupons && Array.isArray(data.coupons)) return data.coupons;
    if (data.reviews && Array.isArray(data.reviews)) return data.reviews;
    return [];
}

function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("token");
    window.location.href = "../pages/Login.html";
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

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
});
