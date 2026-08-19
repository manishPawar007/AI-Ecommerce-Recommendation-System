// =============================================
// GadgetWorld Admin Panel
// inventory.js
// =============================================

// ================= API =================

const API_BASE = "http://127.0.0.1:8000/api";

const API = {

    products: `${API_BASE}/products`,
    categories: `${API_BASE}/admin/categories`,
    inventory: `${API_BASE}/admin/inventory`

};

// ================= Variables =================

let inventory = [];

let filteredInventory = [];

let categories = [];

let currentPage = 1;

const pageSize = 10;

let selectedProduct = null;

// =============================================
// INITIALIZE
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    initializeInventory();

});

async function initializeInventory() {

    showLoader();

    await Promise.all([

        loadInventory(),

        loadCategories()

    ]);

    hideLoader();

    attachEvents();

}

// =============================================
// LOAD INVENTORY
// =============================================

async function loadInventory() {

    try {

        const response = await fetch(API.products);

        if (!response.ok)
            throw new Error("Unable to load inventory.");

        const data = await response.json();

        inventory = Array.isArray(data.inventory)
            ? data.inventory
            : [];

        filteredInventory = [...inventory];

        updateDashboard();

        renderInventory();

        renderPagination();

    }

    catch (error) {

        console.error(error);

        inventory = [];

        filteredInventory = [];

        renderInventory();

    }

}

// =============================================
// LOAD CATEGORIES
// =============================================

async function loadCategories() {

    try {

        const response = await fetch(API.categories);

        if (!response.ok)
            return;

        categories = await response.json();

        const select =

            document.getElementById(

                "categoryFilter"

            );

        select.innerHTML =

            `<option value="">All Categories</option>`;

        categories.forEach(category => {

            select.innerHTML += `

<option value="${category.id}">

${category.name}

</option>

`;

        });

    }

    catch (error) {

        console.log(error);

    }

}

// =============================================
// DASHBOARD
// =============================================

function updateDashboard() {

    document.getElementById("totalProducts").innerHTML =

        inventory.length;

    document.getElementById("inStock").innerHTML =

        inventory.filter(

            product =>

            product.stock > 10

        ).length;

    document.getElementById("lowStock").innerHTML =

        inventory.filter(

            product =>

            product.stock > 0 &&

            product.stock <= 10

        ).length;

    document.getElementById("outOfStock").innerHTML =

        inventory.filter(

            product =>

            product.stock === 0

        ).length;

}

// =============================================
// TABLE
// =============================================

function renderInventory() {

    const tbody =

        document.getElementById(

            "inventoryTable"

        );

    tbody.innerHTML = "";

    if (filteredInventory.length === 0) {

        tbody.innerHTML = `

<tr>

<td colspan="9"

class="text-center p-5">

No Products Found

</td>

</tr>

`;

        return;

    }

    const start =

        (currentPage - 1) * pageSize;

    const end =

        start + pageSize;

    filteredInventory

        .slice(start, end)

        .forEach(product => {

            tbody.innerHTML += `

<tr>

<td>

${product.id}

</td>

<td>

<img

src="${product.image_url || product.image}"

width="60"

height="60"

style="border-radius:8px;object-fit:cover;">

</td>

<td>

${product.product_name || product.name}

</td>

<td>

${product.category || "-"}

</td>

<td>

${product.stock_code || "-"}

</td>

<td>

₹${Number(product.price).toFixed(2)}

</td>

<td>

${product.stock}

</td>

<td>

${stockBadge(product.stock)}

</td>

<td>

<button

class="btn btn-info btn-sm detailsBtn"

data-id="${product.id}">

<i class="bi bi-eye"></i>

</button>

<button

class="btn btn-warning btn-sm stockBtn"

data-id="${product.id}">

<i class="bi bi-pencil-square"></i>

</button>

<button

class="btn btn-secondary btn-sm historyBtn"

data-id="${product.id}">

<i class="bi bi-clock-history"></i>

</button>

<button

class="btn btn-danger btn-sm deleteBtn"

data-id="${product.id}">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`;

        });

}

// =============================================
// STOCK BADGE
// =============================================

function stockBadge(stock) {

    if (stock === 0)

        return `<span class="badge bg-danger">Out of Stock</span>`;

    if (stock <= 10)

        return `<span class="badge bg-warning text-dark">Low Stock</span>`;

    return `<span class="badge bg-success">In Stock</span>`;

}

// =============================================
// PAGINATION
// =============================================

function renderPagination() {

    const pagination =

        document.getElementById(

            "inventoryPagination"

        );

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            filteredInventory.length /

            pageSize

        );

    if (totalPages <= 1)

        return;

    for (

        let page = 1;

        page <= totalPages;

        page++

    ) {

        pagination.innerHTML += `

<li class="page-item ${page===currentPage?"active":""}">

<a

class="page-link"

href="#"

onclick="goToPage(${page})">

${page}

</a>

</li>

`;

    }

}

function goToPage(page) {

    currentPage = page;

    renderInventory();

    renderPagination();

}
// =============================================
// SEARCH & FILTER
// =============================================

function applyFilters() {

    const keyword = document
        .getElementById("searchInventory")
        .value
        .toLowerCase()
        .trim();

    const category =
        document.getElementById("categoryFilter").value;

    const stock =
        document.getElementById("stockFilter").value;

    filteredInventory = inventory.filter(product => {

        const productName =
            (product.product_name || product.name || "")
            .toLowerCase();

        const categoryMatch =

            !category ||

            String(product.category_id || product.category) === category;

        const keywordMatch =

            !keyword ||

            productName.includes(keyword);

        let stockMatch = true;

        switch (stock) {

            case "instock":

                stockMatch = product.stock > 10;

                break;

            case "low":

                stockMatch =
                    product.stock > 0 &&
                    product.stock <= 10;

                break;

            case "out":

                stockMatch =
                    product.stock === 0;

                break;

        }

        return (

            keywordMatch &&
            categoryMatch &&
            stockMatch

        );

    });

    currentPage = 1;

    renderInventory();

    renderPagination();

}

// =============================================
// PRODUCT DETAILS
// =============================================

function showProductDetails(id){

    const product=

        inventory.find(

            p=>p.id===id

        );

    if(!product)
        return;

    document.getElementById("inventoryDetails").innerHTML=`

<div class="row">

<div class="col-md-4 text-center">

<img
src="${product.image_url||product.image}"
class="img-fluid rounded">

</div>

<div class="col-md-8">

<h3>

${product.product_name||product.name}

</h3>

<hr>

<p><strong>Brand :</strong> ${product.brand}</p>

<p><strong>Category :</strong> ${product.category}</p>

<p><strong>SKU :</strong> ${product.stock_code}</p>

<p><strong>Price :</strong> ₹${product.price}</p>

<p><strong>Stock :</strong> ${product.stock}</p>

<p><strong>Rating :</strong> ⭐ ${product.rating}</p>

<p>

<strong>Description :</strong>

${product.description||"-"}

</p>

</div>

</div>

`;

new bootstrap.Modal(

document.getElementById(

"productDetailsModal"

)

).show();

}

// =============================================
// UPDATE STOCK
// =============================================

function openStockModal(id){

selectedProduct=

inventory.find(

p=>p.id===id

);

if(!selectedProduct)
return;

document.getElementById("productId").value=
selectedProduct.id;

document.getElementById("productName").value=
selectedProduct.product_name||selectedProduct.name;

document.getElementById("currentStock").value=
selectedProduct.stock;

document.getElementById("newStock").value=
selectedProduct.stock;

document.getElementById("stockReason").value="";

new bootstrap.Modal(

document.getElementById(

"updateStockModal"

)

).show();

}

async function updateStock(){

const stock=

Number(

document.getElementById("newStock").value

);

const reason=

document.getElementById("stockReason").value;

try{

const response=

await fetch(

`${API.products}/${selectedProduct.id}`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

stock,

reason

})

}

);

if(!response.ok)
throw new Error();

bootstrap.Modal

.getInstance(

document.getElementById(

"updateStockModal"

)

).hide();

showToast(

"Inventory Updated"

);

await loadInventory();

}

catch{

alert(

"Update Failed"

);

}

}

// =============================================
// STOCK HISTORY
// =============================================

function showHistory(id){

const tbody=

document.getElementById(

"historyTable"

);

tbody.innerHTML=`

<tr>

<td colspan="7"

class="text-center">

No Stock History Available

</td>

</tr>

`;

new bootstrap.Modal(

document.getElementById(

"historyModal"

)

).show();

}

// =============================================
// DELETE PRODUCT
// =============================================

async function deleteProduct(id){

if(

!confirm(

"Delete this product?"

)

)

return;

try{

const response=

await fetch(

`${API.products}/${id}`,

{

method:"DELETE"

}

);

if(!response.ok)
throw new Error();

showToast(

"Product Deleted"

);

await loadInventory();

}

catch{

alert(

"Delete Failed"

);

}

}

// =============================================
// IMPORT / EXPORT
// =============================================

function importInventory(){

showToast(

"Import Started"

);

}

function exportExcel(){

showToast(

"Excel Export Started"

);

}

function exportPDF(){

showToast(

"PDF Export Started"

);

}

// =============================================
// REFRESH
// =============================================

async function refreshInventory(){

showLoader();

await loadInventory();

hideLoader();

showToast(

"Inventory Refreshed"

);

}

// =============================================
// LOADER
// =============================================

function showLoader(){

document.body.style.cursor="progress";

}

function hideLoader(){

document.body.style.cursor="default";

}

// =============================================
// TOAST
// =============================================

function showToast(message){

const toast=document.createElement("div");

toast.className=

"alert alert-success position-fixed";

toast.style.top="20px";

toast.style.right="20px";

toast.style.zIndex="9999";

toast.innerHTML=message;

document.body.appendChild(toast);

setTimeout(()=>{

toast.remove();

},3000);

}

// =============================================
// TABLE EVENTS
// =============================================

document.addEventListener(

"click",

function(e){

if(e.target.closest(".detailsBtn")){

showProductDetails(

Number(

e.target.closest(".detailsBtn").dataset.id

)

);

}

if(e.target.closest(".stockBtn")){

openStockModal(

Number(

e.target.closest(".stockBtn").dataset.id

)

);

}

if(e.target.closest(".historyBtn")){

showHistory(

Number(

e.target.closest(".historyBtn").dataset.id

)

);

}

if(e.target.closest(".deleteBtn")){

deleteProduct(

Number(

e.target.closest(".deleteBtn").dataset.id

)

);

}

}

);

// =============================================
// EVENT LISTENERS
// =============================================

function attachEvents(){

document.getElementById("searchBtn")
?.addEventListener("click",applyFilters);

document.getElementById("searchInventory")
?.addEventListener("keyup",applyFilters);

document.getElementById("categoryFilter")
?.addEventListener("change",applyFilters);

document.getElementById("stockFilter")
?.addEventListener("change",applyFilters);

document.getElementById("saveStock")
?.addEventListener("click",updateStock);

document.getElementById("refreshInventory")
?.addEventListener("click",refreshInventory);

document.getElementById("importInventory")
?.addEventListener("click",importInventory);

document.getElementById("exportExcel")
?.addEventListener("click",exportExcel);

document.getElementById("exportPDF")
?.addEventListener("click",exportPDF);

}

// =============================================
// END
// =============================================