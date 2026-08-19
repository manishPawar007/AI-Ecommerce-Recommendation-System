// ======================================================
// GadgetWorld API Configuration
// ======================================================

const BASE_URL =
window.location.hostname === "127.0.0.1" ||
window.location.hostname === "localhost" ||
window.location.protocol === "file:"
? "http://127.0.0.1:8000/api"
: "https://YOUR-APP-NAME.onrender.com/api";


// ======================================================
// Universal API Request
// ======================================================

async function apiRequest(

    endpoint,

    method = "GET",

    body = null,

    auth = true

){

    const headers = {};

    if(!(body instanceof FormData)){

        headers["Content-Type"] = "application/json";

    }

    if(auth){

        const token = localStorage.getItem("token");

        if(token){

            headers["Authorization"] = `Bearer ${token}`;

        }

    }

    const options = {

        method,
        headers

    };

    if(body){

        if(body instanceof FormData){

            options.body = body;

        }

        else{

            options.body = JSON.stringify(body);

        }

    }

    try{

        console.log("================================");
        console.log("API :", method, endpoint);

        const response = await fetch(

            `${BASE_URL}${endpoint}`,

            options

        );

        let data = null;

        try{

            data = await response.json();

        }

        catch{

            data = null;

        }

        console.log("Response :", data);

        if(!response.ok){

            throw new Error(

                data?.detail ||

                data?.message ||

                `HTTP ${response.status}`

            );

        }

        return data;

    }

    catch(error){

        console.error("API ERROR :", error);

        throw error;

    }

}


// ======================================================
// GET
// ======================================================

async function getRequest(endpoint){

    return await apiRequest(

        endpoint,

        "GET"

    );

}


// ======================================================
// POST
// ======================================================

async function postRequest(

    endpoint,

    data

){

    return await apiRequest(

        endpoint,

        "POST",

        data

    );

}


// ======================================================
// PUT
// ======================================================

async function updateRequest(

    endpoint,

    data

){

    return await apiRequest(

        endpoint,

        "PUT",

        data

    );

}


// ======================================================
// DELETE
// ======================================================

async function deleteRequest(endpoint){

    return await apiRequest(

        endpoint,

        "DELETE"

    );

}


// ======================================================
// Upload
// ======================================================

async function uploadFile(

    endpoint,

    formData

){

    return await apiRequest(

        endpoint,

        "POST",

        formData

    );

}


console.log("✅ GadgetWorld API Connected");