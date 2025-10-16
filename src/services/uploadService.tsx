import { getAuthHeaders } from '../utils/getAuthHeaders';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api';

// Upload a document/image file
export const uploadDocument = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('document', file);

  try {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {};
    
    // Add auth token if exists (don't set Content-Type for FormData)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to upload document: ${response.statusText}`);
    }

    const data: { message: string; filename: string } = await response.json();

    // Return the filename which can be used to download later
    return data.filename;
  } catch (error) {
    console.error('Error uploading document:', (error as Error).message);
    throw error;
  }
};

// Download a document by filename
export const downloadDocument = async (filename: string): Promise<Blob> => {
  try {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_URL}/documents/${filename}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to download document: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading document:', (error as Error).message);
    throw error;
  }
};

// Helper function to trigger download in browser
export const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Legacy function name for backward compatibility
export const uploadImage = uploadDocument;
