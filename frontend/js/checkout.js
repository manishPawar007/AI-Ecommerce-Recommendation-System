// =========================================================
// CHECKOUT LOGIC - GADGETWORLD STOREFRONT
// =========================================================

function getCartStorageKey() {
    return typeof getCartKey === "function" ? getCartKey() : "cart";
}

function loadCheckoutPreview() {
    const listEl = document.getElementById("checkout-items-list");
    const key = getCartStorageKey();
    const cart = JSON.parse(localStorage.getItem(key) || "[]");

    if (!cart || cart.length === 0) {
        window.location.href = "Cart.html";
        return;
    }

    let total = 0;

    listEl.innerHTML = cart.map(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        total += itemTotal;
        return `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div>
                    <h6 class="mb-0 text-white small">${item.title}</h6>
                    <span class="text-muted small">Qty: ${item.quantity || 1}</span>
                </div>
                <span class="fw-semibold text-success small">₹${itemTotal.toLocaleString('en-IN')}</span>
            </div>
        `;
    }).join("");

    document.getElementById("checkout-total").textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const savedName = localStorage.getItem("userName") || "";
    if (savedName && document.getElementById("custName")) {
        document.getElementById("custName").value = savedName;
    }
}

async function submitOrder(e) {
    e.preventDefault();

    const key = getCartStorageKey();
    const cart = JSON.parse(localStorage.getItem(key) || "[]");
    if (!cart || cart.length === 0) {
        showToast("Cart is empty!", "warning");
        return;
    }

    const userEmail = (localStorage.getItem("userEmail") || localStorage.getItem("adminEmail") || "guest@gadgetworld.com").toLowerCase().trim();
    const userName = localStorage.getItem("userName") || document.getElementById("custName").value || "Customer";

    const payload = {
        name: userName,
        email: userEmail,
        phone: document.getElementById("custPhone").value,
        address: document.getElementById("custAddress").value,
        city: document.getElementById("custCity").value,
        pincode: document.getElementById("custPincode").value,
        payment_method: document.querySelector('input[name="paymentMethod"]:checked')?.value || "UPI",
        items: cart,
        total: cart.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0)
    };

    showToast("Submitting your order...", "info");

    let createdOrder = null;
    try {
        const apiRes = await postRequest("/orders", payload);
        if (apiRes && (apiRes.id || apiRes.order_number)) {
            createdOrder = apiRes;
        }
    } catch (err) {
        console.warn("Order post API response fallback");
    }

    // Save order strictly for this specific logged-in user
    const orderKey = `userOrders_${userEmail}`;
    let userOrders = JSON.parse(localStorage.getItem(orderKey) || "[]");

    const newOrder = createdOrder ? {
        id: createdOrder.id,
        order_number: createdOrder.order_number || `ORD-${createdOrder.id}`,
        date: createdOrder.created_at || new Date().toISOString(),
        status: createdOrder.status || "Placed",
        user_email: userEmail,
        customer: userName,
        items: cart,
        total: payload.total,
        address: `${payload.address}, ${payload.city}`
    } : {
        id: Math.floor(100000 + Math.random() * 900000),
        order_number: `GW-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(),
        status: "Placed",
        user_email: userEmail,
        customer: userName,
        items: cart,
        total: payload.total,
        address: `${payload.address}, ${payload.city}`
    };

    if (!userOrders.some(o => (o.id && o.id === newOrder.id) || (o.order_number && o.order_number === newOrder.order_number))) {
        userOrders.unshift(newOrder);
        localStorage.setItem(orderKey, JSON.stringify(userOrders));
    }

    // Clear User Cart
    localStorage.removeItem(key);
    updateCartBadge();

    showToast("🎉 Order Placed Successfully!", "success");
    setTimeout(() => {
        window.location.href = "Orders.html";
    }, 1200);
}

document.addEventListener("DOMContentLoaded", loadCheckoutPreview);
