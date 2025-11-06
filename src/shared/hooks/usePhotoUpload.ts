import { useState, useCallback } from 'react';
import { uploadDocument } from '../services/uploadService';

export interface UsePhotoUploadReturn {
  photoFile: File | null;
  photoUrl: string | null;
  uploading: boolean;
  error: string | null;
  setPhotoFile: (file: File | null) => void;
  uploadPhoto: () => Promise<string | null>;
  clearPhoto: () => void;
  clearError: () => void;
}

/**
 * usePhotoUpload Hook
 *
 * A reusable hook for handling photo uploads with file management,
 * upload progress, and error handling.
 *
 * @example
 * const {
 *   photoFile,
 *   uploading,
 *   error,
 *   setPhotoFile,
 *   uploadPhoto,
 *   clearError
 * } = usePhotoUpload();
 *
 * // In form submit
 * const handleSubmit = async () => {
 *   const photoFilename = await uploadPhoto();
 *   if (photoFilename) {
 *     // Use the filename
 *   }
 * };
 */
export function usePhotoUpload(): UsePhotoUploadReturn {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(async (): Promise<string | null> => {
    if (!photoFile) {
      return null;
    }

    try {
      setUploading(true);
      setError(null);

      const filename = await uploadDocument(photoFile);

      if (filename) {
        setPhotoUrl(filename);
        return filename;
      }

      throw new Error('Upload failed - no filename returned');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload photo';
      setError(errorMessage);
      console.error('Error uploading photo:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, [photoFile]);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoUrl(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    photoFile,
    photoUrl,
    uploading,
    error,
    setPhotoFile,
    uploadPhoto,
    clearPhoto,
    clearError,
  };
}
