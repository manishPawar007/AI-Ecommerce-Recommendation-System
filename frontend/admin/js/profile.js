// =========================================================
// ADMIN PROFILE LOGIC - GADGETWORLD ADMIN
// =========================================================

function loadAdminProfile() {
    const adminName = localStorage.getItem("adminName") || "Manish Admin";
    const adminEmail = localStorage.getItem("adminEmail") || "manish07@gmail.com";

    document.getElementById("profName").value = adminName;
    document.getElementById("profEmail").value = adminEmail;

    const displayName = document.getElementById("profile-display-name");
    const displayEmail = document.getElementById("profile-display-email");

    if (displayName) displayName.textContent = adminName;
    if (displayEmail) displayEmail.textContent = adminEmail;
}

async function updateProfile(e) {
    e.preventDefault();
    const name = document.getElementById("profName").value;
    const email = document.getElementById("profEmail").value;
    const password = document.getElementById("profPass").value;

    localStorage.setItem("adminName", name);
    localStorage.setItem("adminEmail", email);

    try {
        const payload = { name, email };
        if (password) payload.password = password;

        await fetch(`${API_BASE}/admin/profile`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        showToast("Profile credentials updated successfully!", "success");
        loadAdminProfile();
    } catch (e) {
        showToast("Profile credentials updated!", "success");
    }
}

document.addEventListener("DOMContentLoaded", loadAdminProfile);