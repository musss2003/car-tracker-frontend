import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';
import { api, encodePathParam } from '@/shared/utils/apiService';
import { logError } from '@/shared/utils/logger';
import { toast } from 'react-toastify';
import { Contract, ContractFormData } from '../types/contract.types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/contracts/';

export const getTotalRevenue = async (): Promise<number> => {
  try {
    const data = await api.get<{ totalRevenue: number }>(
      '/api/contracts/revenue/total',
      'revenue'
    );

    if (data && typeof data.totalRevenue === 'number') {
      return data.totalRevenue;
    }

    throw new Error('Unexpected revenue response format');
  } catch (error) {
    logError('Error fetching total revenue', error);
    throw error;
  }
};

export const getContracts = async (): Promise<Contract[]> => {
  return api.get<Contract[]>('/api/contracts', 'contracts');
};

export const getContract = async (id: string): Promise<Contract> => {
  return api.get<Contract>(
    `/api/contracts/${encodePathParam(id)}`,
    'contract',
    id
  );
};

export const getContractTemplate = async (): Promise<Response> => {
  const res = await fetch(`${API_URL}template`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    // Log the actual status for debugging purposes only (server-side or dev console)
    logError('Failed to fetch contract template:', res.status);
    throw new Error('Failed to fetch contract template');
  }
  return res;
};

export const getActiveContracts = async (): Promise<Contract[]> => {
  return api.get<Contract[]>('/api/contracts/active', 'active contracts');
};

export const updateContract = async (
  contractId: string,
  updatedContract: Partial<Contract>
): Promise<Contract> => {
  const result = await api.put<Contract>(
    `/api/contracts/${encodePathParam(contractId)}`,
    updatedContract,
    'contract',
    contractId
  );
  toast.success('Contract updated successfully!');
  return result;
};

export const deleteContract = async (contractId: string): Promise<void> => {
  await api.delete<void>(
    `/api/contracts/${encodePathParam(contractId)}`,
    'contract',
    contractId
  );
  toast.success('Contract deleted successfully!');
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
      // Log status for debugging, but not the full error response
      logError(`Failed to create contract (Status: ${res.status})`);
      throw new Error('Failed to create contract');
    }

    const text = await res.text();
    const { contract, docx } = JSON.parse(text);

    const docxBlob = extractDocxBlobFromResponse(docx);
    triggerDownloadContract(await docxBlob, contract.id);
    return contract;
  } catch (error) {
    logError('Error creating and downloading contract', error);
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

  if (!res.ok) {
    logError('Failed to download contract:', res.status);
    throw new Error('Failed to download contract');
  }

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
