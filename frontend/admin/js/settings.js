// =============================================
// GadgetWorld Admin Panel
// settings.js
// =============================================

// ================= API =================

const API_BASE = "http://127.0.0.1:8000/api";

const API = {

    settings: `${API_BASE}/admin/settings`,
    uploadLogo: `${API_BASE}/admin/settings/logo`,
    backup: `${API_BASE}/admin/backup`,
    restore: `${API_BASE}/admin/restore`,
    cache: `${API_BASE}/admin/cache`,
    reset: `${API_BASE}/admin/reset`

};

// ================= VARIABLES =================

let settings = {};

// =============================================
// INITIALIZE
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    initializeSettings();

});

async function initializeSettings() {

    showLoader();

    await loadSettings();

    attachEvents();

    hideLoader();

}

// =============================================
// LOAD SETTINGS
// =============================================

async function loadSettings() {

    try {

        const response = await fetch(API.settings);

        if (!response.ok)
            throw new Error("Unable to load settings.");

        settings = await response.json();

        populateForm();

    }

    catch (error) {

        console.error(error);

        showToast("Failed to load settings");

    }

}

// =============================================
// POPULATE FORM
// =============================================

function populateForm() {

    document.getElementById("storeName").value =
        settings.store_name || "";

    document.getElementById("storeEmail").value =
        settings.store_email || "";

    document.getElementById("storePhone").value =
        settings.store_phone || "";

    document.getElementById("storeWebsite").value =
        settings.store_website || "";

    document.getElementById("storeAddress").value =
        settings.store_address || "";

    document.getElementById("currency").value =
        settings.currency || "INR";

    document.getElementById("metaTitle").value =
        settings.meta_title || "";

    document.getElementById("metaDescription").value =
        settings.meta_description || "";

    document.getElementById("metaKeywords").value =
        settings.meta_keywords || "";

    document.getElementById("smtpHost").value =
        settings.smtp_host || "";

    document.getElementById("smtpPort").value =
        settings.smtp_port || "";

    document.getElementById("smtpEncryption").value =
        settings.smtp_encryption || "TLS";

    document.getElementById("smtpUser").value =
        settings.smtp_username || "";

    document.getElementById("smtpPassword").value =
        settings.smtp_password || "";

    document.getElementById("razorpayKey").value =
        settings.razorpay_key || "";

    document.getElementById("razorpaySecret").value =
        settings.razorpay_secret || "";

    document.getElementById("stripeKey").value =
        settings.stripe_key || "";

    document.getElementById("stripeSecret").value =
        settings.stripe_secret || "";

    document.getElementById("codEnabled").checked =
        settings.cod_enabled || false;

    document.getElementById("freeShipping").value =
        settings.free_shipping || 0;

    document.getElementById("shippingFee").value =
        settings.shipping_fee || 0;

    document.getElementById("deliveryDays").value =
        settings.delivery_days || 5;

    document.getElementById("twoFactor").checked =
        settings.two_factor || false;

    document.getElementById("maintenanceMode").checked =
        settings.maintenance_mode || false;

    document.getElementById("allowRegistration").checked =
        settings.allow_registration || true;

    document.getElementById("adminName").value =
        settings.admin_name || "";

    document.getElementById("adminEmail").value =
        settings.admin_email || "";

}

// =============================================
// SAVE SETTINGS
// =============================================

async function saveSettings() {

    const payload = {

        store_name:
            document.getElementById("storeName").value,

        store_email:
            document.getElementById("storeEmail").value,

        store_phone:
            document.getElementById("storePhone").value,

        store_website:
            document.getElementById("storeWebsite").value,

        store_address:
            document.getElementById("storeAddress").value,

        currency:
            document.getElementById("currency").value,

        meta_title:
            document.getElementById("metaTitle").value,

        meta_description:
            document.getElementById("metaDescription").value,

        meta_keywords:
            document.getElementById("metaKeywords").value,

        smtp_host:
            document.getElementById("smtpHost").value,

        smtp_port:
            document.getElementById("smtpPort").value,

        smtp_encryption:
            document.getElementById("smtpEncryption").value,

        smtp_username:
            document.getElementById("smtpUser").value,

        smtp_password:
            document.getElementById("smtpPassword").value,

        razorpay_key:
            document.getElementById("razorpayKey").value,

        razorpay_secret:
            document.getElementById("razorpaySecret").value,

        stripe_key:
            document.getElementById("stripeKey").value,

        stripe_secret:
            document.getElementById("stripeSecret").value,

        cod_enabled:
            document.getElementById("codEnabled").checked,

        free_shipping:
            Number(
                document.getElementById("freeShipping").value
            ),

        shipping_fee:
            Number(
                document.getElementById("shippingFee").value
            ),

        delivery_days:
            Number(
                document.getElementById("deliveryDays").value
            ),

        two_factor:
            document.getElementById("twoFactor").checked,

        maintenance_mode:
            document.getElementById("maintenanceMode").checked,

        allow_registration:
            document.getElementById("allowRegistration").checked,

        admin_name:
            document.getElementById("adminName").value,

        admin_email:
            document.getElementById("adminEmail").value

    };

    try {

        showLoader();

        const response = await fetch(API.settings, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        });

        if (!response.ok)
            throw new Error();

        showToast("Settings Saved Successfully");

    }

    catch {

        showToast("Failed To Save Settings");

    }

    finally {

        hideLoader();

    }

}
// =============================================
// UPLOAD STORE LOGO
// =============================================

async function uploadLogo() {

    const file = document.getElementById("storeLogo").files[0];

    if (!file) {
        showToast("Please select a logo");
        return;
    }

    const formData = new FormData();

    formData.append("logo", file);

    try {

        showLoader();

        const response = await fetch(API.uploadLogo, {

            method: "POST",

            body: formData

        });

        if (!response.ok)
            throw new Error();

        showToast("Logo Uploaded Successfully");

    }

    catch {

        showToast("Logo Upload Failed");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// RESET SETTINGS
// =============================================

function resetSettings() {

    if (!confirm("Reset all unsaved changes?"))
        return;

    populateForm();

    document.getElementById("adminPassword").value = "";

    document.getElementById("confirmPassword").value = "";

    document.getElementById("storeLogo").value = "";

    showToast("Settings Reset");

}

// =============================================
// BACKUP DATABASE
// =============================================

async function backupDatabase() {

    try {

        showLoader();

        const response = await fetch(API.backup, {

            method: "POST"

        });

        if (!response.ok)
            throw new Error();

        showToast("Backup Created Successfully");

    }

    catch {

        showToast("Backup Failed");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// RESTORE DATABASE
// =============================================

async function restoreDatabase() {

    if (!confirm("Restore latest backup?"))
        return;

    try {

        showLoader();

        const response = await fetch(API.restore, {

            method: "POST"

        });

        if (!response.ok)
            throw new Error();

        showToast("Database Restored");

    }

    catch {

        showToast("Restore Failed");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// CLEAR CACHE
// =============================================

async function clearCache() {

    try {

        const response = await fetch(API.cache, {

            method: "DELETE"

        });

        if (!response.ok)
            throw new Error();

        showToast("Cache Cleared");

    }

    catch {

        showToast("Unable To Clear Cache");

    }

}

// =============================================
// FACTORY RESET
// =============================================

async function factoryReset() {

    const answer = prompt(

        "Type RESET to continue"

    );

    if (answer !== "RESET")
        return;

    try {

        showLoader();

        const response = await fetch(API.reset, {

            method: "POST"

        });

        if (!response.ok)
            throw new Error();

        showToast("Factory Reset Completed");

        setTimeout(() => {

            location.reload();

        }, 2000);

    }

    catch {

        showToast("Factory Reset Failed");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// LOADER
// =============================================

function showLoader() {

    document.body.style.cursor = "progress";

}

function hideLoader() {

    document.body.style.cursor = "default";

}

// =============================================
// TOAST
// =============================================

function showToast(message) {

    const toast = document.createElement("div");

    toast.className =
        "alert alert-success position-fixed";

    toast.style.top = "20px";

    toast.style.right = "20px";

    toast.style.zIndex = "9999";

    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

// =============================================
// EVENT LISTENERS
// =============================================

function attachEvents() {

    document
        .getElementById("saveSettings")
        ?.addEventListener(
            "click",
            saveSettings
        );

    document
        .getElementById("resetSettings")
        ?.addEventListener(
            "click",
            resetSettings
        );

    document
        .getElementById("storeLogo")
        ?.addEventListener(
            "change",
            uploadLogo
        );

    document
        .getElementById("backupDatabase")
        ?.addEventListener(
            "click",
            backupDatabase
        );

    document
        .getElementById("restoreDatabase")
        ?.addEventListener(
            "click",
            restoreDatabase
        );

    document
        .getElementById("clearCache")
        ?.addEventListener(
            "click",
            clearCache
        );

    document
        .getElementById("factoryReset")
        ?.addEventListener(
            "click",
            factoryReset
        );

}

// =============================================
// END OF settings.js
// =============================================