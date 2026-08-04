// =========================================================
// UNIVERSAL AMAZON/FLIPKART PRODUCT QUICK VIEW MODAL
// =========================================================

let globalProductModal = null;

function ensureProductModalExists() {
    if (document.getElementById("universalProductModal")) return;

    const modalHTML = `
    <div class="modal fade" id="universalProductModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content" style="background: #0b1329 !important; border: 1px solid rgba(99, 102, 241, 0.3) !important; max-height: 85vh; overflow-y: auto;">
                <div class="modal-header border-bottom border-secondary border-opacity-10 py-3">
                    <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 rounded-pill px-3 py-1.5 fw-bold" id="modal-brand-badge">
                        BRAND
                    </span>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="row g-4 align-items-center">
                        <!-- Image Column -->
                        <div class="col-md-5">
                            <div class="position-relative rounded overflow-hidden border border-secondary border-opacity-20 bg-black bg-opacity-40 p-3 text-center" style="height: 300px; display: flex; align-items: center; justify-content: center;">
                                <img id="modal-img" src="" alt="Product" class="w-100 h-100 rounded" style="object-fit: contain !important;">
                            </div>
                        </div>

                        <!-- Product Specs Column -->
                        <div class="col-md-7">
                            <span id="modal-category" class="text-primary text-uppercase fw-bold extra-small" style="font-size: 0.8rem; letter-spacing: 1.2px;">CATEGORY</span>
                            <h3 id="modal-title" class="text-white mt-1 mb-2 fw-bold" style="font-size: 1.5rem;">Product Title</h3>
                            
                            <!-- Star Ratings -->
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <div class="star-rating">
                                    <i class="bi bi-star-fill"></i>
                                    <i class="bi bi-star-fill"></i>
                                    <i class="bi bi-star-fill"></i>
                                    <i class="bi bi-star-fill"></i>
                                    <i class="bi bi-star-half"></i>
                                </div>
                                <span class="text-warning fw-bold small">4.8</span>
                                <span class="text-slate-300 small" style="color: #cbd5e1;">(1,240 customer ratings)</span>
                            </div>

                            <!-- Price Block -->
                            <div class="d-flex align-items-baseline gap-2 mb-3">
                                <span id="modal-price" class="display-6 fw-bold text-success">₹90,000</span>
                                <span id="modal-mrp" class="mrp-price" style="color: #94a3b8; font-size: 1.1rem; text-decoration: line-through;">₹1,03,500</span>
                                <span id="modal-savings" class="savings-badge">13% OFF</span>
                            </div>

                            <!-- HIGH-VISIBILITY CRYSTAL CLEAR DESCRIPTION -->
                            <div class="p-3 rounded mb-3" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1);">
                                <h6 class="text-primary fw-bold mb-1 small text-uppercase" style="letter-spacing: 0.5px;"><i class="bi bi-card-text me-1"></i> Product Overview</h6>
                                <p id="modal-desc" class="mb-0" style="color: #f1f5f9; font-size: 0.925rem; line-height: 1.6; font-weight: 400;">
                                    Product description loading...
                                </p>
                            </div>

                            <!-- Trust Badges -->
                            <div class="row g-2 mb-3 small" style="color: #e2e8f0; font-weight: 500;">
                                <div class="col-6"><i class="bi bi-truck text-success fs-6 me-1"></i> Free 2-Day Delivery</div>
                                <div class="col-6"><i class="bi bi-shield-check text-primary fs-6 me-1"></i> 1-Year Brand Warranty</div>
                                <div class="col-6"><i class="bi bi-arrow-counterclockwise text-warning fs-6 me-1"></i> 7-Day Replacement</div>
                                <div class="col-6"><i class="bi bi-patch-check text-info fs-6 me-1"></i> 100% Genuine Product</div>
                            </div>

                            <!-- Pincode Checker -->
                            <div class="mb-3">
                                <div class="input-group input-group-sm" style="max-width: 300px;">
                                    <input type="text" id="modal-pincode" class="form-control text-white bg-dark border-secondary" placeholder="Enter Pincode (e.g. 400001)">
                                    <button class="btn btn-secondary-glass" onclick="checkModalPincode()">Check</button>
                                </div>
                                <span id="pincode-status" class="extra-small d-block mt-1" style="font-size: 0.75rem;"></span>
                            </div>

                            <!-- Action Buttons -->
                            <div class="d-flex align-items-center gap-2 pt-2">
                                <button id="modal-btn-cart" class="btn btn-primary-gradient py-2.5 px-4 flex-grow-1 fs-6">
                                    <i class="bi bi-cart-plus me-1"></i> Add to Cart
                                </button>
                                <button id="modal-btn-buy" class="btn btn-buy-now py-2.5 px-4 flex-grow-1 fs-6">
                                    <i class="bi bi-lightning-charge-fill me-1"></i> Buy Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- AI Smart Upsell Upgrade Container -->
                    <div id="modal-upsell-container"></div>

                    <!-- AI Frequently Bought Together Bundle Container -->
                    <div id="modal-bundle-container"></div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    globalProductModal = new bootstrap.Modal(document.getElementById("universalProductModal"));
}

function openProductQuickView(id, name, price, img, category, brand, desc) {
    ensureProductModalExists();

    const fallbackImg = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400";

    const mrp = Math.round(price * 1.15);
    const savings = Math.round(((mrp - price) / mrp) * 100);

    document.getElementById("modal-brand-badge").textContent = (brand || category || "GADGETWORLD").toUpperCase();
    document.getElementById("modal-category").textContent = (category || "ELECTRONICS").toUpperCase();
    document.getElementById("modal-title").textContent = name || "Product Item";
    document.getElementById("modal-price").textContent = `₹${price.toLocaleString('en-IN')}`;
    document.getElementById("modal-mrp").textContent = `₹${mrp.toLocaleString('en-IN')}`;
    document.getElementById("modal-savings").textContent = `${savings}% OFF`;
    
    // Set High Contrast Bright Text Description
    const descEl = document.getElementById("modal-desc");
    descEl.textContent = desc || "High-tech electronics item featuring flagship processing power, crystal clear display quality, and premium build design.";

    const imgEl = document.getElementById("modal-img");
    imgEl.src = img || fallbackImg;
    imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = fallbackImg; };

    // Track Recently Viewed Memory
    if (typeof trackRecentlyViewed === "function") {
        trackRecentlyViewed({ id, product_name: name, price, image_url: img, category, brand, description: desc });
    }

    // Attach Click Handlers
    document.getElementById("modal-btn-cart").onclick = () => {
        addToCart(id, name, price, img);
        globalProductModal.hide();
    };

    document.getElementById("modal-btn-buy").onclick = () => {
        buyNowInstant(id, name, price, img);
        globalProductModal.hide();
    };

    // Load Smart Upsells & Frequently Bought Together Bundle
    if (typeof renderSmartUpsell === "function") {
        renderSmartUpsell(id, "modal-upsell-container");
    }

    if (typeof renderBoughtTogetherBundle === "function") {
        renderBoughtTogetherBundle(id, "modal-bundle-container");
    }

    globalProductModal.show();
}

function checkModalPincode() {
    const pin = document.getElementById("modal-pincode").value.trim();
    const status = document.getElementById("pincode-status");
    if (!pin || pin.length < 6) {
        status.className = "extra-small text-danger d-block mt-1";
        status.textContent = "Please enter a valid 6-digit Pincode.";
        return;
    }
    status.className = "extra-small text-success d-block mt-1";
    status.textContent = `Express 2-Day Delivery available for Pincode ${pin}!`;
}

function buyNowInstant(id, title, price, img) {
    let cart = [{ id, title, price, img, quantity: 1 }];
    const key = typeof getCartKey === "function" ? getCartKey() : "cart";
    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge();
    showToast(`Redirecting to Checkout for "${title.substring(0, 20)}..."`, "info");
    setTimeout(() => {
        window.location.href = "Checkout.html";
    }, 400);
}

document.addEventListener("DOMContentLoaded", ensureProductModalExists);
