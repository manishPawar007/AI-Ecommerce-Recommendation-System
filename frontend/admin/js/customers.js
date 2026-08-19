// =============================================
// GadgetWorld Admin Panel
// customers.js
// =============================================

// ================= API =================

const API_BASE = "http://127.0.0.1:8000/api";

const API = {

    customers: `${API_BASE}/admin/customers`,
    orders: `${API_BASE}/admin/orders`

};

// ================= Variables =================

let customers = [];

let filteredCustomers = [];

let editingCustomerId = null;

let currentPage = 1;

const pageSize = 10;

// =============================================
// INITIALIZE
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    initializeCustomers();

});

async function initializeCustomers() {

    showLoader();

    await loadCustomers();

    hideLoader();

    attachEvents();

}

// =============================================
// LOAD CUSTOMERS
// =============================================

async function loadCustomers() {

    try {

        const response = await fetch(API.customers);

        if (!response.ok)
            throw new Error("Unable to load customers.");

        const data = await response.json();

        customers = Array.isArray(data.customers)
            ? data.customers
            : [];

        filteredCustomers = [...customers];

        updateStatistics();

        renderCustomers();

        renderPagination();

    }

    catch (error) {

        console.error(error);

        customers = [];

        filteredCustomers = [];

        renderCustomers();

    }

}

// =============================================
// DASHBOARD CARDS
// =============================================

function updateStatistics() {

    document.getElementById("customerCount").innerHTML =
        customers.length;

    document.getElementById("activeCustomers").innerHTML =

        customers.filter(

            user => user.status === "Active"

        ).length;

    document.getElementById("newCustomers").innerHTML =

        customers.filter(user => {

            if (!user.created_at)
                return false;

            const today =

                new Date().toDateString();

            return (

                new Date(user.created_at)

                .toDateString() === today

            );

        }).length;

    document.getElementById("premiumCustomers").innerHTML =

        customers.filter(

            user =>

            user.role === "Premium"

        ).length;

}

// =============================================
// TABLE
// =============================================

function renderCustomers() {

    const tbody =

        document.getElementById(

            "customerTable"

        );

    tbody.innerHTML = "";

    if (filteredCustomers.length === 0) {

        tbody.innerHTML = `

<tr>

<td colspan="10"
class="text-center p-5">

No Customers Found

</td>

</tr>

`;

        return;

    }

    const start =

        (currentPage - 1) * pageSize;

    const end =

        start + pageSize;

    filteredCustomers

        .slice(start, end)

        .forEach(customer => {

            tbody.innerHTML += `

<tr>

<td>

${customer.id}

</td>

<td>

<img
src="${customer.avatar || 'assets/user.png'}"
width="45"
height="45"
style="border-radius:50%;object-fit:cover;">

</td>

<td>

${customer.name}

</td>

<td>

${customer.email}

</td>

<td>

${customer.phone || "-"}

</td>

<td>

${customer.total_orders || 0}

</td>

<td>

₹${customer.total_spent || 0}

</td>

<td>

${statusBadge(customer.status)}

</td>

<td>

${roleBadge(customer.role)}

</td>

<td>

<button
class="btn btn-info btn-sm viewBtn"
data-id="${customer.id}">

<i class="bi bi-eye"></i>

</button>

<button
class="btn btn-primary btn-sm editBtn"
data-id="${customer.id}">

<i class="bi bi-pencil"></i>

</button>

<button
class="btn btn-danger btn-sm deleteBtn"
data-id="${customer.id}">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`;

        });

}

// =============================================
// BADGES
// =============================================

function statusBadge(status) {

    switch (status) {

        case "Active":

            return `

<span class="badge bg-success">

Active

</span>

`;

        case "Inactive":

            return `

<span class="badge bg-secondary">

Inactive

</span>

`;

        case "Blocked":

            return `

<span class="badge bg-danger">

Blocked

</span>

`;

        default:

            return `

<span class="badge bg-warning">

Unknown

</span>

`;

    }

}

function roleBadge(role) {

    switch (role) {

        case "Admin":

            return `

<span class="badge bg-danger">

Admin

</span>

`;

        case "Premium":

            return `

<span class="badge bg-warning text-dark">

Premium

</span>

`;

        default:

            return `

<span class="badge bg-primary">

Customer

</span>

`;

    }

}

// =============================================
// PAGINATION
// =============================================

function renderPagination() {

    const pagination =

        document.getElementById(

            "customerPagination"

        );

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            filteredCustomers.length /

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
href="#"
class="page-link"
onclick="goToPage(${page})">

${page}

</a>

</li>

`;

    }

}

function goToPage(page){

    currentPage = page;

    renderCustomers();

    renderPagination();

}
// =============================================
// SEARCH & FILTER
// =============================================

function applyFilters() {

    const keyword = document
        .getElementById("searchCustomer")
        .value
        .toLowerCase()
        .trim();

    const status =
        document.getElementById("statusFilter").value;

    const role =
        document.getElementById("roleFilter").value;

    filteredCustomers = customers.filter(customer => {

        const matchKeyword =

            !keyword ||

            customer.name.toLowerCase().includes(keyword) ||

            customer.email.toLowerCase().includes(keyword);

        const matchStatus =

            !status ||

            customer.status === status;

        const matchRole =

            !role ||

            customer.role === role;

        return (

            matchKeyword &&

            matchStatus &&

            matchRole

        );

    });

    currentPage = 1;

    renderCustomers();

    renderPagination();

}

// =============================================
// VIEW CUSTOMER
// =============================================

function viewCustomer(id){

    const customer =

        customers.find(

            c=>c.id===id

        );

    if(!customer)
        return;

    document.getElementById("customerAvatar").src =
        customer.avatar || "assets/user.png";

    document.getElementById("customerName").innerHTML =
        customer.name;

    document.getElementById("customerEmail").innerHTML =
        customer.email;

    document.getElementById("customerPhone").innerHTML =
        customer.phone || "-";

    document.getElementById("customerCountry").innerHTML =
        customer.country || "-";

    document.getElementById("customerOrders").innerHTML =
        customer.total_orders || 0;

    document.getElementById("customerSpent").innerHTML =
        "₹" + (customer.total_spent || 0);

    document.getElementById("customerStatus").innerHTML =
        customer.status;

    new bootstrap.Modal(

        document.getElementById(

            "viewCustomerModal"

        )

    ).show();

}

// =============================================
// EDIT CUSTOMER
// =============================================

function openEditCustomer(id){

    const customer =

        customers.find(

            c=>c.id===id

        );

    if(!customer)
        return;

    editingCustomerId = id;

    document.getElementById("editCustomerId").value =
        customer.id;

    document.getElementById("editCustomerName").value =
        customer.name;

    document.getElementById("editCustomerEmail").value =
        customer.email;

    document.getElementById("editCustomerPhone").value =
        customer.phone || "";

    document.getElementById("editCustomerStatus").value =
        customer.status;

    document.getElementById("editCustomerRole").value =
        customer.role;

    new bootstrap.Modal(

        document.getElementById(

            "editCustomerModal"

        )

    ).show();

}

async function updateCustomer(){

    if(!editingCustomerId)
        return;

    const payload={

        name:
        document.getElementById("editCustomerName").value,

        email:
        document.getElementById("editCustomerEmail").value,

        phone:
        document.getElementById("editCustomerPhone").value,

        status:
        document.getElementById("editCustomerStatus").value,

        role:
        document.getElementById("editCustomerRole").value

    };

    try{

        const response=await fetch(

            `${API.customers}/${editingCustomerId}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify(payload)

            }

        );

        if(!response.ok)
            throw new Error();

        bootstrap.Modal

        .getInstance(

            document.getElementById(

                "editCustomerModal"

            )

        ).hide();

        showToast(

            "Customer Updated"

        );

        await loadCustomers();

    }

    catch{

        alert(

            "Update Failed"

        );

    }

}

// =============================================
// DELETE CUSTOMER
// =============================================

async function deleteCustomer(id){

    if(

        !confirm(

            "Delete this customer?"

        )

    )

        return;

    try{

        const response=await fetch(

            `${API.customers}/${id}`,

            {

                method:"DELETE"

            }

        );

        if(!response.ok)
            throw new Error();

        showToast(

            "Customer Deleted"

        );

        await loadCustomers();

    }

    catch{

        alert(

            "Delete Failed"

        );

    }

}

// =============================================
// EXPORT
// =============================================

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

async function refreshCustomers(){

    showLoader();

    await loadCustomers();

    hideLoader();

    showToast(

        "Customers Refreshed"

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

        if(

            e.target.closest(".viewBtn")

        ){

            viewCustomer(

                Number(

                    e.target.closest(".viewBtn").dataset.id

                )

            );

        }

        if(

            e.target.closest(".editBtn")

        ){

            openEditCustomer(

                Number(

                    e.target.closest(".editBtn").dataset.id

                )

            );

        }

        if(

            e.target.closest(".deleteBtn")

        ){

            deleteCustomer(

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

    document

    .getElementById("searchBtn")

    ?.addEventListener(

        "click",

        applyFilters

    );

    document

    .getElementById("searchCustomer")

    ?.addEventListener(

        "keyup",

        applyFilters

    );

    document

    .getElementById("statusFilter")

    ?.addEventListener(

        "change",

        applyFilters

    );

    document

    .getElementById("roleFilter")

    ?.addEventListener(

        "change",

        applyFilters

    );

    document

    .getElementById("updateCustomer")

    ?.addEventListener(

        "click",

        updateCustomer

    );

    document

    .getElementById("refreshCustomers")

    ?.addEventListener(

        "click",

        refreshCustomers

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

}

// =============================================
// END
// =============================================