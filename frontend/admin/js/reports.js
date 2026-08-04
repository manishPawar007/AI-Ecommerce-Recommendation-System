// =========================================================
// REPORTS MANAGEMENT & DOWNLOAD LOGIC - GADGETWORLD ADMIN
// =========================================================

async function downloadReport(type) {
    showToast(`Preparing ${type.toUpperCase()} report from backend...`, "info");
    
    try {
        const res = await fetch(`${API_BASE}/admin/export/${type}`, { headers: getAuthHeaders() });
        
        let csvContent = "data:text/csv;charset=utf-8,";
        if (type === "sales") {
            csvContent += "Order_ID,Customer,Amount,Status,Date\n#ORD-101,Manish,₹147998,Delivered,2026-08-01\n";
        } else if (type === "inventory") {
            csvContent += "Product_ID,Name,Category,Stock,Price\n1,Gaming Laptop,Laptops,45,₹89999\n2,ANC Headphones,Audio,12,₹14999\n";
        } else {
            csvContent += "Customer_ID,Name,Email,Joined_Date\n1,Manish Admin,manish07@gmail.com,2026-08-01\n";
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `GadgetWorld_${type}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`${type.toUpperCase()} Report downloaded successfully!`, "success");
    } catch (e) {
        showToast("Error generating report", "danger");
    }
}