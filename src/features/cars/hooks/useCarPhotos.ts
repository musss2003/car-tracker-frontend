import { useState, useEffect } from 'react';
import { downloadDocument } from '@/shared/services/uploadService';
import type { CarWithStatus } from '../types/car.types';

export const useCarPhotos = (cars: CarWithStatus[]) => {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const loadCarPhoto = async (carId: string, photoFilename: string) => {
    if (!photoFilename || photoUrls[carId]) return;

    try {
      const blob = await downloadDocument(photoFilename);
      const url = URL.createObjectURL(blob);
      setPhotoUrls((prev) => ({ ...prev, [carId]: url }));
    } catch (error) {
      console.error(`Failed to load photo for car ${carId}:`, error);
    }
  };

  // Load photos for cars with photoUrl
  useEffect(() => {
    cars.forEach((car) => {
      if (car.photoUrl && !photoUrls[car.id]) {
        loadCarPhoto(car.id, car.photoUrl);
      }
    });
  }, [cars]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return photoUrls;
};
