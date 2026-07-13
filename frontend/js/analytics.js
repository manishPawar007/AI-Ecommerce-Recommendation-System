// =====================================================
// GadgetWorld Analytics Dashboard
// analytics.js
// Part 1A
// =====================================================

// ================================
// AUTHENTICATION
// ================================

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {

    window.location.href = "Login.html";

}

if (role !== "admin") {

    alert("Access Denied! Admin Login Required.");

    window.location.href = "Home.html";

}

// ================================
// CHART OBJECTS
// ================================

let revenueChart = null;
let comparisonChart = null;
let categoryChart = null;
let monthlyChart = null;

// ================================
// GLOBAL DATA
// ================================

let dashboard = {};
let topProducts = [];
let lowStock = [];
let categorySales = [];
let monthlySales = [];
let recentOrders = [];
let latestUsers = [];

// ================================
// HELPER FUNCTIONS
// ================================

function setValue(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.innerText = value ?? "-";

    }

}

function formatCurrency(amount) {

    return "₹" + Number(amount || 0).toLocaleString("en-IN");

}

function showLoading(button) {

    if (!button) return;

    button.disabled = true;
    button.innerHTML = "Loading Dashboard...";

}

function hideLoading(button) {

    if (!button) return;

    button.disabled = false;
    button.innerHTML = "🔄 Refresh Dashboard";

}

// ================================
// SAFE API CALL
// ================================

async function safeRequest(endpoint, fallback = []) {

    try {

        return await apiRequest(endpoint);

    }

    catch (error) {

        console.warn(
            "API Failed:",
            endpoint,
            error
        );

        return fallback;

    }

}
// =====================================================
// LOAD ANALYTICS DASHBOARD
// Part 1B
// =====================================================

async function loadAnalytics() {

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );

    showLoading(refreshBtn);

    try {

        // ============================
        // FETCH ALL API DATA
        // ============================

        dashboard =
            await safeRequest(
                "/analytics/dashboard",
                {}
            );

        topProducts =
            await safeRequest(
                "/analytics/top-products",
                []
            );

        lowStock =
            await safeRequest(
                "/analytics/low-stock",
                []
            );

        categorySales =
            await safeRequest(
                "/analytics/category-sales",
                []
            );

        monthlySales =
            await safeRequest(
                "/analytics/monthly-sales",
                []
            );

        recentOrders =
            await safeRequest(
                "/analytics/recent-orders",
                []
            );

        latestUsers =
            await safeRequest(
                "/analytics/latest-users",
                []
            );

        // ============================
        // KPI CARDS
        // ============================

        setValue(
            "totalProducts",
            dashboard.total_products || 0
        );

        setValue(
            "totalUsers",
            dashboard.total_users || 0
        );

        setValue(
            "totalOrders",
            dashboard.total_orders || 0
        );

        setValue(
            "totalCart",
            dashboard.total_cart || 0
        );

        setValue(
            "totalRevenue",
            formatCurrency(
                dashboard.total_revenue
            )
        );

        // ============================
        // SALES SUMMARY
        // ============================

        setValue(
            "todaySales",
            formatCurrency(
                dashboard.today_sales
            )
        );

        setValue(
            "weeklySales",
            formatCurrency(
                dashboard.weekly_sales
            )
        );

        setValue(
            "monthlySales",
            formatCurrency(
                dashboard.monthly_sales
            )
        );

        // ============================
        // AI INSIGHTS
        // ============================

        if (topProducts.length > 0) {

            setValue(
                "bestProduct",
                topProducts[0].product
            );

            setValue(
                "bestSellingProduct",
                topProducts[0].product
            );

        }

        if (categorySales.length > 0) {

            setValue(
                "highestCategory",
                categorySales[0].category
            );

            setValue(
                "fastCategory",
                categorySales[0].category
            );

        }

        const averageOrder =

            (dashboard.total_orders || 0) > 0

            ? dashboard.total_revenue /
              dashboard.total_orders

            : 0;

        setValue(
            "avgOrder",
            formatCurrency(
                averageOrder.toFixed(2)
            )
        );

        // ============================
        // INITIALIZE DASHBOARD
        // ============================

        createRevenueChart();

        createComparisonChart();

        createCategoryChart();

        createMonthlyChart();

        loadTopProducts();

        loadLowStock();

        loadRecentOrders();

        loadLatestUsers();

        console.log(
            "✅ GadgetWorld Analytics Loaded Successfully"
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Failed to load Analytics Dashboard."
        );

    }

    finally {

        hideLoading(refreshBtn);

    }

}
// =====================================================
// GadgetWorld Analytics Dashboard
// Part 2 - Charts
// =====================================================

// ================================
// REVENUE CHART
// ================================

function createRevenueChart() {

    const canvas =
        document.getElementById(
            "revenueChart"
        );

    if (!canvas) return;

    if (revenueChart) {

        revenueChart.destroy();

    }

    revenueChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: [

                "Jan","Feb","Mar","Apr",

                "May","Jun","Jul","Aug",

                "Sep","Oct","Nov","Dec"

            ],

            datasets: [

                {

                    label: "Revenue",

                    data:

                        monthlySales.length > 0

                        ? monthlySales.map(

                            item => item.sales

                        )

                        : [

                            12000,18000,25000,

                            32000,45000,52000,

                            60000,71000,82000,

                            91000,105000,

                            dashboard.total_revenue || 0

                        ],

                    borderColor: "#2563eb",

                    backgroundColor:

                        "rgba(37,99,235,.15)",

                    borderWidth: 3,

                    fill: true,

                    tension: .4

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

// ================================
// PRODUCTS VS ORDERS
// ================================

function createComparisonChart() {

    const canvas =
        document.getElementById(
            "comparisonChart"
        );

    if (!canvas) return;

    if (comparisonChart) {

        comparisonChart.destroy();

    }

    comparisonChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "Products",

                "Orders",

                "Users",

                "Cart"

            ],

            datasets: [

                {

                    data: [

                        dashboard.total_products || 0,

                        dashboard.total_orders || 0,

                        dashboard.total_users || 0,

                        dashboard.total_cart || 0

                    ],

                    backgroundColor: [

                        "#2563eb",

                        "#10b981",

                        "#f59e0b",

                        "#ec4899"

                    ]

                }

            ]

        },

        options: {

            responsive: true

        }

    });

}

// ================================
// CATEGORY SALES
// ================================

function createCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );

    if (!canvas) return;

    if (categoryChart) {

        categoryChart.destroy();

    }

    categoryChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels:

                categorySales.map(

                    item => item.category

                ),

            datasets: [

                {

                    label: "Products",

                    data:

                        categorySales.map(

                            item => item.count

                        ),

                    backgroundColor: [

                        "#2563eb",

                        "#10b981",

                        "#f59e0b",

                        "#ef4444",

                        "#8b5cf6",

                        "#06b6d4",

                        "#ec4899",

                        "#14b8a6"

                    ]

                }

            ]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

// ================================
// MONTHLY SALES
// ================================

function createMonthlyChart() {

    const canvas =
        document.getElementById(
            "monthlySalesChart"
        );

    if (!canvas) return;

    if (monthlyChart) {

        monthlyChart.destroy();

    }

    monthlyChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels:

                monthlySales.length > 0

                ? monthlySales.map(

                    item => item.month

                )

                : [

                    "Jan","Feb","Mar",

                    "Apr","May","Jun"

                ],

            datasets: [

                {

                    label: "Monthly Sales",

                    data:

                        monthlySales.length > 0

                        ? monthlySales.map(

                            item => item.sales

                        )

                        : [

                            10000,

                            18000,

                            25000,

                            32000,

                            47000,

                            dashboard.total_revenue || 0

                        ],

                    backgroundColor:

                        "#3b82f6"

                }

            ]

        },

        options: {

            responsive: true

        }

    });

}
// =====================================================
// GadgetWorld Analytics Dashboard
// Part 3 - Tables & Inventory
// =====================================================

// ================================
// TOP PRODUCTS TABLE
// ================================

function loadTopProducts() {

    const table =
        document.getElementById(
            "topProductsTable"
        );

    if (!table) return;

    let html = "";

    if (topProducts.length === 0) {

        html = `
        <tr>
            <td colspan="4">
                No Products Found
            </td>
        </tr>
        `;

    }

    else {

        topProducts.forEach(

            (product,index)=>{

                html += `

                <tr>

                    <td>

                        #${index+1}

                    </td>

                    <td>

                        ${product.product}

                    </td>

                    <td>

                        ${product.category || "-"}

                    </td>

                    <td>

                        ${product.sold}

                    </td>

                </tr>

                `;

            }

        );

    }

    table.innerHTML = html;

}

// ================================
// LOW STOCK TABLE
// ================================

function loadLowStock() {

    const table =
        document.getElementById(
            "lowStockTable"
        );

    if(!table) return;

    let html="";

    if(lowStock.length===0){

        html=`

        <tr>

            <td colspan="2">

                No Low Stock Products

            </td>

        </tr>

        `;

    }

    else{

        lowStock.forEach(product=>{

            html+=`

            <tr>

                <td>

                    ${product.description}

                </td>

                <td>

                    ${product.stock}

                </td>

            </tr>

            `;

        });

    }

    table.innerHTML=html;

}

// ================================
// RECENT ORDERS
// ================================

function loadRecentOrders(){

    const table=

        document.getElementById(

            "recentOrders"

        );

    if(!table) return;

    let html="";

    if(recentOrders.length===0){

        html=`

        <tr>

            <td colspan="5">

                No Orders Found

            </td>

        </tr>

        `;

    }

    else{

        recentOrders.forEach(order=>{

            html+=`

            <tr>

                <td>

                    #${order.id}

                </td>

                <td>

                    ${order.user || "-"}

                </td>

                <td>

                    ${formatCurrency(order.total_amount)}

                </td>

                <td>

                    ${order.status}

                </td>

                <td>

                    ${order.created_at || "-"}

                </td>

            </tr>

            `;

        });

    }

    table.innerHTML=html;

}

// ================================
// LATEST USERS
// ================================

function loadLatestUsers(){

    const table=

        document.getElementById(

            "latestUsers"

        );

    if(!table) return;

    let html="";

    if(latestUsers.length===0){

        html=`

        <tr>

            <td colspan="3">

                No Users Found

            </td>

        </tr>

        `;

    }

    else{

        latestUsers.forEach(user=>{

            html+=`

            <tr>

                <td>

                    ${user.id}

                </td>

                <td>

                    ${user.name}

                </td>

                <td>

                    ${user.email}

                </td>

            </tr>

            `;

        });

    }

    table.innerHTML=html;

}

// ================================
// INVENTORY STATUS
// ================================

function updateInventory(){

    const stock=

        document.getElementById(

            "stockProgress"

        );

    const low=

        document.getElementById(

            "lowStockProgress"

        );

    const out=

        document.getElementById(

            "outStockProgress"

        );

    if(stock){

        stock.value=

            dashboard.in_stock_percent || 80;

    }

    if(low){

        low.value=

            dashboard.low_stock_percent || 15;

    }

    if(out){

        out.value=

            dashboard.out_stock_percent || 5;

    }

}
// =====================================================
// GadgetWorld Analytics Dashboard
// Part 4 - Final
// =====================================================

// ======================================
// EXPORT FUNCTIONS
// ======================================

function downloadPDF(){

    alert(
        "📄 PDF Export will be connected to FastAPI Report API."
    );

}

function downloadExcel(){

    alert(
        "📊 Excel Export will be connected to FastAPI Report API."
    );

}

function downloadCSV(){

    alert(
        "📑 CSV Export will be connected to FastAPI Report API."
    );

}

// ======================================
// REFRESH DASHBOARD
// ======================================

async function refreshDashboard(){

    console.clear();

    console.log(
        "Refreshing Dashboard..."
    );

    await loadAnalytics();

}

// ======================================
// REFRESH BUTTON
// ======================================

const refreshButton =

document.getElementById(
    "refreshBtn"
);

if(refreshButton){

    refreshButton.addEventListener(

        "click",

        refreshDashboard

    );

}

// ======================================
// AUTO REFRESH
// ======================================

const AUTO_REFRESH_TIME =

60000;

setInterval(

    async()=>{

        console.log(

            "Auto Refresh Dashboard"

        );

        await loadAnalytics();

    },

    AUTO_REFRESH_TIME

);

// ======================================
// PAGE LOADER
// ======================================

window.addEventListener(

    "DOMContentLoaded",

    async()=>{

        console.log(

            "Loading GadgetWorld Analytics..."

        );

        await loadAnalytics();

        updateInventory();

    }

);

// ======================================
// SHORTCUT KEY
// CTRL + R
// ======================================

document.addEventListener(

    "keydown",

    function(event){

        if(

            event.ctrlKey &&

            event.key.toLowerCase()=="r"

        ){

            event.preventDefault();

            refreshDashboard();

        }

    }

);

// ======================================
// ONLINE / OFFLINE STATUS
// ======================================

window.addEventListener(

    "offline",

    ()=>{

        alert(

            "⚠ Internet Connection Lost"

        );

    }

);

window.addEventListener(

    "online",

    ()=>{

        console.log(

            "Internet Connected"

        );

        refreshDashboard();

    }

);

// ======================================
// DASHBOARD VERSION
// ======================================

console.log(

    "%cGadgetWorld Analytics Dashboard v2.0",

    "color:#2563eb;font-size:18px;font-weight:bold;"

);

console.log(

    "Dashboard Ready Successfully"

);