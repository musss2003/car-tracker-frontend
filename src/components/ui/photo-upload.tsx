'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { downloadDocument } from '@/services/uploadService';

interface PhotoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  existingPhotoUrl?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Fotografija vozila',
  accept = 'image/*',
  maxSizeMB = 5,
  existingPhotoUrl,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExistingPhoto = async (photoUrl: string) => {
    if (!photoUrl) return;

    setIsLoadingPhoto(true);
    try {
      const photoBlob = await downloadDocument(photoUrl);
      const photoObjectUrl = URL.createObjectURL(photoBlob);
      setPhotoPreview(photoObjectUrl);
    } catch (error) {
      console.error('Error loading existing photo:', error);
      alert('Failed to load existing photo. Please try again later.');
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  useEffect(() => {
    if (existingPhotoUrl) {
      loadExistingPhoto(existingPhotoUrl);
    }

    // Cleanup function to revoke object URL and prevent memory leaks
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [existingPhotoUrl]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setIsUploadingPhoto(true);

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      onChange(file);
      setIsUploadingPhoto(false);
    };

    reader.onerror = () => {
      console.error('Error reading file:', reader.error);
      alert('Failed to process photo. Please try again.');
      setIsUploadingPhoto(false);
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">{label}</Label>
      <div className="relative">
        <input
          ref={fileInputRef}
          id="photo"
          type="file"
          accept={accept}
          onChange={handlePhotoChange}
          disabled={disabled || isUploadingPhoto}
          className="hidden"
        />

        {!photoPreview ? (
          <label
            htmlFor="photo"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              disabled || isUploadingPhoto
                ? 'bg-muted cursor-not-allowed opacity-60'
                : 'bg-background hover:bg-muted/50 border-border hover:border-primary'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Kliknite da biste dodali fotografiju
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG do {maxSizeMB}MB
                </p>
              </div>
            </div>
          </label>
        ) : (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
            <img
              src={photoPreview || '/placeholder.svg'}
              alt="Car preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label
                htmlFor="photo"
                className="flex items-center gap-2 px-4 py-2 bg-background text-foreground rounded-md cursor-pointer hover:bg-muted transition-colors text-sm font-medium"
              >
                <Upload className="h-4 w-4" />
                Promijeni
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removePhoto}
                disabled={disabled || isUploadingPhoto}
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                Ukloni
              </Button>
            </div>
          </div>
        )}

        {(isUploadingPhoto || isLoadingPhoto) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Učitavanje fotografije...</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
