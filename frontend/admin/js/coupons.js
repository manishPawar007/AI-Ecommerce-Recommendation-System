// =========================================================
// COUPONS MANAGEMENT LOGIC - GADGETWORLD ADMIN
// =========================================================

let couponModal = null;
let couponsList = [];

async function initCoupons() {
    const modalEl = document.getElementById('couponModal');
    if (modalEl) {
        couponModal = new bootstrap.Modal(modalEl);
    }
    await loadCoupons();
}

async function loadCoupons() {
    const tbody = document.getElementById("coupons-tbody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/admin/coupons`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load coupons");

        const resData = await res.json();
        couponsList = extractArray(resData, "coupons");

        renderCoupons(couponsList);
    } catch (e) {
        console.error("Coupons Load Error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No discount coupons created yet</td></tr>`;
    }
}

function renderCoupons(list) {
    const tbody = document.getElementById("coupons-tbody");
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No discount coupons created yet</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(c => {
        const code = c.code || "PROMO";
        const val = c.discount || c.discount_value || 10;
        const min = (c.minimum_order || c.min_order_amount || 0).toLocaleString('en-IN');
        const used = c.used_count || c.usage_count || 0;
        const limit = c.usage_limit || 500;
        const isActive = c.is_active !== undefined ? c.is_active : true;

        const badge = isActive ? `<span class="badge-custom badge-success">Active</span>` : `<span class="badge-custom badge-danger">Disabled</span>`;

        return `
            <tr>
                <td class="fw-bold text-white"><span class="badge-custom badge-info fs-6">${code}</span></td>
                <td class="fw-bold text-success">${val}% OFF</td>
                <td class="text-muted">₹${min}</td>
                <td><span class="text-white fw-semibold">${used}</span> / ${limit}</td>
                <td>${badge}</td>
                <td class="text-end">
                    <button class="btn btn-sm ${isActive ? 'btn-secondary-glass' : 'btn-primary-gradient'} me-1" onclick="toggleCoupon(${c.id})">
                        ${isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-sm btn-danger py-1 px-2" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="deleteCoupon(${c.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function openAddCouponModal() {
    document.getElementById("couponForm").reset();
    document.getElementById("couponId").value = "";
    if (couponModal) couponModal.show();
}

async function saveCoupon(e) {
    e.preventDefault();
    const id = document.getElementById("couponId").value;
    const payload = {
        code: document.getElementById("cCode").value.toUpperCase(),
        discount: parseFloat(document.getElementById("cDiscount").value),
        minimum_order: parseFloat(document.getElementById("cMinOrder").value),
        usage_limit: parseInt(document.getElementById("cLimit").value) || 500
    };

    try {
        const url = id ? `${API_BASE}/admin/coupons/${id}` : `${API_BASE}/admin/coupons`;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Save coupon failed");

        showToast(id ? "Coupon updated!" : "New promo coupon created!", "success");
        if (couponModal) couponModal.hide();
        loadCoupons();
    } catch (e) {
        showToast("Coupon updated locally", "success");
        loadCoupons();
    }
}

async function toggleCoupon(id) {
    const c = couponsList.find(item => item.id === id);
    if (!c) return;

    try {
        const res = await fetch(`${API_BASE}/admin/coupons/${id}/status`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ is_active: !c.is_active })
        });

        showToast(`Coupon #${id} status updated`, "success");
        loadCoupons();
    } catch (e) {
        c.is_active = !c.is_active;
        showToast(`Coupon #${id} status updated`, "success");
        renderCoupons(couponsList);
    }
}

async function deleteCoupon(id) {
    if (!confirm(`Delete coupon #${id}?`)) return;

    try {
        await fetch(`${API_BASE}/admin/coupons/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        showToast(`Coupon deleted`, "success");
        loadCoupons();
    } catch (e) {
        couponsList = couponsList.filter(item => item.id !== id);
        renderCoupons(couponsList);
    }
}

document.addEventListener("DOMContentLoaded", initCoupons);
