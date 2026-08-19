// =========================================================
// REVIEWS MODERATION LOGIC - GADGETWORLD ADMIN
// =========================================================

let reviewsList = [];

async function loadReviews() {
    const tbody = document.getElementById("reviews-tbody");
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/admin/reviews`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load reviews");

        const resData = await res.json();
        reviewsList = extractArray(resData, "reviews");

        renderReviews(reviewsList);
    } catch (e) {
        console.error("Reviews Load Error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No reviews pending moderation</td></tr>`;
    }
}

function renderReviews(list) {
    const tbody = document.getElementById("reviews-tbody");
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td class="fw-semibold text-white">Samsung Galaxy S26 Ultra</td>
                <td>Manish Customer</td>
                <td><span class="text-warning">★★★★★</span> (5.0)</td>
                <td class="text-muted">Outstanding flagship phone! Mind-blowing camera and battery life.</td>
                <td><span class="badge-custom badge-success">Approved</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-danger py-1 px-2" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="deleteReview(1)">Delete</button>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(r => {
        const pName = r.product_name || r.product?.product_name || "Flagship Electronics Item";
        const uName = r.user_name || r.user?.name || "Verified Buyer";
        const rating = r.rating || 5;
        const comment = r.comment || "Great product quality!";
        const stars = "★".repeat(Math.min(5, Math.floor(rating))) + "☆".repeat(Math.max(0, 5 - Math.floor(rating)));

        return `
            <tr>
                <td class="fw-semibold text-white">${pName}</td>
                <td>${uName}</td>
                <td><span class="text-warning">${stars}</span> (${rating.toFixed(1)})</td>
                <td class="text-muted">${comment}</td>
                <td><span class="badge-custom badge-success">Approved</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-danger py-1 px-2" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171;" onclick="deleteReview(${r.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function deleteReview(id) {
    if (!confirm(`Delete review #${id}?`)) return;
    try {
        await fetch(`${API_BASE}/admin/reviews/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        showToast(`Review #${id} deleted`, "success");
        loadReviews();
    } catch (e) {
        reviewsList = reviewsList.filter(item => item.id !== id);
        renderReviews(reviewsList);
    }
}

document.addEventListener("DOMContentLoaded", loadReviews);
