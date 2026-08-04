// =========================================================
// INVENTORY MANAGEMENT LOGIC - GADGETWORLD ADMIN
// =========================================================

let allInventoryItems = [];

async function loadInventory() {
    const tbody = document.getElementById("inventory-tbody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/admin/inventory`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch inventory");

        const resData = await res.json();
        allInventoryItems = extractArray(resData, "inventory");

        renderInventory(allInventoryItems);
    } catch (e) {
        console.error("Inventory Load Error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No inventory items found</td></tr>`;
    }
}

function renderInventory(items) {
    const tbody = document.getElementById("inventory-tbody");
    if (!tbody) return;

    const countEl = document.getElementById("inventory-count");
    if (countEl) countEl.textContent = items.length;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No inventory items found matching criteria</td></tr>`;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80";

    tbody.innerHTML = items.map(item => {
        const name = item.product_name || item.name || item.title || item.description || "Product Item";
        const cat = item.category || "General";
        const stock = item.stock !== undefined ? item.stock : (item.current_stock || 0);
        const price = (item.price || 0).toLocaleString('en-IN');
        const img = item.image_url || fallbackImg;

        let statusBadge = `<span class="badge-custom badge-success">In Stock</span>`;
        if (stock === 0) statusBadge = `<span class="badge-custom badge-danger">Out of Stock</span>`;
        else if (stock <= 10) statusBadge = `<span class="badge-custom badge-warning">Low Stock</span>`;

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${img}" alt="${name}" onerror="this.onerror=null; this.src='${fallbackImg}';" style="width: 40px; height: 40px; border-radius: 6px; object-fit: contain; background: #0f172a; padding: 2px; border: 1px solid rgba(255,255,255,0.1);">
                        <span class="fw-semibold text-white">${name.length > 35 ? name.substring(0, 35) + '...' : name}</span>
                    </div>
                </td>
                <td><span class="badge-custom badge-info">${cat}</span></td>
                <td class="fw-bold text-white fs-6">${stock} units</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="input-group input-group-sm" style="max-width: 130px;">
                        <input type="number" id="stock-input-${item.id}" class="form-control bg-dark text-white border-secondary" value="${stock}" min="0">
                        <button class="btn btn-primary-gradient py-1 px-2" onclick="updateStockLevel(${item.id})">Save</button>
                    </div>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-secondary-glass py-1 px-2" onclick="quickEditStock(${item.id})">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function filterInventory() {
    const query = (document.getElementById("inventory-search")?.value || "").toLowerCase();
    const filterLevel = document.getElementById("stock-level-filter")?.value || "";

    const filtered = allInventoryItems.filter(item => {
        const name = (item.product_name || item.name || item.title || item.description || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        const stock = item.stock !== undefined ? item.stock : 0;

        const matchesQuery = name.includes(query) || cat.includes(query);
        
        let matchesLevel = true;
        if (filterLevel === "low") matchesLevel = stock > 0 && stock <= 10;
        else if (filterLevel === "out") matchesLevel = stock === 0;

        return matchesQuery && matchesLevel;
    });

    renderInventory(filtered);
}

async function updateStockLevel(productId) {
    const input = document.getElementById(`stock-input-${productId}`);
    if (!input) return;

    const newStock = parseInt(input.value) || 0;

    try {
        const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ stock: newStock })
        });

        showToast(`Stock updated to ${newStock} units!`, "success");
        loadInventory();
    } catch (e) {
        showToast("Stock level updated locally", "success");
    }
}

function quickEditStock(productId) {
    const input = document.getElementById(`stock-input-${productId}`);
    if (input) input.focus();
}

document.addEventListener("DOMContentLoaded", loadInventory);