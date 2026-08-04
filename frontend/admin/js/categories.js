// =========================================================
// CATEGORIES MANAGEMENT LOGIC - GADGETWORLD ADMIN
// =========================================================

let categoriesList = [];
let categoryModal = null;

async function initCategories() {
    const modalEl = document.getElementById('categoryModal');
    if (modalEl) {
        categoryModal = new bootstrap.Modal(modalEl);
    }
    await loadCategories();
}

async function loadCategories() {
    const grid = document.getElementById("categories-grid");
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/admin/categories`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch categories");

        const resData = await res.json();
        categoriesList = extractArray(resData, "categories");

        renderCategories(categoriesList);
    } catch (e) {
        console.error("Categories Load Error:", e);
        grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">No categories found in database</div>`;
    }
}

function renderCategories(list) {
    const grid = document.getElementById("categories-grid");
    if (!grid) return;

    if (!list || list.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">No categories available</div>`;
        return;
    }

    const icons = ["bi-laptop", "bi-phone", "bi-headphones", "bi-controller", "bi-smartwatch", "bi-plug", "bi-grid-fill"];

    grid.innerHTML = list.map((c, i) => {
        const icon = icons[i % icons.length];
        const name = c.name || c.category_name || "Category";
        const desc = c.description || "Collection of premium electronics";
        const count = c.product_count !== undefined ? c.product_count : (c.products_count || 12);

        return `
            <div class="col-md-6 col-lg-4">
                <div class="glass-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="stat-icon" style="width: 46px; height: 46px; font-size: 1.25rem;">
                                <i class="bi ${icon}"></i>
                            </div>
                            <span class="badge-custom badge-info">${count} Products</span>
                        </div>
                        <h4 class="mb-2">${name}</h4>
                        <p class="text-muted small">${desc}</p>
                    </div>

                    <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-10">
                        <button class="btn btn-sm btn-secondary-glass" onclick="editCategory(${c.id})">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger py-1 px-2" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="deleteCategory(${c.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function openAddCategoryModal() {
    document.getElementById("categoryForm").reset();
    document.getElementById("categoryId").value = "";
    document.getElementById("catModalTitle").textContent = "Add New Category";
    if (categoryModal) categoryModal.show();
}

function editCategory(id) {
    const c = categoriesList.find(item => item.id === id);
    if (!c) return;

    document.getElementById("categoryId").value = c.id;
    document.getElementById("cName").value = c.name || c.category_name || "";
    document.getElementById("cDesc").value = c.description || "";
    document.getElementById("catModalTitle").textContent = "Edit Category #" + c.id;

    if (categoryModal) categoryModal.show();
}

async function saveCategory(event) {
    event.preventDefault();
    const id = document.getElementById("categoryId").value;

    const payload = {
        name: document.getElementById("cName").value,
        description: document.getElementById("cDesc").value
    };

    try {
        const url = id ? `${API_BASE}/admin/categories/${id}` : `${API_BASE}/admin/categories`;
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Save category failed");

        showToast(id ? "Category updated!" : "New category created!", "success");
        if (categoryModal) categoryModal.hide();
        loadCategories();
    } catch (e) {
        showToast("Error saving category to backend", "danger");
    }
}

async function deleteCategory(id) {
    if (!confirm(`Are you sure you want to delete Category #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error("Delete category failed");

        showToast(`Category #${id} deleted`, "success");
        loadCategories();
    } catch (e) {
        showToast("Failed to delete category", "danger");
    }
}

document.addEventListener("DOMContentLoaded", initCategories);