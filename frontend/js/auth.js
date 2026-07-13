// =====================================================
// GadgetWorld Authentication
// auth.js
// =====================================================

// ======================================
// SAVE LOGIN
// ======================================

function saveLogin(data) {

    localStorage.setItem(
        "token",
        data.access_token
    );

    localStorage.setItem(
        "user_id",
        data.id
    );

    localStorage.setItem(
        "user",
        data.name
    );

    localStorage.setItem(
        "email",
        data.email
    );

    localStorage.setItem(
        "role",
        data.role || "user"
    );

}

// ======================================
// GETTERS
// ======================================

function getToken() {

    return localStorage.getItem(
        "token"
    );

}

function getUserId() {

    return localStorage.getItem(
        "user_id"
    );

}

function getUserName() {

    return localStorage.getItem(
        "user"
    );

}

function getEmail() {

    return localStorage.getItem(
        "email"
    );

}

function getRole() {

    return localStorage.getItem(
        "role"
    );

}

// ======================================
// LOGIN STATUS
// ======================================

function isLoggedIn() {

    return !!getToken();

}

function isAdmin() {

    return getRole() === "admin";

}

// ======================================
// PAGE PROTECTION
// ======================================

function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href =
            "Login.html";

    }

}

function requireAdmin() {

    requireLogin();

    if (!isAdmin()) {

        alert(
            "Admin Access Only"
        );

        window.location.href =
            "Home.html";

    }

}

// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user_id"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "email"
    );

    localStorage.removeItem(
        "role"
    );

    localStorage.removeItem(
        "buy_product"
    );

    localStorage.removeItem(
        "total"
    );

    window.location.href =
        "Login.html";

}

// ======================================
// REMEMBER EMAIL
// ======================================

function rememberEmail(email) {

    localStorage.setItem(
        "remember_email",
        email
    );

}

function getRememberedEmail() {

    return localStorage.getItem(
        "remember_email"
    );

}

function clearRememberedEmail() {

    localStorage.removeItem(
        "remember_email"
    );

}

// ======================================
// PROFILE
// ======================================

function getCurrentUser() {

    return {

        id: getUserId(),

        name: getUserName(),

        email: getEmail(),

        role: getRole()

    };

}

// ======================================
// SESSION CHECK
// ======================================

window.addEventListener(

    "load",

    function () {

        console.log(

            "✅ GadgetWorld Authentication Loaded"

        );

    }

);