// ======================================================
// GadgetWorld Customer Storefront - API Configuration
// ======================================================

const BASE_URL = window.API_BASE_URL || localStorage.getItem("backend_api_url") || (
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
        ? "http://127.0.0.1:8001/api"
        : `${window.location.origin}/api`
);

// Universal API Request
async function apiRequest(endpoint, method = "GET", body = null, auth = true) {
    const headers = {};

    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (auth) {
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const options = { method, headers };

    if (body) {
        options.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.detail || data?.message || `HTTP Error ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`[API ERROR ${method} ${endpoint}]:`, error);
        throw error;
    }
}

async function getRequest(endpoint) {
    return await apiRequest(endpoint, "GET");
}

async function postRequest(endpoint, data) {
    return await apiRequest(endpoint, "POST", data);
}

async function updateRequest(endpoint, data) {
    return await apiRequest(endpoint, "PUT", data);
}

async function deleteRequest(endpoint) {
    return await apiRequest(endpoint, "DELETE");
}

console.log("✅ Customer API connected to http://127.0.0.1:8001/api");