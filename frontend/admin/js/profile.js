// =============================================
// GadgetWorld Admin Panel
// profile.js
// =============================================

// ================= API =================

const API_BASE = "http://127.0.0.1:8000/api";

const API = {

    profile: `${API_BASE}/admin/profile`,
    password: `${API_BASE}/admin/profile/password`,
    uploadPhoto: `${API_BASE}/admin/profile/photo`,
    sessions: `${API_BASE}/admin/profile/sessions`,
    logoutAll: `${API_BASE}/admin/profile/logout-all`,
    history: `${API_BASE}/admin/profile/history`,
    notifications: `${API_BASE}/admin/profile/notifications`,
    apiKeys: `${API_BASE}/admin/profile/api-keys`,
    deleteAccount: `${API_BASE}/admin/profile/delete`

};

// =============================================

let profile = {};
let sessions = [];
let loginHistory = [];

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    initialize();

});

async function initialize() {

    showLoader();

    await Promise.all([
        loadProfile(),
        loadSessions(),
        loadHistory(),
        loadApiKeys()
    ]);

    attachEvents();

    hideLoader();

}

// =============================================
// LOAD PROFILE
// =============================================

async function loadProfile() {

    try {

        const response = await fetch(API.profile);

        if (!response.ok)
            throw new Error();

        profile = await response.json();

        renderProfile();

    }

    catch {

        showToast("Unable to load profile");

    }

}

// =============================================
// RENDER PROFILE
// =============================================

function renderProfile() {

    document.getElementById("adminDisplayName").textContent =
        profile.name || "Administrator";

    document.getElementById("fullName").value =
        profile.name || "";

    document.getElementById("email").value =
        profile.email || "";

    document.getElementById("phone").value =
        profile.phone || "";

    document.getElementById("role").value =
        profile.role || "Super Admin";

    document.getElementById("address").value =
        profile.address || "";

    document.getElementById("twoFactor").checked =
        profile.two_factor || false;

    document.getElementById("emailNotification").checked =
        profile.email_notifications || false;

    if (profile.profile_image) {

        document.getElementById("profileImage").src =
            profile.profile_image;

    }

}

// =============================================
// UPDATE PROFILE
// =============================================

async function saveProfile() {

    const payload = {

        name:
            document.getElementById("fullName").value,

        email:
            document.getElementById("email").value,

        phone:
            document.getElementById("phone").value,

        address:
            document.getElementById("address").value,

        two_factor:
            document.getElementById("twoFactor").checked,

        email_notifications:
            document.getElementById("emailNotification").checked

    };

    try {

        showLoader();

        const response = await fetch(API.profile, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        });

        if (!response.ok)
            throw new Error();

        showToast("Profile Updated Successfully");

    }

    catch {

        showToast("Profile Update Failed");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// CHANGE PASSWORD
// =============================================

async function changePassword() {

    const current =
        document.getElementById("currentPassword").value;

    const password =
        document.getElementById("newPassword").value;

    const confirm =
        document.getElementById("confirmPassword").value;

    if (password !== confirm) {

        showToast("Passwords do not match");

        return;

    }

    try {

        const response = await fetch(API.password, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                current_password: current,

                new_password: password

            })

        });

        if (!response.ok)
            throw new Error();

        showToast("Password Changed");

        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

    }

    catch {

        showToast("Unable To Change Password");

    }

}

// =============================================
// UPLOAD PROFILE IMAGE
// =============================================

async function uploadProfileImage() {

    const file =
        document.getElementById("profileUpload").files[0];

    if (!file)
        return;

    const formData = new FormData();

    formData.append("photo", file);

    try {

        const response = await fetch(API.uploadPhoto, {

            method: "POST",

            body: formData

        });

        if (!response.ok)
            throw new Error();

        const result = await response.json();

        document.getElementById("profileImage").src =
            result.image;

        showToast("Profile Photo Updated");

    }

    catch {

        showToast("Upload Failed");

    }

}
// =============================================
// LOAD ACTIVE SESSIONS
// =============================================

async function loadSessions() {

    try {

        const response = await fetch(API.sessions);

        if (!response.ok)
            throw new Error();

        sessions = await response.json();

        renderSessions();

    }

    catch {

        showToast("Unable to load active sessions");

    }

}

function renderSessions() {

    const tbody = document.getElementById("sessionTable");

    tbody.innerHTML = "";

    sessions.forEach(session => {

        tbody.innerHTML += `

        <tr>

            <td>${session.device}</td>

            <td>${session.browser}</td>

            <td>${session.ip}</td>

            <td>${session.location}</td>

            <td>${session.last_active}</td>

            <td>

                <span class="badge bg-success">

                    ${session.status}

                </span>

            </td>

        </tr>

        `;

    });

}

// =============================================
// LOAD LOGIN HISTORY
// =============================================

async function loadHistory() {

    try {

        const response = await fetch(API.history);

        if (!response.ok)
            throw new Error();

        loginHistory = await response.json();

        renderHistory();

    }

    catch {

        showToast("Unable to load login history");

    }

}

function renderHistory() {

    const tbody = document.getElementById("loginHistoryTable");

    tbody.innerHTML = "";

    loginHistory.forEach(item => {

        tbody.innerHTML += `

        <tr>

            <td>${item.date}</td>

            <td>${item.time}</td>

            <td>${item.device}</td>

            <td>${item.browser}</td>

            <td>${item.ip}</td>

            <td>

                <span class="badge bg-primary">

                    ${item.status}

                </span>

            </td>

        </tr>

        `;

    });

}

// =============================================
// LOAD API KEYS
// =============================================

async function loadApiKeys() {

    try {

        const response = await fetch(API.apiKeys);

        if (!response.ok)
            throw new Error();

        const keys = await response.json();

        document.getElementById("publicKey").value =
            keys.public_key || "";

        document.getElementById("secretKey").value =
            keys.secret_key || "";

    }

    catch {

        showToast("Unable to load API keys");

    }

}

// =============================================
// COPY SECRET KEY
// =============================================

function copySecretKey() {

    const key =
        document.getElementById("secretKey").value;

    navigator.clipboard.writeText(key);

    showToast("Secret key copied");

}

// =============================================
// LOGOUT ALL DEVICES
// =============================================

async function logoutAllDevices() {

    if (!confirm("Logout from all devices?"))
        return;

    try {

        const response = await fetch(API.logoutAll, {

            method: "POST"

        });

        if (!response.ok)
            throw new Error();

        showToast("Logged out from all devices");

    }

    catch {

        showToast("Logout failed");

    }

}

// =============================================
// DELETE ACCOUNT
// =============================================

async function deleteAccount() {

    if (!confirm("Delete administrator account permanently?"))
        return;

    try {

        const response = await fetch(API.deleteAccount, {

            method: "DELETE"

        });

        if (!response.ok)
            throw new Error();

        showToast("Account Deleted");

        setTimeout(() => {

            window.location.href = "../login.html";

        }, 1500);

    }

    catch {

        showToast("Delete failed");

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
        .getElementById("saveProfile")
        ?.addEventListener(
            "click",
            saveProfile
        );

    document
        .getElementById("profileUpload")
        ?.addEventListener(
            "change",
            uploadProfileImage
        );

    document
        .getElementById("copySecretKey")
        ?.addEventListener(
            "click",
            copySecretKey
        );

    document
        .getElementById("logoutAll")
        ?.addEventListener(
            "click",
            logoutAllDevices
        );

    document
        .getElementById("confirmDelete")
        ?.addEventListener(
            "click",
            deleteAccount
        );

    document
        .getElementById("newPassword")
        ?.addEventListener(
            "change",
            changePassword
        );

}

// =============================================
// END OF profile.js
// =============================================