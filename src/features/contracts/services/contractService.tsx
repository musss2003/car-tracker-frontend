import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { toast } from 'react-toastify';
import { Contract, ContractFormData } from '../types/contract.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/contracts/';

export const getTotalRevenue = async (): Promise<number> => {
  const response = await fetch(`${API_URL}revenue/total`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error fetching revenue: ${response.statusText}`);
  }

  const data = await response.json();

  // Backend returns { success: true, data: { totalRevenue: number }, timestamp }
  if (data && data.success && data.data && typeof data.data.totalRevenue === 'number') {
    return data.data.totalRevenue;
  }

  throw new Error('Unexpected revenue response format');
};

export const getContracts = async (): Promise<Contract[]> => {
  const res = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  const response = await res.json();
  return response.data || response;
};

export const getContract = async (id: string): Promise<Contract> => {
  const res = await fetch(`${API_URL}${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  const response = await res.json();
  return response.data || response;
};

export const getContractTemplate = async (): Promise<Response> => {
  const res = await fetch(`${API_URL}template`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res;
};

export const getActiveContracts = async (): Promise<Contract[]> => {
  const res = await fetch(`${API_URL}active`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  const response = await res.json();
  return response.data || response;
};

export const updateContract = async (
  contractId: string,
  updatedContract: Partial<Contract>
): Promise<Contract> => {
  const res = await fetch(`${API_URL}${encodeURIComponent(contractId)}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updatedContract),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  toast.success('Contract updated successfully!');
  const response = await res.json();
  return response.data || response;
};

export const deleteContract = async (contractId: string): Promise<void> => {
  const res = await fetch(`${API_URL}${encodeURIComponent(contractId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
};

export const createAndDownloadContract = async (
  contractData: ContractFormData
): Promise<Contract | undefined> => {
  console.log(contractData);
  try {
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contractData),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error:', errorText);
      throw new Error(`Error creating contract: ${res.statusText}`);
    }

    const text = await res.text();
    const { contract, docx } = JSON.parse(text);

    const docxBlob = extractDocxBlobFromResponse(docx);
    triggerDownloadContract(await docxBlob, contract.id);
    return contract;
  } catch (error) {
    console.error('Error creating and downloading contract:', error);
    throw error; // Re-throw the error so it can be caught by the calling function
  }
};

export const downloadContract = async (contractId: string): Promise<void> => {
  const res = await fetch(
    `${API_URL}download/${encodeURIComponent(contractId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

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

const triggerDownloadContract = async (blob: Blob, contractId: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const contractData = await getContract(contractId);

  const contract =
    (a.download = `contract_${contractData.customer.name.replace(/\s+/g, '_')}_${contractData.car.licensePlate}_${new Date(contractData.startDate).toISOString().split('T')[0]}_${new Date(contractData.endDate).toISOString().split('T')[0]}.docx`);

  document.body.appendChild(a);

  a.click();
  a.remove();
};
