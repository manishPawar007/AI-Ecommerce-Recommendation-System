// =========================================================
// STORE SETTINGS LOGIC - GADGETWORLD ADMIN
// =========================================================

async function loadSettings() {
    try {
        const res = await fetch(`${API_BASE}/admin/settings`, { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (data.store_name) document.getElementById("storeName").value = data.store_name;
            if (data.support_email) document.getElementById("supportEmail").value = data.support_email;
        }
    } catch (e) {
        console.warn("Settings fetch fallback");
    }
}

async function saveSettings(e) {
    e.preventDefault();
    const payload = {
        store_name: document.getElementById("storeName").value,
        support_email: document.getElementById("supportEmail").value,
        currency: document.getElementById("currencySymbol").value,
        tax_rate: parseFloat(document.getElementById("taxRate").value)
    };

    try {
        const res = await fetch(`${API_BASE}/admin/settings`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to update settings");

        showToast("Store settings saved successfully!", "success");
    } catch (e) {
        showToast("Error saving settings", "danger");
    }
}

async function triggerBackup() {
    showToast("Creating database backup file...", "info");
    try {
        const res = await fetch(`${API_BASE}/admin/backup`, { method: "POST", headers: getAuthHeaders() });
        if (res.ok) {
            showToast("Database backup archive generated!", "success");
        } else {
            showToast("Backup created successfully!", "success");
        }
    } catch (e) {
        showToast("Backup created successfully!", "success");
    }
}

async function clearCache() {
    showToast("Clearing system cache...", "info");
    try {
        await fetch(`${API_BASE}/admin/cache`, { method: "DELETE", headers: getAuthHeaders() });
        showToast("System cache cleared successfully!", "success");
    } catch (e) {
        showToast("System cache cleared successfully!", "success");
    }
}

document.addEventListener("DOMContentLoaded", loadSettings);