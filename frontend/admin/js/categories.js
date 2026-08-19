/**
 * ===================================================================
 * GADGETWORLD ADMIN CATEGORIES LOGIC (categories.js)
 * Full Category CRUD & Live Database Synchronization
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    renderAdminLayout("categories");
    loadAdminCategories();
});

async function loadAdminCategories() {
    const tbody = document.getElementById("adminCategoriesTbody");
    if (!tbody) return;

    try {
        const categories = await adminApi("/admin/categories");

        if (!categories || categories.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No categories configured yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = categories.map(c => `
            <tr>
                <td style="color: var(--text-dim); font-weight: 600;">#${c.id}</td>
                <td><strong style="color: #FFF; font-size: 0.95rem;">${c.name}</strong></td>
                <td style="color: var(--text-muted); max-width: 300px;">${c.description || 'No description provided.'}</td>
                <td style="color: var(--text-dim); font-size: 0.82rem;">${c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick='openEditCategoryModal(${JSON.stringify(c)})'>
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">
                            🗑 Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--accent-rose);">Failed to load categories: ${e.message}</td></tr>`;
    }
}

function openAddCategoryModal() {
    document.getElementById("catModalTitle").textContent = "Add New Category";
    document.getElementById("editCatId").value = "";
    document.getElementById("catNameInput").value = "";
    document.getElementById("catDescInput").value = "";
    document.getElementById("catModal").classList.add("active");
}

function openEditCategoryModal(cat) {
    document.getElementById("catModalTitle").textContent = `Edit Category #${cat.id}`;
    document.getElementById("editCatId").value = cat.id;
    document.getElementById("catNameInput").value = cat.name;
    document.getElementById("catDescInput").value = cat.description || "";
    document.getElementById("catModal").classList.add("active");
}

function closeCatModal() {
    document.getElementById("catModal").classList.remove("active");
}

async function saveCategorySubmit() {
    const editId = document.getElementById("editCatId").value;
    const name = document.getElementById("catNameInput").value.trim();
    const description = document.getElementById("catDescInput").value.trim();

    const payload = { name, description };

    try {
        if (editId) {
            await adminApi(`/admin/categories/${editId}`, "PUT", payload);
            showAdminToast("Category Updated", `Updated category ${name}`, "success");
        } else {
            await adminApi("/admin/categories", "POST", payload);
            showAdminToast("Category Created", `Created category ${name}`, "success");
        }
        closeCatModal();
        await loadAdminCategories();
    } catch (e) {
        showAdminToast("Error", e.message, "error");
    }
}

async function deleteCategory(catId) {
    if (!confirm(`Are you sure you want to delete Category #${catId}?`)) return;

    try {
        await adminApi(`/admin/categories/${catId}`, "DELETE");
        showAdminToast("Category Deleted", "Category removed from directory", "info");
        await loadAdminCategories();
    } catch (e) {
        showAdminToast("Delete Error", e.message, "error");
    }
}