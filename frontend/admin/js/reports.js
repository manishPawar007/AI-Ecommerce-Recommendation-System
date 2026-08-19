// =============================================
// GadgetWorld Admin Panel
// reports.js
// =============================================

// ================= API =================

const API_BASE = "http://127.0.0.1:8000/api";

const API = {

    reports: `${API_BASE}/admin/reports`,
    analytics: `${API_BASE}/admin/analytics`

};

// ================= VARIABLES =================

let reports = [];

let filteredReports = [];

let currentPage = 1;

const pageSize = 10;

let selectedReport = null;

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    initializeReports();

});

async function initializeReports() {

    showLoader();

    await loadReports();

    attachEvents();

    hideLoader();

}

// =============================================
// LOAD REPORTS
// =============================================

async function loadReports() {

    try {

        const response = await fetch(API.reports);

        if (!response.ok)
            throw new Error("Failed to load reports.");

        reports = await response.json();

        filteredReports = [...reports];

        updateSummaryCards();

        renderReports();

        renderPagination();

    }

    catch (error) {

        console.error(error);

        showToast("Unable to load reports");

    }

}

// =============================================
// SUMMARY CARDS
// =============================================

function updateSummaryCards() {

    const revenue = reports.reduce(

        (sum, report) =>

            sum + Number(report.revenue || 0),

        0

    );

    const orders = reports.reduce(

        (sum, report) =>

            sum + Number(report.orders || 0),

        0

    );

    const customers = reports.reduce(

        (sum, report) =>

            sum + Number(report.customers || 0),

        0

    );

    const products = reports.reduce(

        (sum, report) =>

            sum + Number(report.products || 0),

        0

    );

    document.getElementById("reportRevenue").innerHTML =
        `₹${revenue.toLocaleString()}`;

    document.getElementById("reportOrders").innerHTML =
        orders;

    document.getElementById("reportCustomers").innerHTML =
        customers;

    document.getElementById("reportProducts").innerHTML =
        products;

}

// =============================================
// REPORT TABLE
// =============================================

function renderReports() {

    const tbody =

        document.getElementById("reportsTable");

    tbody.innerHTML = "";

    if (filteredReports.length === 0) {

        tbody.innerHTML = `

<tr>

<td colspan="7"

class="text-center p-5">

No Reports Found

</td>

</tr>

`;

        return;

    }

    const start =

        (currentPage - 1) * pageSize;

    const end =

        start + pageSize;

    filteredReports

        .slice(start, end)

        .forEach(report => {

            tbody.innerHTML += `

<tr>

<td>

${report.id}

</td>

<td>

${report.name}

</td>

<td>

${report.type}

</td>

<td>

${report.created_by}

</td>

<td>

${formatDate(report.created_at)}

</td>

<td>

${statusBadge(report.status)}

</td>

<td>

<button

class="btn btn-primary btn-sm previewBtn"

data-id="${report.id}">

<i class="bi bi-eye"></i>

</button>

<button

class="btn btn-info btn-sm detailBtn"

data-id="${report.id}">

<i class="bi bi-info-circle"></i>

</button>

<button

class="btn btn-success btn-sm downloadBtn"

data-id="${report.id}">

<i class="bi bi-download"></i>

</button>

<button

class="btn btn-danger btn-sm deleteBtn"

data-id="${report.id}">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`;

        });

}

// =============================================
// STATUS BADGE
// =============================================

function statusBadge(status) {

    switch (status) {

        case "Completed":

            return `<span class="badge bg-success">Completed</span>`;

        case "Generating":

            return `<span class="badge bg-warning text-dark">Generating</span>`;

        case "Failed":

            return `<span class="badge bg-danger">Failed</span>`;

        default:

            return `<span class="badge bg-secondary">${status}</span>`;

    }

}

// =============================================
// PAGINATION
// =============================================

function renderPagination() {

    const pagination =

        document.getElementById(

            "reportsPagination"

        );

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            filteredReports.length /

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

    renderReports();

    renderPagination();

}

// =============================================
// HELPERS
// =============================================

function formatDate(date) {

    if (!date)
        return "-";

    return new Date(date)

        .toLocaleDateString();

}
// =============================================
// FILTER REPORTS
// =============================================

function applyFilters() {

    const reportType =
        document.getElementById("reportType").value;

    const status =
        document.getElementById("statusFilter").value;

    filteredReports = reports.filter(report => {

        const matchType =
            !reportType ||
            report.type.toLowerCase() === reportType.toLowerCase();

        const matchStatus =
            !status ||
            report.status === status;

        return matchType && matchStatus;

    });

    currentPage = 1;

    renderReports();

    renderPagination();

}

// =============================================
// GENERATE REPORT
// =============================================

async function generateReport() {

    const from =
        document.getElementById("fromDate").value;

    const to =
        document.getElementById("toDate").value;

    const type =
        document.getElementById("reportType").value;

    try {

        showLoader();

        const response = await fetch(

            API.reports,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    from_date: from,

                    to_date: to,

                    report_type: type

                })

            }

        );

        if (!response.ok)
            throw new Error();

        showToast("Report Generated");

        await loadReports();

    }

    catch {

        showToast("Generation Failed");

    }

    finally {

        hideLoader();

    }

}

// =============================================
// REPORT PREVIEW
// =============================================

function previewReport(id) {

    selectedReport =
        reports.find(r => r.id === id);

    if (!selectedReport)
        return;

    document.getElementById("reportPreview").innerHTML = `

<h4>${selectedReport.name}</h4>

<hr>

<p>

<b>Type :</b>

${selectedReport.type}

</p>

<p>

<b>Generated By :</b>

${selectedReport.created_by}

</p>

<p>

<b>Date :</b>

${formatDate(selectedReport.created_at)}

</p>

<p>

<b>Status :</b>

${selectedReport.status}

</p>

`;

    new bootstrap.Modal(

        document.getElementById(

            "reportPreviewModal"

        )

    ).show();

}

// =============================================
// REPORT DETAILS
// =============================================

function showDetails(id){

selectedReport=

reports.find(

r=>r.id===id

);

if(!selectedReport)
return;

document.getElementById("detailId").innerHTML=
selectedReport.id;

document.getElementById("detailName").innerHTML=
selectedReport.name;

document.getElementById("detailType").innerHTML=
selectedReport.type;

document.getElementById("detailUser").innerHTML=
selectedReport.created_by;

document.getElementById("detailDate").innerHTML=
formatDate(selectedReport.created_at);

document.getElementById("detailStatus").innerHTML=
selectedReport.status;

new bootstrap.Modal(

document.getElementById(

"reportDetailsModal"

)

).show();

}

// =============================================
// DOWNLOAD REPORT
// =============================================

async function downloadReport(id){

const progress=

document.getElementById(

"downloadProgress"

);

new bootstrap.Modal(

document.getElementById(

"downloadModal"

)

).show();

progress.style.width="0%";
progress.innerHTML="0%";

let value=0;

const timer=setInterval(()=>{

value+=10;

progress.style.width=value+"%";

progress.innerHTML=value+"%";

if(value>=100){

clearInterval(timer);

bootstrap.Modal

.getInstance(

document.getElementById(

"downloadModal"

)

).hide();

showToast(

"Download Started"

);

// window.open(`${API.reports}/${id}/download`);

}

},150);

}

// =============================================
// DELETE REPORT
// =============================================

async function deleteReport(id){

if(

!confirm(

"Delete this report?"

)

)

return;

try{

const response=

await fetch(

`${API.reports}/${id}`,

{

method:"DELETE"

}

);

if(!response.ok)
throw new Error();

showToast(

"Report Deleted"

);

await loadReports();

}

catch{

showToast(

"Delete Failed"

);

}

}

// =============================================
// EXPORT
// =============================================

function exportExcel(){

showToast(

"Exporting Excel..."

);

// window.open(`${API.reports}/export/excel`);

}

function exportPDF(){

showToast(

"Exporting PDF..."

);

// window.open(`${API.reports}/export/pdf`);

}

function printReport(){

window.print();

}

// =============================================
// REFRESH
// =============================================

async function refreshReports(){

showLoader();

await loadReports();

hideLoader();

showToast(

"Reports Refreshed"

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

if(e.target.closest(".previewBtn")){

previewReport(

Number(

e.target.closest(".previewBtn").dataset.id

)

);

}

if(e.target.closest(".detailBtn")){

showDetails(

Number(

e.target.closest(".detailBtn").dataset.id

)

);

}

if(e.target.closest(".downloadBtn")){

downloadReport(

Number(

e.target.closest(".downloadBtn").dataset.id

)

);

}

if(e.target.closest(".deleteBtn")){

deleteReport(

Number(

e.target.closest(".deleteBtn").dataset.id

)

);

}

});

// =============================================
// EVENT LISTENERS
// =============================================

function attachEvents(){

document.getElementById("applyFilters")
?.addEventListener("click",applyFilters);

document.getElementById("generateReport")
?.addEventListener("click",generateReport);

document.getElementById("refreshReports")
?.addEventListener("click",refreshReports);

document.getElementById("exportExcel")
?.addEventListener("click",exportExcel);

document.getElementById("exportPDF")
?.addEventListener("click",exportPDF);

document.getElementById("printReport")
?.addEventListener("click",printReport);

document.getElementById("downloadReport")
?.addEventListener("click",()=>{

if(selectedReport){

downloadReport(selectedReport.id);

}

});

}

// =============================================
// END OF reports.js
// =============================================