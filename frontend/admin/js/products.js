/**
 * ===================================================================
 * GADGETWORLD ADMIN PRODUCTS LOGIC (products.js)
 * Full CRUD Catalog Management & PostgreSQL Synchronization
 * ===================================================================
 */

let adminCurrentPage = 1;
const adminPageLimit = 15;
let adminSearchTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    renderAdminLayout("products");
    await loadCategoriesDropdown();
    await loadAdminProducts();
});

async function loadCategoriesDropdown() {
    const select = document.getElementById("adminCategorySelect");
    const modalCat = document.getElementById("prodCat");
    if (!select) return;

    try {
        const cats = await adminApi("/admin/categories");
        const optionsHTML = (cats || []).map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        select.innerHTML = `<option value="">All Categories</option>${optionsHTML}`;
        if (modalCat && cats.length > 0) modalCat.innerHTML = optionsHTML;
    } catch (e) {
        console.error("Categories load error:", e);
    }
}

function debounceAdminSearch() {
    clearTimeout(adminSearchTimer);
    adminSearchTimer = setTimeout(() => {
        adminCurrentPage = 1;
        loadAdminProducts();
    }, 350);
}

async function loadAdminProducts() {
    const tbody = document.getElementById("adminProductsTbody");
    if (!tbody) return;

    const search = document.getElementById("adminProductSearch")?.value.trim() || "";
    const category = document.getElementById("adminCategorySelect")?.value || "";

    let url = `/admin/products?page=${adminCurrentPage}&limit=${adminPageLimit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    try {
        const res = await adminApi(url);
        const products = res.products || [];
        const total = res.total || 0;

        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No products found matching criteria.</td></tr>`;
            renderAdminPagination(0);
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

        tbody.innerHTML = products.map(p => {
            const inStock = (p.stock || 0) > 0;
            const isLow = (p.stock || 0) <= 10 && inStock;
            return `
                <tr>
                    <td style="color: var(--text-dim); font-weight: 600;">#${p.id}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${p.image_url || fallbackImg}" class="table-thumb" onerror="this.src='${fallbackImg}'">
                            <div>
                                <div style="font-weight: 600; color: #FFF; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${p.description || p.product_name}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge badge-category">${p.category || 'General'}</span></td>
                    <td><strong style="color: #FFF; font-family: 'Outfit';">${formatPrice(p.price)}</strong></td>
                    <td>
                        <span class="badge ${!inStock ? 'badge-low-stock' : (isLow ? 'badge-trending' : 'badge-stock')}">
                            ${p.stock} in stock
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick='openEditProductModal(${JSON.stringify(p)})'>
                                ✏️ Edit
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">
                                🗑 Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        renderAdminPagination(total);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-rose);">Failed to load products: ${e.message}</td></tr>`;
    }
}

function renderAdminPagination(total) {
    const container = document.getElementById("adminPagination");
    if (!container) return;

    const totalPages = Math.ceil(total / adminPageLimit);
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = `
        <button class="btn btn-secondary btn-sm" ${adminCurrentPage === 1 ? 'disabled' : ''} onclick="adminChangePage(${adminCurrentPage - 1})">← Prev</button>
        <span style="font-size: 0.88rem; color: var(--text-muted);">Page ${adminCurrentPage} of ${totalPages}</span>
        <button class="btn btn-secondary btn-sm" ${adminCurrentPage === totalPages ? 'disabled' : ''} onclick="adminChangePage(${adminCurrentPage + 1})">Next →</button>
    `;
}

function adminChangePage(page) {
    adminCurrentPage = page;
    loadAdminProducts();
}

function openAddProductModal() {
    document.getElementById("modalTitle").textContent = "Add New Product";
    document.getElementById("editProductId").value = "";
    document.getElementById("prodDesc").value = "";
    document.getElementById("prodPrice").value = "";
    document.getElementById("prodStock").value = "50";
    document.getElementById("prodImage").value = "";
    document.getElementById("productModal").classList.add("active");
}

function openEditProductModal(prod) {
    document.getElementById("modalTitle").textContent = `Edit Product #${prod.id}`;
    document.getElementById("editProductId").value = prod.id;
    document.getElementById("prodDesc").value = prod.description || prod.product_name;
    document.getElementById("prodCat").value = prod.category || "Mobiles";
    document.getElementById("prodPrice").value = prod.price;
    document.getElementById("prodStock").value = prod.stock;
    document.getElementById("prodImage").value = prod.image_url || "";
    document.getElementById("productModal").classList.add("active");
}

function closeProductModal() {
    document.getElementById("productModal").classList.remove("active");
}

async function saveProductSubmit() {
    const editId = document.getElementById("editProductId").value;
    const desc = document.getElementById("prodDesc").value.trim();
    const category = document.getElementById("prodCat").value;
    const price = parseFloat(document.getElementById("prodPrice").value);
    const stock = parseInt(document.getElementById("prodStock").value);
    const image_url = document.getElementById("prodImage").value.trim();

    const payload = {
        description: desc,
        product_name: desc,
        category: category,
        price: price,
        stock: stock,
        image_url: image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
    };

    try {
        if (editId) {
            await adminApi(`/admin/products/${editId}`, "PUT", payload);
            showAdminToast("Product Updated", `Product #${editId} successfully modified`, "success");
        } else {
            await adminApi("/admin/products", "POST", payload);
            showAdminToast("Product Created", "New product added to catalog", "success");
        }
        closeProductModal();
        await loadAdminProducts();
    } catch (e) {
        showAdminToast("Save Error", e.message, "error");
    }
}

async function deleteProduct(productId) {
    if (!confirm(`Are you sure you want to permanently delete Product #${productId}?`)) return;

    try {
        await adminApi(`/admin/products/${productId}`, "DELETE");
        showAdminToast("Product Deleted", `Product #${productId} removed from database`, "info");
        await loadAdminProducts();
    } catch (e) {
        showAdminToast("Delete Error", e.message, "error");
    }
}