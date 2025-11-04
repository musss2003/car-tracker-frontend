import { Contract, ContractFormData } from '../types/Contract';
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/contracts/';

export const getTotalRevenue = async (): Promise<{ totalRevenue: number }> => {
  const response = await fetch(`${API_URL}revenue`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error fetching revenue: ${response.statusText}`);
  }

  return response.json();
};

export const getContracts = async (): Promise<Contract[]> => {
  const res = await fetch(`${API_URL}all`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
};

export const getContract = async (id: string): Promise<Contract> => {
  const res = await fetch(`${API_URL}${encodeURIComponent(id)}`, {
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
  const res = await fetch(`${API_URL}${encodeURIComponent(contractId)}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updatedContract),
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  toast.success('Contract updated successfully!');
  return res.json();
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
    if (!res.ok) throw new Error(`Error creating contract: ${res.statusText}`);

    const text = await res.text();
    const { contract, docx } = JSON.parse(text);

    const docxBlob = extractDocxBlobFromResponse(docx);
    triggerDownloadContract(await docxBlob, contract.id);
    return contract;
  } catch (error) {
    console.error('Error creating and downloading contract:', error);
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
