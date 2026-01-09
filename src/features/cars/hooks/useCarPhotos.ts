import { useState, useEffect } from 'react';
import { logError } from '@/shared/utils/logger';
import { downloadDocument } from '@/shared/services/uploadService';
import type { CarWithStatus } from '../types/car.types';

export const useCarPhotos = (cars: CarWithStatus[]) => {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const loadCarPhoto = async (carId: string, photoFilename: string) => {
    if (!photoFilename || photoUrls[carId]) return;

    try {
      const blob = await downloadDocument(photoFilename);

      // Validate MIME type to prevent content sniffing attacks
      const validImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!validImageTypes.includes(blob.type)) {
        logError(`Invalid image type for car ${carId}: ${blob.type}`);
        return;
      }

      const url = URL.createObjectURL(blob);
      setPhotoUrls((prev) => ({ ...prev, [carId]: url }));
    } catch (error) {
      logError(`Failed to load photo for car ${carId}:`, error);
    }
  };

  // Load photos for cars with photoUrl
  useEffect(() => {
    cars.forEach((car) => {
      if (car.photoUrl && !photoUrls[car.id]) {
        loadCarPhoto(car.id, car.photoUrl);
      }
    });
  }, [cars, photoUrls]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return photoUrls;
};
