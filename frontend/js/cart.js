// =========================================================
// SHOPPING CART LOGIC - GADGETWORLD STOREFRONT
// =========================================================

let appliedDiscount = 0;

function getCartStorageKey() {
    return typeof getCartKey === "function" ? getCartKey() : "cart";
}

function loadCart() {
    const tbody = document.getElementById("cart-tbody");
    const key = getCartStorageKey();
    const cart = JSON.parse(localStorage.getItem(key) || "[]");

    if (!cart || cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-cart-x fs-1 d-block mb-3 text-primary"></i>
                    <h5 class="text-white fw-bold">Your Shopping Cart is Empty</h5>
                    <p class="small mb-3" style="color: #cbd5e1;">Explore our latest flagship electronics catalog and add items to your cart.</p>
                    <a href="Products.html" class="btn btn-sm btn-primary-gradient px-4 py-2">Browse Catalog</a>
                </td>
            </tr>
        `;
        updateCartSummary(0);
        if (typeof renderPersonalizedRecommendations === "function") {
            renderPersonalizedRecommendations("cart-accessories-recommendations");
        }
        return;
    }

    if (typeof renderBoughtTogetherBundle === "function" && cart.length > 0) {
        renderBoughtTogetherBundle(cart[0].id, "cart-accessories-recommendations");
    }

    let subtotal = 0;
    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100";

    tbody.innerHTML = cart.map((item, index) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;
        const img = item.img || fallbackImg;

        return `
            <tr>
                <!-- Column 1: Item Details -->
                <td style="width: 42%;">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${img}" alt="${item.title}" onerror="this.onerror=null; this.src='${fallbackImg}';" style="width: 52px; height: 52px; border-radius: 8px; object-fit: contain; background: #0f172a; padding: 4px; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                        <div>
                            <h6 class="mb-0 text-white fw-bold" style="font-size: 0.95rem;">${item.title}</h6>
                        </div>
                    </div>
                </td>

                <!-- Column 2: Unit Price -->
                <td style="width: 18%;" class="fw-semibold text-white">
                    ₹${(item.price || 0).toLocaleString('en-IN')}
                </td>

                <!-- Column 3: Quantity Controls -->
                <td style="width: 18%;">
                    <div class="input-group input-group-sm" style="width: 110px;">
                        <button class="btn btn-secondary-glass" onclick="updateQty(${index}, -1)">-</button>
                        <input type="text" class="form-control text-center text-white bg-dark border-secondary" value="${item.quantity || 1}" readonly style="background-color: rgba(30, 41, 59, 0.9) !important;">
                        <button class="btn btn-secondary-glass" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </td>

                <!-- Column 4: Subtotal -->
                <td style="width: 14%;" class="fw-bold text-success fs-6">
                    ₹${itemTotal.toLocaleString('en-IN')}
                </td>

                <!-- Column 5: Action (Delete) -->
                <td style="width: 8%; text-align: right;">
                    <button class="btn btn-sm btn-danger py-1.5 px-2.5" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="removeItem(${index})" title="Remove Item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    updateCartSummary(subtotal);
}

function updateQty(index, delta) {
    const key = getCartStorageKey();
    let cart = JSON.parse(localStorage.getItem(key) || "[]");
    if (!cart[index]) return;

    cart[index].quantity = (cart[index].quantity || 1) + delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge();
    loadCart();
}

function removeItem(index) {
    const key = getCartStorageKey();
    let cart = JSON.parse(localStorage.getItem(key) || "[]");
    cart.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge();
    showToast("Item removed from cart", "info");
    loadCart();
}

function updateCartSummary(subtotal) {
    const discountAmount = (subtotal * appliedDiscount) / 100;
    const finalTotal = subtotal - discountAmount;

    document.getElementById("cart-subtotal").textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("cart-discount").textContent = `-₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("cart-total").textContent = `₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

async function applyCoupon() {
    const inputEl = document.getElementById("coupon-input");
    const code = (inputEl?.value || "").trim().toUpperCase();
    if (!code) {
        if (typeof showToast === "function") showToast("Please enter a coupon code", "warning");
        return;
    }

    try {
        if (typeof postRequest === "function") {
            try {
                const data = await postRequest("/cart/apply-coupon", { code });
                if (data && data.discount) {
                    appliedDiscount = data.discount;
                    if (typeof showToast === "function") showToast(`Promo Code ${code} Applied! (${appliedDiscount}% OFF)`, "success");
                    loadCart();
                    return;
                }
            } catch (err) {}
        }
    } catch (e) {}

    // Fallback client-side coupon validation for all seeded coupons
    if (code === "WELCOME10") appliedDiscount = 10;
    else if (code === "SUMMER20" || code === "GADGET20") appliedDiscount = 20;
    else if (code === "FESTIVE15") appliedDiscount = 15;
    else if (code === "GADGET25") appliedDiscount = 25;
    else if (code === "FESTIVE500") appliedDiscount = 15;
    else {
        if (typeof showToast === "function") showToast("Invalid or Expired Coupon Code", "danger");
        return;
    }

    if (typeof showToast === "function") showToast(`Promo Code ${code} Applied! (${appliedDiscount}% OFF)`, "success");
    loadCart();
}

function proceedToCheckout() {
    const key = getCartStorageKey();
    const cart = JSON.parse(localStorage.getItem(key) || "[]");
    if (!cart || cart.length === 0) {
        showToast("Your cart is empty!", "warning");
        return;
    }
    window.location.href = "Checkout.html";
}

document.addEventListener("DOMContentLoaded", loadCart);
