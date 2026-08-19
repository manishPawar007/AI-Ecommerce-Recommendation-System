/**
 * ===================================================================
 * GADGETWORLD CUSTOMER ANALYTICS LOGIC (analytics.js)
 * Chart.js Visualizations, Shopping Habit Analytics & AI Predictions
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
    renderUserNav();
    await loadCustomerAnalytics();
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

async function loadCustomerAnalytics() {
    const user = getUser();
    if (!user) {
        window.location.href = "Login.html";
        return;
    }

    try {
        const [orders, predictions, persona] = await Promise.all([
            apiRequest(`/orders/?user_id=${user.id}`),
            apiRequest(`/recommendations/personalized?user_id=${user.id}&limit=4`),
            apiRequest(`/recommendations/user-persona?user_id=${user.id}`).catch(() => null)
        ]);

        if (persona) {
            const headTitle = document.getElementById("personaHeaderTitle");
            const headIntent = document.getElementById("personaHeaderIntent");
            const headBadge = document.getElementById("personaHeaderBadge");
            const pBrand = document.getElementById("personaBrand");
            const pBudget = document.getElementById("personaBudget");

            if (headTitle) headTitle.textContent = `AI Shopper Persona: ${persona.persona_title || 'Flagship Pro'}`;
            if (headIntent) headIntent.textContent = persona.predicted_intent || 'Curated from your real-time cart and order activity.';
            if (headBadge) headBadge.textContent = persona.persona_badge || '👑 Flagship Power User';
            if (pBrand) pBrand.textContent = persona.primary_brand || 'Apple';
            if (pBudget) pBudget.textContent = formatPrice(persona.average_budget || 50000) + ' Avg.';
        }

        const totalSpent = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const orderCount = (orders || []).length;
        const aov = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

        // Determine category counts
        const catCounts = {};
        (orders || []).forEach(o => {
            (o.items || []).forEach(it => {
                const cat = it.category || "General";
                catCounts[cat] = (catCounts[cat] || 0) + (it.quantity || 1);
            });
        });

        const topCat = Object.keys(catCounts).length > 0 
            ? Object.entries(catCounts).sort((a,b) => b[1] - a[1])[0][0]
            : "Electronics";

        document.getElementById("analyticsTotalSpent").textContent = formatPrice(totalSpent);
        document.getElementById("analyticsOrdersCount").textContent = orderCount;
        document.getElementById("analyticsTopCat").textContent = topCat;
        document.getElementById("analyticsAOV").textContent = formatPrice(aov);

        // Render Charts
        renderSpendChart(orders);
        renderCategoryPieChart(catCounts);

        // Render Predictions
        renderPredictions(predictions);
    } catch (e) {
        console.error("Customer analytics load error:", e);
    }
}

function renderSpendChart(orders) {
    const ctx = document.getElementById("spendChart");
    if (!ctx) return;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    // Sample spending distribution
    const data = [12000, 19000, 8500, 24000, 32000, 18000, 42000, 28000];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Spend (₹)',
                data: data,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#8B5CF6',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94A3B8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94A3B8',
                        callback: val => '₹' + (val / 1000) + 'k'
                    }
                }
            }
        }
    });
}

function renderCategoryPieChart(catCounts) {
    const ctx = document.getElementById("categoryPieChart");
    if (!ctx) return;

    let labels = Object.keys(catCounts);
    let data = Object.values(catCounts);

    if (labels.length === 0) {
        labels = ["Mobiles", "Laptops", "Headphones", "Accessories"];
        data = [45, 25, 20, 10];
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366F1',
                    '#06B6D4',
                    '#10B981',
                    '#F59E0B',
                    '#F43F5E'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94A3B8', padding: 14 }
                }
            }
        }
    });
}

function renderPredictions(items) {
    const grid = document.getElementById("analyticsPredictionsGrid");
    if (!grid) return;

    if (!items || items.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No predictions available.</div>`;
        return;
    }

    const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="product-image-container" onclick="openQuickView(${p.id})" style="cursor: pointer;">
                <img src="${p.image_url || fallbackImg}" alt="${p.product_name}" class="product-image" onerror="this.src='${fallbackImg}'">
                <div class="product-badge-float">
                    <span class="badge badge-ai">🤖 ${p.match_percentage || 98}% Match</span>
                </div>
            </div>

            <div class="product-info">
                <div class="product-category">${p.category || 'General'}</div>
                <h4 class="product-title" title="${p.product_name}" onclick="openQuickView(${p.id})" style="cursor: pointer;">
                    ${p.product_name}
                </h4>

                <div class="product-meta">
                    <div class="product-price">${formatPrice(p.price)}</div>
                    <div class="product-rating">⭐ ${p.rating || 4.5}</div>
                </div>

                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="addToCartGlobal(${p.id}, 1, this)">
                        <span>🛒</span> Add to Cart
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openQuickView(${p.id})" title="Quick View">
                        👁️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}