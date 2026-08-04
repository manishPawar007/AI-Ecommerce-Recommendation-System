// =========================================================
// CUSTOMER ORDERS LOGIC - GADGETWORLD ULTRA-PREMIUM TRACKER
// =========================================================

async function loadCustomerOrders() {
    const container = document.getElementById("user-orders-container");
    if (!container) return;

    const currentUserEmail = typeof getUserEmail === "function" ? getUserEmail() : (localStorage.getItem("userEmail") || "guest@gadgetworld.com").toLowerCase().trim();

    let localOrders = [];
    if (currentUserEmail) {
        const orderKey = `userOrders_${currentUserEmail}`;
        localOrders = JSON.parse(localStorage.getItem(orderKey) || "[]");
    }

    let apiOrders = [];
    if (currentUserEmail && currentUserEmail !== "guest@gadgetworld.com") {
        try {
            const res = await getRequest(`/orders?email=${encodeURIComponent(currentUserEmail)}`);
            if (res && Array.isArray(res)) {
                apiOrders = res;
            }
        } catch (e) {
            console.warn("API orders fetch fallback");
        }
    }

    // Merge API and Local Orders, avoiding duplicate displays
    let orderMap = new Map();
    let contentSignatures = new Set();

    [...apiOrders, ...localOrders].forEach(o => {
        const uniqueId = o.id || o.order_number;
        const total = o.total_amount || o.total || 0;
        const rawItems = o.items || o.order_items || [];
        const itemsSignature = rawItems.map(i => i.title || i.product_name || i.id || '').sort().join("|");
        const contentKey = `${total}_${rawItems.length}_${itemsSignature}`;

        if (uniqueId && orderMap.has(uniqueId)) {
            return;
        }
        if (contentKey !== "0_0_" && contentSignatures.has(contentKey)) {
            return;
        }

        if (uniqueId) {
            orderMap.set(uniqueId, o);
        } else {
            orderMap.set(JSON.stringify(o), o);
        }
        if (contentKey !== "0_0_") {
            contentSignatures.add(contentKey);
        }
    });

    let orders = Array.from(orderMap.values());

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="glass-card text-center py-5">
                <i class="bi bi-box-seam fs-1 d-block mb-3 text-primary"></i>
                <h4 class="text-white fw-bold">No Order History Found</h4>
                <p class="small mb-4" style="color: #cbd5e1;">You haven't placed any orders with ${currentUserEmail} yet.</p>
                <a href="Products.html" class="btn btn-primary-gradient px-4 py-2.5">
                    <i class="bi bi-bag-check-fill me-1"></i> Start Shopping Now
                </a>
            </div>
        `;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100";

    container.innerHTML = orders.map(o => {
        const num = o.order_number || `#GW-${o.id}`;
        const date = o.created_at || o.date ? new Date(o.created_at || o.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Today";
        const status = o.status || "Placed";
        const total = (o.total_amount || o.total || 1499).toLocaleString('en-IN');
        const items = o.items || o.order_items || [];

        // High-contrast badge HTML
        let statusBadge = `<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.5); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"><i class="bi bi-check-circle-fill"></i> ORDER PLACED</span>`;
        if (status === "Processing") {
            statusBadge = `<span style="background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.5); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"><i class="bi bi-cpu-fill"></i> PROCESSING</span>`;
        } else if (status === "Shipped") {
            statusBadge = `<span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"><i class="bi bi-truck"></i> SHIPPED</span>`;
        } else if (status === "Delivered") {
            statusBadge = `<span style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.5); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"><i class="bi bi-box-seam-fill"></i> DELIVERED</span>`;
        }

        return `
            <div class="glass-card p-4 mb-4" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(99, 102, 241, 0.3); box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                
                <!-- Order Header Info Bar -->
                <div class="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom border-secondary border-opacity-20 gap-3 mb-4">
                    <div>
                        <span class="d-block fw-bold text-uppercase mb-1" style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.8px;">ORDER ID</span>
                        <h4 class="mb-0 text-white fw-bold" style="font-family: 'Outfit', sans-serif;">${num}</h4>
                    </div>

                    <div>
                        <span class="d-block fw-bold text-uppercase mb-1" style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.8px;">PLACED ON</span>
                        <h6 class="mb-0 fw-semibold" style="color: #e2e8f0;">${date}</h6>
                    </div>

                    <div>
                        <span class="d-block fw-bold text-uppercase mb-1" style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.8px;">CURRENT STATUS</span>
                        <div>${statusBadge}</div>
                    </div>

                    <div>
                        <span class="d-block fw-bold text-uppercase mb-1" style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.8px;">TOTAL PAYABLE</span>
                        <h4 class="mb-0 text-success fw-bold">₹${total}</h4>
                    </div>
                </div>

                <!-- High-Contrast Live Delivery Tracker -->
                <div class="p-3 mb-4 rounded-3" style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);">
                    <div class="d-flex align-items-center justify-content-between px-3 py-2">
                        <!-- Step 1: Placed -->
                        <div class="text-center position-relative">
                            <div class="rounded-circle d-inline-flex align-items-center justify-content-center bg-success text-white mb-2 shadow-sm" style="width: 38px; height: 38px; font-size: 1.1rem;">
                                <i class="bi bi-check-lg"></i>
                            </div>
                            <span class="d-block fw-bold text-white small">Order Placed</span>
                            <span class="extra-small" style="color: #a7f3d0;">Confirmed</span>
                        </div>

                        <!-- Connector Line 1 -->
                        <div class="flex-grow-1 mx-3" style="height: 3px; background: linear-gradient(90deg, #10b981 0%, #6366f1 100%);"></div>

                        <!-- Step 2: Processing -->
                        <div class="text-center position-relative">
                            <div class="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white mb-2 shadow-sm" style="width: 38px; height: 38px; font-size: 1.1rem; box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);">
                                <i class="bi bi-cpu-fill"></i>
                            </div>
                            <span class="d-block fw-bold text-white small">Processing</span>
                            <span class="extra-small" style="color: #cbd5e1;">Quality Check</span>
                        </div>

                        <!-- Connector Line 2 -->
                        <div class="flex-grow-1 mx-3" style="height: 3px; background: rgba(255, 255, 255, 0.15);"></div>

                        <!-- Step 3: Shipped -->
                        <div class="text-center position-relative opacity-75">
                            <div class="rounded-circle d-inline-flex align-items-center justify-content-center bg-dark text-warning mb-2 border border-secondary" style="width: 38px; height: 38px; font-size: 1.1rem;">
                                <i class="bi bi-truck"></i>
                            </div>
                            <span class="d-block fw-semibold text-white small">Express Shipping</span>
                            <span class="extra-small" style="color: #94a3b8;">In Transit</span>
                        </div>

                        <!-- Connector Line 3 -->
                        <div class="flex-grow-1 mx-3" style="height: 3px; background: rgba(255, 255, 255, 0.15);"></div>

                        <!-- Step 4: Delivered -->
                        <div class="text-center position-relative opacity-75">
                            <div class="rounded-circle d-inline-flex align-items-center justify-content-center bg-dark text-info mb-2 border border-secondary" style="width: 38px; height: 38px; font-size: 1.1rem;">
                                <i class="bi bi-box-seam-fill"></i>
                            </div>
                            <span class="d-block fw-semibold text-white small">Delivered</span>
                            <span class="extra-small" style="color: #94a3b8;">Est. 2 Days</span>
                        </div>
                    </div>
                </div>

                <!-- Package Items List -->
                <h6 class="text-white fw-bold mb-3"><i class="bi bi-bag-check text-primary me-2"></i> Ordered Items (${items.length})</h6>
                <div class="row g-3">
                    ${items.length > 0 ? items.map(item => `
                        <div class="col-md-6">
                            <div class="p-3 rounded-3 d-flex align-items-center justify-content-between gap-3" style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.08);">
                                <div class="d-flex align-items-center gap-3">
                                    <img src="${item.img || fallbackImg}" onerror="this.onerror=null; this.src='${fallbackImg}';" style="width: 52px; height: 52px; border-radius: 8px; object-fit: contain; background: #0f172a; padding: 4px; border: 1px solid rgba(255,255,255,0.1);">
                                    <div>
                                        <h6 class="mb-1 text-white fw-bold" style="font-size: 0.95rem;">${item.title || item.product_name || 'Electronics Item'}</h6>
                                        <span class="small" style="color: #cbd5e1;">Qty: <strong class="text-white">${item.quantity || 1}</strong> • <span class="text-success fw-bold">₹${(item.price || 999).toLocaleString('en-IN')}</span></span>
                                    </div>
                                </div>
                                <a href="Products.html" class="btn btn-sm btn-secondary-glass text-nowrap">
                                    Buy Again
                                </a>
                            </div>
                        </div>
                    `).join("") : `
                        <div class="col-12">
                            <div class="p-3 rounded-3 bg-dark text-white small">Package items being processed for dispatch...</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", loadCustomerOrders);
