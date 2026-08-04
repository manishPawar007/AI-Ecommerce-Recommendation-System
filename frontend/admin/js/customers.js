// =========================================================
// CUSTOMERS MANAGEMENT LOGIC - GADGETWORLD ADMIN
// =========================================================

let allCustomers = [];

async function loadCustomers() {
    const tbody = document.getElementById("customers-tbody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/admin/customers`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch customers");

        const resData = await res.json();
        allCustomers = extractArray(resData, "customers");

        renderCustomers(allCustomers);
    } catch (e) {
        console.error("Customers Load Error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No customers found in database</td></tr>`;
    }
}

function renderCustomers(list) {
    const tbody = document.getElementById("customers-tbody");
    const countEl = document.getElementById("customers-count");
    if (countEl) countEl.textContent = list.length;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No customers found matching criteria</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(c => {
        const name = c.name || c.username || c.email.split('@')[0];
        const email = c.email || "customer@example.com";
        const role = (c.role || "customer").toUpperCase();
        const date = c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "Active";
        const ordersCount = c.orders_count || c.orders?.length || 0;

        return `
            <tr>
                <td class="fw-semibold text-white">
                    <div class="d-flex align-items-center gap-2">
                        <div class="stat-icon rounded-circle bg-primary bg-opacity-20 text-primary d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                            <i class="bi bi-person"></i>
                        </div>
                        ${name}
                    </div>
                </td>
                <td class="text-muted">${email}</td>
                <td><span class="badge-custom ${role === 'ADMIN' ? 'badge-warning' : 'badge-info'}">${role}</span></td>
                <td class="fw-bold text-success">${ordersCount} orders</td>
                <td class="text-muted">${date}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-secondary-glass" onclick="viewCustomerHistory('${email}')">
                        <i class="bi bi-eye"></i> Orders
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function filterCustomers() {
    const query = (document.getElementById("customer-search")?.value || "").toLowerCase();

    const filtered = allCustomers.filter(c => {
        const name = (c.name || c.email || "").toLowerCase();
        return name.includes(query);
    });

    renderCustomers(filtered);
}

function viewCustomerHistory(email) {
    window.location.href = `orders.html?search=${encodeURIComponent(email)}`;
}

document.addEventListener("DOMContentLoaded", loadCustomers);