/**
 * ===================================================================
 * GADGETWORLD CART PAGE LOGIC (cart.js)
 * Live PostgreSQL Cart Sync, Quantity Adjusters, Coupon System & Checkout
 * ===================================================================
 */

let cartData = { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
let activeDiscountPercent = 0;
let activeDiscountFixed = 0;

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    await loadCart();
});

function renderUserNav() {
    const userSlot = document.getElementById("userNavSlot");
    if (!userSlot) return;

    const user = getUser();
    if (user) {
        userSlot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <a href="Profile.html" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
                    <span>👤</span> <span>${user.name.split(' ')[0]}</span>
                </a>
                ${user.role === 'admin' ? `
                    <a href="../admin/dashboard.html" class="btn btn-primary btn-sm" style="background: var(--gradient-accent);">
                        👑 Admin
                    </a>
                ` : ''}
            </div>
        `;
    } else {
        userSlot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <a href="Login.html" class="btn btn-primary btn-sm">Sign In</a>
            </div>
        `;
    }
}

async function loadCart() {
    const user = getUser();
    const container = document.getElementById("cartItemsContainer");

    if (!user) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;" class="glass-panel">
                    <div style="font-size: 3.5rem; margin-bottom: 12px;">🛒</div>
                    <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Your Shopping Cart</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Sign in to view your saved bag and checkout seamlessly.</p>
                    <a href="Login.html" class="btn btn-primary">Sign In to Continue 🚀</a>
                </div>
            `;
        }
        return;
    }

    try {
        cartData = await apiRequest(`/cart/?user_id=${user.id}`);
        renderCartUI();
        await syncBadges();

        if (cartData.items && cartData.items.length > 0) {
            const firstProdId = cartData.items[0].product_id;
            loadCartAddons(firstProdId);
        } else {
            loadCartAddons(null);
        }
    } catch (e) {
        console.error("Failed to load cart:", e);
        if (container) {
            container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">Failed to load cart items: ${e.message}</div>`;
        }
    }
}

function renderCartUI() {
    const container = document.getElementById("cartItemsContainer");
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (!container) return;

    const items = cartData.items || [];

    if (items.length === 0) {
        container.innerHTML = `
            <div style="padding: 60px 20px; text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 12px;">🛒</div>
                <h3 style="font-size: 1.4rem; margin-bottom: 8px;">Your Shopping Cart is Empty</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Explore our catalog of AI-recommended tech gadgets and add items to your cart.</p>
                <a href="Products.html" class="btn btn-primary">
                    Start Shopping Now →
                </a>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateSummary(0);
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

    container.innerHTML = items.map(item => {
        const prod = item.product || {};
        const img = prod.image_url || fallbackImg;
        const title = prod.description || prod.product_name || `Product #${item.product_id}`;
        const unitPrice = item.unit_price || prod.price || 0;
        const subtotal = item.subtotal || (unitPrice * item.quantity);

        return `
            <div class="cart-item-row" id="cart-row-${item.id}">
                <img src="${img}" alt="${title}" class="cart-thumb" onerror="this.src='${fallbackImg}'">
                
                <div>
                    <span class="badge badge-category" style="font-size: 0.72rem; margin-bottom: 4px;">${prod.category || 'General'}</span>
                    <h4 style="font-size: 0.98rem; font-weight: 600; color: #FFF; line-height: 1.3; cursor: pointer;" onclick="openQuickView(${item.product_id})">
                        ${title}
                    </h4>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                        Unit Price: ${formatPrice(unitPrice)}
                    </div>
                </div>

                <!-- Quantity Stepper -->
                <div class="qty-stepper">
                    <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="text" class="qty-input" value="${item.quantity}" readonly>
                    <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
                </div>

                <!-- Subtotal -->
                <div style="font-size: 1.1rem; font-weight: 700; color: #FFF; font-family: 'Outfit'; min-width: 100px; text-align: right;">
                    ${formatPrice(subtotal)}
                </div>

                <!-- Remove Button -->
                <button class="btn btn-secondary btn-icon btn-sm" title="Remove Item" style="color: var(--accent-rose);" onclick="removeCartItem(${item.id})">
                    ✕
                </button>
            </div>
        `;
    }).join('');

    updateSummary(cartData.subtotal);
}

async function updateQty(cartId, newQty) {
    if (newQty <= 0) {
        await removeCartItem(cartId);
        return;
    }

    try {
        await apiRequest(`/cart/${cartId}?quantity=${newQty}`, "PUT");
        await loadCart();
        showToast("Cart Updated", "Quantity adjusted", "info");
    } catch (e) {
        showToast("Stock Alert", e.message, "error");
    }
}

async function removeCartItem(cartId) {
    try {
        await apiRequest(`/cart/${cartId}`, "DELETE");
        showToast("Item Removed", "Removed from shopping cart", "info");
        await loadCart();
    } catch (e) {
        showToast("Error", e.message, "error");
    }
}

async function clearFullCart() {
    if (!confirm("Are you sure you want to clear all items in your cart?")) return;
    const user = getUser();
    const userId = user ? user.id : 2;

    try {
        await apiRequest(`/cart/clear/all?user_id=${userId}`, "DELETE");
        showToast("Cart Cleared", "All items removed", "info");
        await loadCart();
    } catch (e) {
        showToast("Error", e.message, "error");
    }
}

function updateSummary(subtotal) {
    const items = cartData.items || [];
    const totalItems = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;

    let discount = 0;
    if (activeDiscountPercent > 0) {
        discount = Math.round(subtotal * (activeDiscountPercent / 100));
    } else if (activeDiscountFixed > 0) {
        discount = Math.min(subtotal, activeDiscountFixed);
    }

    const finalTotal = Math.max(0, subtotal + tax + shipping - discount);

    document.getElementById("summaryItemCount").textContent = totalItems;
    document.getElementById("summarySubtotal").textContent = formatPrice(subtotal);
    document.getElementById("summaryTax").textContent = formatPrice(tax);
    document.getElementById("summaryShipping").textContent = shipping === 0 ? "FREE" : formatPrice(shipping);
    
    const discountRow = document.getElementById("discountRow");
    if (discount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("summaryDiscount").textContent = `-${formatPrice(discount)}`;
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("summaryTotal").textContent = formatPrice(finalTotal);

    // Save calculation in session for checkout
    localStorage.setItem("gw_checkout_subtotal", subtotal);
    localStorage.setItem("gw_checkout_tax", tax);
    localStorage.setItem("gw_checkout_shipping", shipping);
    localStorage.setItem("gw_checkout_discount", discount);
    localStorage.setItem("gw_checkout_total", finalTotal);
}

// -------------------------------------------------------------
// Coupon Codes Validation
// -------------------------------------------------------------
function applyCouponCode() {
    const input = document.getElementById("couponCodeInput");
    const status = document.getElementById("couponStatus");
    if (!input || !status) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
        status.style.color = "var(--accent-rose)";
        status.textContent = "Please enter a valid coupon code.";
        return;
    }

    if (code === "SAVE10") {
        activeDiscountPercent = 10;
        activeDiscountFixed = 0;
        status.style.color = "var(--accent-emerald)";
        status.textContent = "🎉 10% Discount Applied Successfully!";
        showToast("Coupon Applied! 🏷️", "10% off your subtotal", "success");
    } else if (code === "TECH20") {
        activeDiscountPercent = 20;
        activeDiscountFixed = 0;
        status.style.color = "var(--accent-emerald)";
        status.textContent = "🚀 20% Tech Savvy Discount Applied!";
        showToast("Coupon Applied! 🏷️", "20% off your subtotal", "success");
    } else if (code === "WELCOME50") {
        activeDiscountPercent = 0;
        activeDiscountFixed = 500;
        status.style.color = "var(--accent-emerald)";
        status.textContent = "🎁 ₹500 Flat Welcome Discount Applied!";
        showToast("Coupon Applied! 🏷️", "₹500 flat discount applied", "success");
    } else if (code === "FESTIVE100") {
        activeDiscountPercent = 0;
        activeDiscountFixed = 1000;
        status.style.color = "var(--accent-emerald)";
        status.textContent = "✨ ₹1000 Mega Festive Discount Applied!";
        showToast("Coupon Applied! 🏷️", "₹1000 mega discount applied", "success");
    } else {
        status.style.color = "var(--accent-rose)";
        status.textContent = "❌ Invalid or expired coupon code.";
        showToast("Invalid Coupon", "Try code SAVE10 or TECH20", "error");
        return;
    }

    updateSummary(cartData.subtotal);
}

// -------------------------------------------------------------
// Load AI Add-on Cross-Sells
// -------------------------------------------------------------
async function loadCartAddons(productId) {
    const grid = document.getElementById("cartAddonsGrid");
    if (!grid) return;

    try {
        let items = [];
        if (productId) {
            items = await apiRequest(`/recommendations/bought-together?product_id=${productId}&limit=4`);
        } else {
            items = await apiRequest(`/recommendations/trending?limit=4`);
        }

        if (!items || items.length === 0) {
            grid.innerHTML = "";
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
        grid.innerHTML = items.map(p => `
            <div class="product-card" style="padding: 12px;">
                <div style="height: 140px; border-radius: var(--radius-md); overflow: hidden; background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%); margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px;" onclick="openQuickView(${p.id})">
                    <img src="${p.image_url || fallbackImg}" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit: contain;" onerror="this.src='${fallbackImg}'">
                </div>
                <div style="font-size: 0.88rem; font-weight: 600; line-height: 1.3; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.product_name}">
                    ${p.product_name}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
                    <span style="font-weight: 800; color: #FFF; font-family: 'Outfit';">${formatPrice(p.price)}</span>
                    <button class="btn btn-primary btn-sm" onclick="addToCartGlobal(${p.id}, 1, this)">
                        + Add
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("Cart addons error:", e);
    }
}

// -------------------------------------------------------------
// Proceed to Checkout
// -------------------------------------------------------------
function proceedToCheckout() {
    const items = cartData.items || [];
    if (items.length === 0) {
        showToast("Cart Empty", "Add items to your cart first.", "error");
        return;
    }
    window.location.href = "Checkout.html";
}
