/**
 * ===================================================================
 * GADGETWORLD ADMIN ORDERS LOGIC (orders.js)
 * Order Status Management, Items Inspection & Exporting
 * ===================================================================
 */

let adminOrderPage = 1;
const adminOrderLimit = 15;
let currentStatusFilter = "";
let orderSearchTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    renderAdminLayout("orders");
    loadAdminOrders();
});

function debounceAdminOrderSearch() {
    clearTimeout(orderSearchTimer);
    orderSearchTimer = setTimeout(() => {
        adminOrderPage = 1;
        loadAdminOrders();
    }, 350);
}

function filterAdminOrders(status, btnElement) {
    currentStatusFilter = status;
    const container = document.getElementById("adminOrderStatusPills");
    if (container) {
        container.querySelectorAll("button").forEach(b => b.className = "btn btn-secondary btn-sm");
    }
    if (btnElement) btnElement.className = "btn btn-primary btn-sm";

    adminOrderPage = 1;
    loadAdminOrders();
}

async function loadAdminOrders() {
    const tbody = document.getElementById("adminOrdersTbody");
    if (!tbody) return;

    const search = document.getElementById("adminOrderSearchInput")?.value.trim() || "";

    let url = `/admin/orders?page=${adminOrderPage}&limit=${adminOrderLimit}`;
    if (currentStatusFilter) url += `&status=${encodeURIComponent(currentStatusFilter)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    try {
        const res = await adminApi(url);
        const orders = res.orders || [];
        const total = res.total || 0;

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No orders found.</td></tr>`;
            renderAdminOrderPagination(0);
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const custName = o.user ? o.user.name : `Customer #${o.user_id}`;
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Recent';

            return `
                <tr>
                    <td><strong style="color: var(--primary); font-family: 'Outfit';">${o.order_number || `ORD-${o.id}`}</strong></td>
                    <td>
                        <div style="font-weight: 600; color: #FFF;">${custName}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${o.user ? o.user.email : ''}</div>
                    </td>
                    <td><strong style="color: #FFF; font-family: 'Outfit';">${formatPrice(o.total_amount)}</strong></td>
                    <td>
                        <select class="status-select" onchange="changeOrderStatus(${o.id}, this.value)">
                            <option value="Placed" ${o.status === 'Placed' ? 'selected' : ''}>Placed</option>
                            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.84rem;">${dateStr}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails(${o.id})">
                            🔍 Inspect
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        renderAdminOrderPagination(total);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-rose);">Error loading orders: ${e.message}</td></tr>`;
    }
}

function renderAdminOrderPagination(total) {
    const container = document.getElementById("adminOrderPagination");
    if (!container) return;

    const totalPages = Math.ceil(total / adminOrderLimit);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = `
        <button class="btn btn-secondary btn-sm" ${adminOrderPage === 1 ? 'disabled' : ''} onclick="adminOrderPage--; loadAdminOrders();">← Prev</button>
        <span style="font-size: 0.88rem; color: var(--text-muted);">Page ${adminOrderPage} of ${totalPages}</span>
        <button class="btn btn-secondary btn-sm" ${adminOrderPage === totalPages ? 'disabled' : ''} onclick="adminOrderPage++; loadAdminOrders();">Next →</button>
    `;
}

async function changeOrderStatus(orderId, status) {
    try {
        await adminApi(`/admin/orders/${orderId}/status`, "PUT", { status });
        showAdminToast("Order Updated", `Order #${orderId} set to ${status}`, "success");
    } catch (e) {
        showAdminToast("Update Failed", e.message, "error");
    }
}

async function viewOrderDetails(orderId) {
    const modal = document.getElementById("adminOrderDetailsModal");
    const body = document.getElementById("detailOrderBody");
    const title = document.getElementById("detailOrderTitle");

    title.textContent = `Order #ORD-${orderId}`;
    body.innerHTML = `<div class="skeleton" style="height: 180px;"></div>`;
    modal.classList.add("active");

    try {
        const [order, items] = await Promise.all([
            adminApi(`/admin/orders/${orderId}`),
            adminApi(`/admin/orders/${orderId}/items`)
        ]);

        const cust = order.user || {};
        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

        body.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: var(--text-muted);">Customer:</span>
                    <strong style="color: #FFF;">${cust.name || 'Customer'} (${cust.email || 'N/A'})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: var(--text-muted);">Total Value:</span>
                    <strong style="color: var(--primary); font-size: 1.1rem;">${formatPrice(order.total_amount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Current Status:</span>
                    <span class="badge badge-ai">${order.status}</span>
                </div>
            </div>

            <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: #FFF;">Line Items (${items.length}):</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${items.map(it => {
                    const prod = it.product || {};
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-admin); border-radius: var(--radius-sm);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${prod.image_url || fallbackImg}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover;" onerror="this.src='${fallbackImg}'">
                                <div>
                                    <div style="font-size: 0.88rem; font-weight: 600; color: #FFF; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${prod.description || prod.product_name || `Product #${it.product_id}`}
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Qty: ${it.quantity} × ${formatPrice(it.price)}</div>
                                </div>
                            </div>
                            <div style="font-weight: 700; color: #FFF;">${formatPrice(it.price * it.quantity)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<div style="color: var(--accent-rose); padding: 20px;">Failed to load order line items: ${e.message}</div>`;
    }
}

function exportOrdersCSV() {
    showAdminToast("Exporting", "Preparing CSV data download...", "info");
    window.location.href = `${API_BASE}/admin/orders/export`;
}