// =========================================================
// PRODUCTS MANAGEMENT & CRUD LOGIC - GADGETWORLD ADMIN
// =========================================================

let allProducts = [];
let allCategories = [];
let productModal = null;

async function initProducts() {
    const modalEl = document.getElementById('productModal');
    if (modalEl) {
        productModal = new bootstrap.Modal(modalEl);
    }
    await Promise.all([loadCategories(), loadProducts()]);
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/admin/categories`, { headers: getAuthHeaders() });
        if (res.ok) {
            const resData = await res.json();
            allCategories = extractArray(resData, "categories");
            populateCategoryDropdowns();
        }
    } catch (e) {
        console.warn("Failed to load categories", e);
    }
}

function populateCategoryDropdowns() {
    const filterSelect = document.getElementById("category-filter");
    const formSelect = document.getElementById("pCategory");
    
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="">All Categories</option>` + 
            allCategories.map(c => `<option value="${c.name || c.category_name}">${c.name || c.category_name}</option>`).join("");
    }
    
    if (formSelect) {
        formSelect.innerHTML = allCategories.map(c => `<option value="${c.name || c.category_name}">${c.name || c.category_name}</option>`).join("");
    }
}

async function loadProducts() {
    const tbody = document.getElementById("products-tbody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/admin/products`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch products");
        
        const resData = await res.json();
        allProducts = extractArray(resData, "products");
        
        renderProducts(allProducts);
    } catch (e) {
        console.error("Products Load Error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No products found in database</td></tr>`;
    }
}

function renderProducts(products) {
    const tbody = document.getElementById("products-tbody");
    if (!tbody) return;

    const countEl = document.getElementById("product-count");
    if (countEl) countEl.textContent = products.length;

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No products found matching criteria</td></tr>`;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100";

    tbody.innerHTML = products.map(p => {
        const name = p.product_name || p.title || p.description || "Unnamed Product";
        const cat = p.category || "General";
        const price = (p.price || 0).toLocaleString('en-IN');
        const stock = p.stock || 0;
        const img = p.image_url || fallbackImg;

        let stockBadge = `<span class="badge-custom badge-success">${stock} in stock</span>`;
        if (stock === 0) stockBadge = `<span class="badge-custom badge-danger">Out of stock</span>`;
        else if (stock <= 10) stockBadge = `<span class="badge-custom badge-warning">Low: ${stock}</span>`;

        return `
            <tr>
                <td>
                    <img src="${img}" alt="${name}" onerror="this.onerror=null; this.src='${fallbackImg}';" style="width: 44px; height: 44px; border-radius: 8px; object-fit: contain; background: #0f172a; padding: 2px; border: 1px solid rgba(255,255,255,0.1);">
                </td>
                <td class="fw-semibold text-white">
                    ${name.length > 45 ? name.substring(0, 45) + "..." : name}
                </td>
                <td><span class="badge-custom badge-info">${cat}</span></td>
                <td class="fw-bold text-success">₹${price}</td>
                <td>${stockBadge}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-secondary-glass me-1" onclick="editProduct(${p.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-danger py-1 px-2" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="deleteProduct(${p.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function filterProducts() {
    const query = (document.getElementById("product-search")?.value || "").toLowerCase();
    const cat = document.getElementById("category-filter")?.value || "";
    const stock = document.getElementById("stock-filter")?.value || "";

    const filtered = allProducts.filter(p => {
        const name = (p.product_name || p.title || p.description || "").toLowerCase();
        const matchesQuery = name.includes(query);
        const matchesCat = !cat || (p.category === cat);
        
        let matchesStock = true;
        if (stock === "in_stock") matchesStock = p.stock > 10;
        else if (stock === "low_stock") matchesStock = p.stock > 0 && p.stock <= 10;
        else if (stock === "out_of_stock") matchesStock = p.stock === 0;

        return matchesQuery && matchesCat && matchesStock;
    });

    renderProducts(filtered);
}

function openAddProductModal() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("modalTitle").textContent = "Add New Product";
    if (productModal) productModal.show();
}

function editProduct(id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    document.getElementById("productId").value = p.id;
    document.getElementById("pTitle").value = p.product_name || p.title || p.description || "";
    document.getElementById("pCategory").value = p.category || "";
    document.getElementById("pPrice").value = p.price || 0;
    document.getElementById("pStock").value = p.stock || 0;
    document.getElementById("pImage").value = p.image_url || "";
    document.getElementById("pDesc").value = p.description || "";
    document.getElementById("modalTitle").textContent = "Edit Product #" + p.id;

    if (productModal) productModal.show();
}

async function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById("productId").value;
    
    const payload = {
        product_name: document.getElementById("pTitle").value,
        description: document.getElementById("pDesc").value || document.getElementById("pTitle").value,
        category: document.getElementById("pCategory").value,
        price: parseFloat(document.getElementById("pPrice").value),
        stock: parseInt(document.getElementById("pStock").value),
        image_url: document.getElementById("pImage").value || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300"
    };

    try {
        const url = id ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save product");
        
        showToast(id ? "Product updated successfully!" : "New product created successfully!", "success");
        if (productModal) productModal.hide();
        loadProducts();
    } catch (e) {
        showToast("Error saving product to backend", "danger");
    }
}

async function deleteProduct(id) {
    if (!confirm(`Are you sure you want to delete Product #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/admin/products/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error("Delete failed");
        
        showToast(`Product #${id} deleted`, "success");
        loadProducts();
    } catch (e) {
        showToast("Failed to delete product", "danger");
    }
}

document.addEventListener("DOMContentLoaded", initProducts);