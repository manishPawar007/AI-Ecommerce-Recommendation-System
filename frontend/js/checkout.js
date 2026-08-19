/**
 * ===================================================================
 * GADGETWORLD CHECKOUT LOGIC (checkout.js)
 * Live Order Placement, Stock Decrement & PostgreSQL Persistence
 * ===================================================================
 */

let activeCartItems = [];
let finalPayableTotal = 0;

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    prefillUserData();
    await loadCheckoutCart();
});

function renderUserNav() {
    const userSlot = document.getElementById("userNavSlot");
    if (!userSlot) return;

    const user = getUser();
    if (user) {
        userSlot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.9rem; color: var(--text-muted);">Signed in as <strong>${user.name}</strong></span>
            </div>
        `;
    }
}

function prefillUserData() {
    const user = getUser();
    if (user) {
        const nameInput = document.getElementById("custName");
        const emailInput = document.getElementById("custEmail");
        if (nameInput && user.name) nameInput.value = user.name;
        if (emailInput && user.email) emailInput.value = user.email;
    }
}

async function loadCheckoutCart() {
    const user = getUser();
    const userId = user ? user.id : 2;
    const itemsList = document.getElementById("checkoutItemsList");

    try {
        const cartData = await apiRequest(`/cart/?user_id=${userId}`);
        activeCartItems = cartData.items || [];

        if (activeCartItems.length === 0) {
            showToast("Cart Empty", "Please add items to cart before checkout.", "error");
            setTimeout(() => window.location.href = "Cart.html", 1000);
            return;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
        if (itemsList) {
            itemsList.innerHTML = activeCartItems.map(it => {
                const prod = it.product || {};
                return `
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <img src="${prod.image_url || fallbackImg}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;" onerror="this.src='${fallbackImg}'">
                        <div style="flex-grow: 1;">
                            <div style="font-size: 0.86rem; font-weight: 600; color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                                ${prod.description || 'Product'}
                            </div>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">Qty: ${it.quantity} × ${formatPrice(it.unit_price)}</div>
                        </div>
                        <div style="font-weight: 700; font-size: 0.92rem; color: #FFF;">
                            ${formatPrice(it.subtotal)}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Calculations
        const subtotal = Number(localStorage.getItem("gw_checkout_subtotal")) || cartData.subtotal;
        const tax = Number(localStorage.getItem("gw_checkout_tax")) || Math.round(subtotal * 0.18);
        const shipping = Number(localStorage.getItem("gw_checkout_shipping")) || (subtotal >= 999 ? 0 : 99);
        const discount = Number(localStorage.getItem("gw_checkout_discount")) || 0;
        finalPayableTotal = Number(localStorage.getItem("gw_checkout_total")) || (subtotal + tax + shipping - discount);

        document.getElementById("coSubtotal").textContent = formatPrice(subtotal);
        document.getElementById("coTax").textContent = formatPrice(tax);
        document.getElementById("coShipping").textContent = shipping === 0 ? "FREE" : formatPrice(shipping);

        const discRow = document.getElementById("coDiscountRow");
        if (discount > 0) {
            discRow.style.display = "flex";
            document.getElementById("coDiscount").textContent = `-${formatPrice(discount)}`;
        } else {
            discRow.style.display = "none";
        }

        document.getElementById("coTotal").textContent = formatPrice(finalPayableTotal);
    } catch (e) {
        console.error("Checkout load cart error:", e);
    }
}

async function placeFinalOrder() {
    const user = getUser();
    const userId = user ? user.id : 2;

    const name = document.getElementById("custName")?.value.trim();
    const phone = document.getElementById("custPhone")?.value.trim();
    const email = document.getElementById("custEmail")?.value.trim();
    const address = document.getElementById("custAddress")?.value.trim();
    const city = document.getElementById("custCity")?.value.trim();
    const state = document.getElementById("custState")?.value.trim();
    const pin = document.getElementById("custPin")?.value.trim();

    if (!name || !phone || !email || !address || !city || !state || !pin) {
        showToast("Missing Details", "Please fill in all required shipping fields.", "error");
        return;
    }

    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "Cash on Delivery";
    const fullShippingAddress = `${address}, ${city}, ${state} - ${pin} (Contact: ${phone})`;

    const placeBtn = document.getElementById("placeOrderBtn");
    if (placeBtn) {
        placeBtn.disabled = true;
        placeBtn.innerHTML = `<span class="spinner"></span> Processing Order...`;
    }

    try {
        const payload = {
            user_id: userId,
            total_amount: finalPayableTotal,
            shipping_address: fullShippingAddress,
            payment_method: payMethod
        };

        const result = await apiRequest("/orders/", "POST", payload);
        const order = result.order || {};

        // Show celebratory success modal
        document.getElementById("successOrderNum").textContent = order.order_number || `ORD-${order.id}`;
        document.getElementById("successOrderAmount").textContent = formatPrice(order.total_amount || finalPayableTotal);
        
        const modal = document.getElementById("orderSuccessModal");
        if (modal) modal.classList.add("active");

        // Clear session storage
        localStorage.removeItem("gw_checkout_subtotal");
        localStorage.removeItem("gw_checkout_tax");
        localStorage.removeItem("gw_checkout_shipping");
        localStorage.removeItem("gw_checkout_discount");
        localStorage.removeItem("gw_checkout_total");

        showToast("Order Confirmed! 🎉", "Your order has been recorded in PostgreSQL", "success");
        await syncBadges();
    } catch (e) {
        showToast("Order Failed", e.message, "error");
        if (placeBtn) {
            placeBtn.disabled = false;
            placeBtn.innerHTML = `Confirm & Place Order ⚡`;
        }
    }
}
