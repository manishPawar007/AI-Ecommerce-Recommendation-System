/**
 * ===================================================================
 * GADGETWORLD ORDERS LOGIC (orders.js)
 * Live Order History, Tracking Timeline, Cancellation & Reordering
 * ===================================================================
 */

let allOrdersList = [];

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    await loadOrders();
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

async function loadOrders() {
    let user = await ensureRealUserId();
    if (!user) {
        user = getUser();
    }
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    if (!user) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;" class="glass-panel">
                <div style="font-size: 3.5rem; margin-bottom: 12px;">🔒</div>
                <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Sign In to View Your Orders</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Only you can view your personal order history and delivery tracking. Please sign in to continue.</p>
                <a href="Login.html" class="btn btn-primary">
                    Sign In to Account 🚀
                </a>
            </div>
        `;
        return;
    }

    try {
        allOrdersList = await apiRequest(`/orders/?user_id=${user.id}`);
        renderOrdersUI(allOrdersList);
    } catch (e) {
        console.error("Orders load error:", e);
        container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">Failed to load orders: ${e.message}</div>`;
    }
}

function renderOrdersUI(orders) {
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;" class="glass-panel">
                <div style="font-size: 3.5rem; margin-bottom: 12px;">📦</div>
                <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No Orders Placed Yet</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">You haven't placed any orders yet. Discover our top AI recommended gadgets today!</p>
                <a href="Products.html" class="btn btn-primary">
                    Explore Catalog →
                </a>
            </div>
        `;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

    container.innerHTML = orders.map(order => {
        const items = order.items || [];
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Recent';

        // Timeline status indexing
        const statuses = ["Placed", "Processing", "Shipped", "Delivered"];
        const currentIdx = statuses.indexOf(order.status);
        const isCancelled = order.status === "Cancelled";

        return `
            <div class="order-card" id="order-card-${order.id}">
                <div class="order-header">
                    <div>
                        <div style="font-size: 1.15rem; font-weight: 700; color: #FFF; font-family: 'Outfit'; margin-bottom: 4px;">
                            ${order.order_number || `ORD-${order.id}`}
                        </div>
                        <div style="font-size: 0.82rem; color: var(--text-muted);">
                            Placed on ${dateStr}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ${isCancelled ? 'badge-low-stock' : (order.status === 'Delivered' ? 'badge-stock' : 'badge-ai')}" style="font-size: 0.82rem;">
                            ${order.status}
                        </span>
                        <div style="font-size: 1.25rem; font-weight: 800; color: #FFF; font-family: 'Outfit'; margin-top: 4px;">
                            ${formatPrice(order.total_amount)}
                        </div>
                    </div>
                </div>

                <!-- Order Status Timeline (if not cancelled) -->
                ${!isCancelled ? `
                    <div class="order-timeline">
                        <div class="timeline-step ${currentIdx >= 0 ? (currentIdx === 0 ? 'active' : 'completed') : ''}">
                            <div class="step-dot">${currentIdx > 0 ? '✔' : '1'}</div>
                            <div class="step-label">Placed</div>
                        </div>
                        <div class="timeline-step ${currentIdx >= 1 ? (currentIdx === 1 ? 'active' : 'completed') : ''}">
                            <div class="step-dot">${currentIdx > 1 ? '✔' : '2'}</div>
                            <div class="step-label">Processing</div>
                        </div>
                        <div class="timeline-step ${currentIdx >= 2 ? (currentIdx === 2 ? 'active' : 'completed') : ''}">
                            <div class="step-dot">${currentIdx > 2 ? '✔' : '3'}</div>
                            <div class="step-label">Shipped</div>
                        </div>
                        <div class="timeline-step ${currentIdx >= 3 ? 'completed active' : ''}">
                            <div class="step-dot">${currentIdx >= 3 ? '✔' : '4'}</div>
                            <div class="step-label">Delivered</div>
                        </div>
                    </div>
                ` : `
                    <div style="padding: 12px 16px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: var(--radius-md); margin: 16px 0; color: #FDA4AF; font-size: 0.88rem;">
                        ⚠️ This order was cancelled. Restocked in warehouse.
                    </div>
                `}

                <!-- Items Breakdown -->
                <div style="background: rgba(255,255,255,0.02); border-radius: var(--radius-md); padding: 14px; margin-top: 16px;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 10px;">
                        Items Ordered (${items.length}):
                    </div>
                    ${items.map(it => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <img src="${it.image_url || fallbackImg}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;" onerror="this.src='${fallbackImg}'">
                                <div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: #FFF; line-height: 1.2;">
                                        ${it.product_name}
                                    </div>
                                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                                        Qty: ${it.quantity} × ${formatPrice(it.price)}
                                    </div>
                                </div>
                            </div>
                            <div style="font-weight: 700; color: #FFF; font-size: 0.95rem;">
                                ${formatPrice(it.subtotal)}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Footer Actions -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 18px; pt-2; flex-wrap: wrap; gap: 10px;">
                    <button class="btn btn-secondary btn-sm" onclick="printReceipt(${order.id})">
                        📄 Download / Print Invoice
                    </button>

                    <div style="display: flex; gap: 10px;">
                        ${items.length > 0 ? `
                            <button class="btn btn-primary btn-sm" onclick="buyAgain(${items[0].product_id})">
                                🔄 Buy Again
                            </button>
                        ` : ''}
                        ${!isCancelled && order.status !== 'Delivered' ? `
                            <button class="btn btn-danger btn-sm" onclick="cancelOrderUI(${order.id})">
                                Cancel Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterOrdersUI(status, btnElement) {
    const container = document.getElementById("orderFilterTabs");
    if (container) {
        container.querySelectorAll("button").forEach(b => {
            b.className = "btn btn-secondary btn-sm";
        });
    }
    if (btnElement) {
        btnElement.className = "btn btn-primary btn-sm";
    }

    if (status === 'all') {
        renderOrdersUI(allOrdersList);
    } else {
        const filtered = allOrdersList.filter(o => o.status.toLowerCase() === status.toLowerCase());
        renderOrdersUI(filtered);
    }
}

async function cancelOrderUI(orderId) {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;

    try {
        await apiRequest(`/orders/${orderId}/cancel`, "PUT");
        showToast("Order Cancelled", "Your order has been cancelled and stock restored.", "info");
        await loadOrders();
    } catch (e) {
        showToast("Cancellation Error", e.message, "error");
    }
}

async function buyAgain(productId) {
    await addToCartGlobal(productId, 1);
    window.location.href = "Cart.html";
}

function printReceipt(orderId) {
    showToast("Invoice Generating", `Opening invoice print preview for Order #${orderId}`, "info");
    window.print();
}
