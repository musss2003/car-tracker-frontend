import { apiRequest } from '../utils/apiService';
import { logError } from '@/shared/utils/logger';

// Upload a document/image file
export const uploadDocument = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('document', file);

  // Log file info for debugging
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  console.log(
    `Uploading file: ${file.name}, Size: ${fileSizeMB}MB (${file.size} bytes)`
  );

  try {
    const data = await apiRequest<{ message: string; filename: string }>(
      '/api/upload',
      {
        method: 'POST',
        body: formData,
        resourceName: 'document',
        operation: 'upload',
      }
    );

    // Return the filename which can be used to download later
    return data.filename;
  } catch (error) {
    // Handle 413 Payload Too Large specifically
    if (error instanceof Error && error.message.includes('413')) {
      throw new Error(
        `Fajl je prevelik (${fileSizeMB}MB). Maksimalna veličina je 10MB.`
      );
    }
    logError('Error uploading document:', (error as Error).message);
    throw error;
  }
};

// Download a document by filename
export const downloadDocument = async (filename: string): Promise<Blob> => {
  // Validate filename
  if (!filename || filename.trim() === '') {
    throw new Error('Invalid filename: filename is empty');
  }

  try {
    const response = await apiRequest<Blob>(
      `/api/documents/${encodeURIComponent(filename)}`,
      {
        method: 'GET',
        resourceName: 'document',
        operation: 'download',
        resourceId: filename,
        responseType: 'blob',
      }
    );

    return response;
  } catch (error) {
    logError('Error downloading document:', (error as Error).message);
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
