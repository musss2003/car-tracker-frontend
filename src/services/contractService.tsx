import { Contract } from '../types/Contract';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/contracts/';

// Expected by useDataFetcher:
// const { data: revenueData } = useDataFetcher<{ totalRevenue: number }>(...)
export const getTotalRevenue = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}revenue`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching revenue: ${response.statusText}`);
    }

    const totalRevenue: number = await response.json();

    return totalRevenue;
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    throw error;
  }
};

export const getContracts = async (): Promise<Contract[]> => {
  const res = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
};

export const getContractTemplate = async (): Promise<Response> => {
  const res = await fetch(`${API_URL}template`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res;
};

export const getContractsPopulated = async (): Promise<Contract[]> => {
  const res = await fetch(`${API_URL}populated`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
};

export const getActiveContracts = async (): Promise<Contract[]> => {
  const res = await fetch(`${API_URL}active`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
};

export const updateContract = async (
  contractId: string,
  updatedContract: Partial<Contract>
): Promise<Contract> => {
  const res = await fetch(`${API_URL}${contractId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updatedContract),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
};

export const deleteContract = async (contractId: string): Promise<void> => {
  const res = await fetch(`${API_URL}${contractId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
};

export const createAndDownloadContract = async (
  contractData: Partial<Contract>
): Promise<Contract | undefined> => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contractData),
    });

    if (!res.ok) throw new Error(`Error creating contract: ${res.statusText}`);

    const text = await res.text();
    const { contract, docx } = JSON.parse(text);

    const docxBlob = extractDocxBlobFromResponse(docx);
    triggerDownloadContract(await docxBlob, contract._id);
    return contract;
  } catch (error) {
    console.error('Error creating and downloading contract:', error);
  }
};

export const downloadContract = async (contractId: string): Promise<void> => {
  const res = await fetch(`${API_URL}download/${contractId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`Error downloading contract: ${res.statusText}`);

  const { docx } = await res.json();
  const blob = await extractDocxBlobFromResponse(docx);
  triggerDownloadContract(blob, contractId);
};

const extractDocxBlobFromResponse = async (docx: string): Promise<Blob> => {
  const byteCharacters = atob(docx);
  const byteNumbers = Array.from(byteCharacters).map((char) =>
    char.charCodeAt(0)
  );
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
};

const triggerDownloadContract = (blob: Blob, contractId: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contract_${contractId}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
