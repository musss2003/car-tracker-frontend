import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/contracts/';



export const getTotalRevenue = async () => {
    try {
        const response = await fetch(`${API_URL}revenue`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching total revenue:', error);
        throw error;
    }
};

export const getContracts = async () => {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
    }
};

export const getContractTemplate = async () => {
    try {
        const response = await fetch(`${API_URL}template`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = response;

        return data;
    } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
    }
};

export const getContractsPopulated = async () => {
    try {
        const response = await fetch(`${API_URL}populated`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
    }
};

export const getActiveContracts = async () => {
    try {
        const response = await fetch(`${API_URL}/active`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching active contracts:', error);
        throw error;
    }
};

export const updateContract = async (contractId, updatedContract) => {
    try {
        const response = await fetch(`${API_URL}${contractId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedContract), // Convert the updated contract object to JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the updated contract data
    } catch (error) {
        console.error('Error updating contract:', error);
        throw error; // Propagate the error for further handling
    }
};

export const deleteContract = async (contractId) => {
    try {
        const response = await fetch(`${API_URL}${contractId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(), // Include authorization headers if needed
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return; // Simply return if the deletion was successful (no response data)
    } catch (error) {
        console.error('Error deleting contract:', error);
        throw error; // Propagate the error for further handling
    }
};

export const createAndDownloadContract = async (contractData) => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(contractData)
        });

        if (!response.ok) {
            throw new Error(`Error creating contract: ${response.statusText}`);
        }

        // Read the response as a Blob
        const blob = await response.blob();

        // Convert part of the Blob to JSON to get the contract data
        const text = await blob.text();
        const { contract, docx } = JSON.parse(text);

        // Convert base64 string to a Blob
        const docxBlob = await extractDocxBlobFromResponse(docx);

        // Trigger the download of the generated DOCX file
        triggerDownloadContract(docxBlob, contract._id);

        return contract;
    } catch (error) {
        console.error('Error creating and downloading contract:', error);
    }
};

export const downloadContract = async (contractId) => {
    try {
        const response = await fetch(`${API_URL}download/${contractId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error downloading contract: ${response.statusText}`);
        }

        // Read the response as JSON
        const data = await response.json();

        // Extract the base64 string from the response
        const { docx } = data;

        // Convert base64 string to a Blob
        const blob = await extractDocxBlobFromResponse(docx);

        // Trigger the download of the generated DOCX file
        triggerDownloadContract(blob, contractId);
    } catch (error) {
        console.error('Error downloading contract:', error);
    }
}


const extractDocxBlobFromResponse = async (docx) => {
    // Convert base64 string to a Blob
    const byteCharacters = atob(docx);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    return blob;
}

const triggerDownloadContract = (blob, contractId) => {
    // Trigger the download of the generated DOCX file
    // Trigger the download of the generated DOCX file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_${contractId}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}



