// =============================================
// GadgetWorld Admin Panel
// analytics.js
// =============================================

// ================= API =================

// ================= API =================

const API_BASE = "http://127.0.0.1:8000/api";

const API = {

    overview: `${API_BASE}/admin/analytics/overview`,

    monthlySales: `${API_BASE}/admin/analytics/monthly-sales`,

    categorySales: `${API_BASE}/admin/analytics/category-sales`,

    topProducts: `${API_BASE}/admin/analytics/top-products`,

    orderStatus: `${API_BASE}/admin/analytics/order-status`,

    customerGrowth: `${API_BASE}/admin/analytics/customer-growth`,

    revenueTrend: `${API_BASE}/admin/analytics/revenue-trend`

};

// ================= VARIABLES =================

let analytics = {};

let revenueChart;

let categoryChart;

let countryChart;

let customerChart;

let monthlyChart;

let statusChart;

// =============================================
// INITIALIZE
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    initializeAnalytics();

});

async function initializeAnalytics(){

    showLoader();

    await loadAnalytics();

    attachEvents();

    hideLoader();

}

// =============================================
// LOAD ANALYTICS
// =============================================

async function loadAnalytics(){

    try{

        const response = await fetch(API.overview);

        if(!response.ok)
            throw new Error("Analytics API Error");

        analytics = await response.json();

        updateCards();

        renderRevenueChart();

        renderCategoryChart();

        renderCountryChart();

        renderCustomerChart();

        renderMonthlyChart();

        renderStatusChart();

        renderTopProducts();

        renderReportTable();

    }

    catch(error){

        console.error(error);

        showToast("Unable to load analytics");

    }

}

// =============================================
// KPI CARDS
// =============================================

function updateCards(){

    document.getElementById("totalRevenue").innerHTML =
        `₹${Number(analytics.total_revenue || 0).toLocaleString()}`;

    document.getElementById("totalOrders").innerHTML =
        analytics.total_orders || 0;

    document.getElementById("totalCustomers").innerHTML =
        analytics.total_customers || 0;

    document.getElementById("productsSold").innerHTML =
        analytics.products_sold || 0;

    document.getElementById("todaySales").innerHTML =
        `₹${Number(analytics.today_sales || 0).toLocaleString()}`;

    document.getElementById("weekSales").innerHTML =
        `₹${Number(analytics.week_sales || 0).toLocaleString()}`;

    document.getElementById("monthSales").innerHTML =
        `₹${Number(analytics.month_sales || 0).toLocaleString()}`;

    document.getElementById("avgOrder").innerHTML =
        `₹${Number(analytics.average_order || 0).toFixed(2)}`;

    document.getElementById("revenueGrowth").innerHTML =
        `${analytics.revenue_growth || 0}%`;

    document.getElementById("ordersGrowth").innerHTML =
        `${analytics.orders_growth || 0}%`;

    document.getElementById("customerGrowth").innerHTML =
        `${analytics.customer_growth || 0}%`;

    document.getElementById("productGrowth").innerHTML =
        `${analytics.product_growth || 0}%`;

}

// =============================================
// REVENUE CHART
// =============================================

function renderRevenueChart(){

    const ctx = document
        .getElementById("revenueChart")
        .getContext("2d");

    if(revenueChart)
        revenueChart.destroy();

    revenueChart = new Chart(ctx,{

        type:"line",

        data:{

            labels: analytics.revenue_labels || [],

            datasets:[{

                label:"Revenue",

                data: analytics.revenue_values || [],

                borderWidth:3,

                tension:.35,

                fill:false

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{
                    display:true
                }

            }

        }

    });

}

// =============================================
// CATEGORY CHART
// =============================================

function renderCategoryChart(){

    const ctx = document
        .getElementById("categoryChart")
        .getContext("2d");

    if(categoryChart)
        categoryChart.destroy();

    categoryChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels: analytics.category_labels || [],

            datasets:[{

                label:"Sales",

                data: analytics.category_values || []

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{
                    display:false
                }

            }

        }

    });

}

// =============================================
// COUNTRY CHART
// =============================================

function renderCountryChart(){

    const ctx = document
        .getElementById("countryChart")
        .getContext("2d");

    if(countryChart)
        countryChart.destroy();

    countryChart = new Chart(ctx,{

        type:"pie",

        data:{

            labels: analytics.country_labels || [],

            datasets:[{

                data: analytics.country_values || []

            }]

        },

        options:{

            responsive:true

        }

    });

}

// =============================================
// CUSTOMER GROWTH CHART
// =============================================

function renderCustomerChart(){

    const ctx = document
        .getElementById("customerChart")
        .getContext("2d");

    if(customerChart)
        customerChart.destroy();

    customerChart = new Chart(ctx,{

        type:"line",

        data:{

            labels: analytics.customer_labels || [],

            datasets:[{

                label:"Customers",

                data: analytics.customer_values || [],

                borderWidth:3,

                tension:.3

            }]

        },

        options:{

            responsive:true

        }

    });

}
// =============================================
// MONTHLY SALES TREND
// =============================================

function renderMonthlyChart() {

    const ctx = document
        .getElementById("monthlyChart")
        .getContext("2d");

    if (monthlyChart)
        monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: analytics.month_labels || [],

            datasets: [{

                label: "Monthly Sales",

                data: analytics.month_values || [],

                borderWidth: 3,

                tension: 0.35,

                fill: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

// =============================================
// ORDER STATUS CHART
// =============================================

function renderStatusChart() {

    const ctx = document
        .getElementById("statusChart")
        .getContext("2d");

    if (statusChart)
        statusChart.destroy();

    statusChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: analytics.status_labels || [],

            datasets: [{

                data: analytics.status_values || []

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

// =============================================
// TOP PRODUCTS
// =============================================

function renderTopProducts() {

    const tbody = document.getElementById("topProductsTable");

    tbody.innerHTML = "";

    (analytics.top_products || []).forEach((product, index) => {

        tbody.innerHTML += `

<tr>

<td>${index + 1}</td>

<td>${product.name}</td>

<td>${product.sold}</td>

<td>₹${Number(product.revenue).toLocaleString()}</td>

</tr>

`;

    });

}

// =============================================
// REPORT TABLE
// =============================================

function renderReportTable() {

    const tbody = document.getElementById("analyticsTable");

    tbody.innerHTML = "";

    (analytics.daily_report || []).forEach(day => {

        tbody.innerHTML += `

<tr>

<td>${day.date}</td>

<td>₹${Number(day.revenue).toLocaleString()}</td>

<td>${day.orders}</td>

<td>${day.customers}</td>

<td>${day.products}</td>

<td>₹${Number(day.average_order).toFixed(2)}</td>

</tr>

`;

    });

}

// =============================================
// DATE FILTER
// =============================================

async function applyDateFilter() {

    const from = document.getElementById("fromDate").value;

    const to = document.getElementById("toDate").value;

    try {

        showLoader();

        const response = await fetch(

            `${API.overview}?from=${from}&to=${to}`

        );

        if (!response.ok)
            throw new Error();

        analytics = await response.json();

        updateCards();

        renderRevenueChart();

        renderCategoryChart();

        renderCountryChart();

        renderCustomerChart();

        renderMonthlyChart();

        renderStatusChart();

        renderTopProducts();

        renderReportTable();

        showToast("Analytics Updated");

    }

    catch {

        showToast("Unable to apply filter");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// EXPORT
// =============================================

function exportExcel() {

    showToast("Preparing Excel Report...");

    // Backend endpoint can be integrated here
    // window.open(`${API_BASE}/admin/reports/download`);

}

function exportPDF() {

    showToast("Preparing PDF Report...");

    // Backend endpoint can be integrated here
    // window.open(`${API_BASE}/admin/reports/print`);

}

// =============================================
// REFRESH
// =============================================

async function refreshAnalytics() {

    showLoader();

    await loadAnalytics();

    hideLoader();

    showToast("Analytics Refreshed");

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
        .getElementById("applyFilter")
        ?.addEventListener(
            "click",
            applyDateFilter
        );

    document
        .getElementById("refreshAnalytics")
        ?.addEventListener(
            "click",
            refreshAnalytics
        );

    document
        .getElementById("exportExcel")
        ?.addEventListener(
            "click",
            exportExcel
        );

    document
        .getElementById("exportPDF")
        ?.addEventListener(
            "click",
            exportPDF
        );

    document
        .getElementById("exportTopProducts")
        ?.addEventListener(
            "click",
            exportExcel
        );

}

// =============================================
// END OF analytics.js
// =============================================