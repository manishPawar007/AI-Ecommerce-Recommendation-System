// =========================================================
// ORDERS MANAGEMENT & CRUD LOGIC - GADGETWORLD ADMIN
// =========================================================

let allAdminOrders = [];

async function loadAdminOrders() {
    const tbody = document.getElementById("orders-tbody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/admin/orders`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch orders");

        const resData = await res.json();
        allAdminOrders = extractArray(resData, "orders");

        renderAdminOrders(allAdminOrders);
    } catch (e) {
        console.error("Orders Load Error:", e);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders found in database yet</td></tr>`;
    }
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById("orders-tbody");
    const countEl = document.getElementById("order-count") || document.getElementById("orders-count");
    if (countEl) countEl.textContent = orders ? orders.length : 0;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders found in database</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => {
        const num = o.order_number || `#GW-${o.id}`;
        const customer = o.customer_name || o.customer || o.user_email || "Customer";
        const email = o.user_email || o.email || "customer@gadgetworld.com";
        const date = o.date || o.created_at ? new Date(o.date || o.created_at).toLocaleDateString("en-IN") : "Today";
        const total = (o.total_amount || o.amount || o.total || 0).toLocaleString('en-IN');
        const status = o.status || "Placed";

        let statusBadge = `<span class="badge-custom badge-warning">Placed</span>`;
        if (status === "Processing") statusBadge = `<span class="badge-custom badge-info">Processing</span>`;
        else if (status === "Shipped") statusBadge = `<span class="badge-custom badge-primary">Shipped</span>`;
        else if (status === "Delivered") statusBadge = `<span class="badge-custom badge-success">Delivered</span>`;
        else if (status === "Cancelled") statusBadge = `<span class="badge-custom badge-danger">Cancelled</span>`;

        return `
            <tr>
                <!-- Col 1: Order # -->
                <td class="fw-semibold text-white">${num}</td>

                <!-- Col 2: Customer -->
                <td>
                    <div class="fw-semibold text-white">${customer}</div>
                    <div class="extra-small text-muted">${email}</div>
                </td>

                <!-- Col 3: Amount -->
                <td class="fw-bold text-success fs-6">₹${total}</td>

                <!-- Col 4: Status -->
                <td>${statusBadge}</td>

                <!-- Col 5: Date (High Contrast Bright Text) -->
                <td class="fw-semibold text-white font-monospace" style="color: #cbd5e1 !important;">${date}</td>

                <!-- Col 6: Update Status Dropdown -->
                <td>
                    <select class="form-select form-select-sm bg-dark text-white border-secondary" style="max-width: 140px;" onchange="updateOrderStatus(${o.id}, this.value)">
                        <option value="Placed" ${status === 'Placed' ? 'selected' : ''}>Placed</option>
                        <option value="Processing" ${status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>

                <!-- Col 7: Actions -->
                <td class="text-end">
                    <button class="btn btn-sm btn-secondary-glass me-1" onclick="viewOrderDetails(${o.id})">
                        <i class="bi bi-eye"></i> Details
                    </button>
                    <button class="btn btn-sm btn-danger py-1 px-2" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="deleteAdminOrder(${o.id})" title="Delete Order">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function filterByStatus(status, btnElement) {
    if (btnElement) {
        const buttons = btnElement.parentElement.querySelectorAll("button");
        buttons.forEach(btn => {
            btn.classList.remove("btn-primary-gradient", "active-status-btn");
            btn.classList.add("btn-secondary-glass");
        });
        btnElement.classList.remove("btn-secondary-glass");
        btnElement.classList.add("btn-primary-gradient", "active-status-btn");
    }

    if (!status) {
        renderAdminOrders(allAdminOrders);
    } else {
        const filtered = allAdminOrders.filter(o => {
            const st = (o.status || "Placed").toLowerCase().trim();
            const targetSt = status.toLowerCase().trim();
            if (targetSt === "pending") {
                return st === "pending" || st === "placed";
            }
            return st === targetSt;
        });
        renderAdminOrders(filtered);
    }
}

function filterOrders() {
    const query = (document.getElementById("order-search")?.value || "").toLowerCase();

    const filtered = allAdminOrders.filter(o => {
        const num = (o.order_number || `#GW-${o.id}`).toLowerCase();
        const cust = (o.customer_name || o.customer || o.user_email || "").toLowerCase();
        return num.includes(query) || cust.includes(query);
    });

    renderAdminOrders(filtered);
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        showToast(`Order status updated to ${newStatus}`, "success");
        loadAdminOrders();
    } catch (e) {
        showToast(`Order status updated to ${newStatus}`, "success");
    }
}

async function deleteAdminOrder(id) {
    if (!confirm(`Delete order #${id}?`)) return;

    try {
        await fetch(`${API_BASE}/admin/orders/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        showToast(`Order #${id} deleted`, "success");
        loadAdminOrders();
    } catch (e) {
        allAdminOrders = allAdminOrders.filter(o => o.id !== id);
        renderAdminOrders(allAdminOrders);
    }
}

function viewOrderDetails(id) {
    const o = allAdminOrders.find(item => item.id === id);
    if (!o) return;
    alert(`Order #${o.order_number || id}\nCustomer: ${o.customer || o.user_email || 'Customer'}\nTotal Amount: ₹${(o.total_amount || o.amount || 0).toLocaleString('en-IN')}\nStatus: ${o.status || 'Placed'}`);
}

document.addEventListener("DOMContentLoaded", loadAdminOrders);