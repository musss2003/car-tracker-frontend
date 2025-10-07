/**
 * Supabase Photo Upload Service
 * Provides secure, free photo storage using Supabase Storage
 */

import { supabase } from '../config/supabase';

interface UploadOptions {
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;  
  quality?: number;
}

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

class SupabasePhotoUploadService {
  private readonly bucketName = 'customer-photos';

  /**
   * Upload a single photo to Supabase Storage
   */
  async uploadPhoto(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Check if Supabase is initialized
      if (!supabase) {
        console.warn('⚠️ Supabase not configured. Using development fallback.');
        return this.developmentFallback(file, onProgress);
      }

      // Validate file first
      this.validateFile(file);

      // Generate unique filename
      const fileName = this.generateFileName(file.name);
      const folder = options.folder || 'uploads';
      const filePath = `${folder}/${fileName}`;

      // Process image (resize/compress) before upload
      const processedFile = await this.processImage(file, options);

      // Simulate progress during processing
      if (onProgress) {
        onProgress({ bytesTransferred: 0, totalBytes: processedFile.size, progress: 0 });
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false // Don't overwrite existing files
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Simulate upload progress completion
      if (onProgress) {
        onProgress({ 
          bytesTransferred: processedFile.size, 
          totalBytes: processedFile.size, 
          progress: 100 
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('✅ Supabase upload successful:', {
        originalSize: file.size,
        processedSize: processedFile.size,
        compression: Math.round((1 - processedFile.size / file.size) * 100) + '%',
        url: urlData.publicUrl
      });

      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ Supabase upload error:', error);
      throw error;
    }
  }

  /**
   * Upload customer document (license, passport)
   */
  async uploadCustomerDocument(
    file: File,
    customerId: string,
    documentType: 'license' | 'passport',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return this.uploadPhoto(file, {
      folder: `customers/${customerId}/documents`,
      maxWidth: 1200,
      maxHeight: 900,
      quality: 0.9
    }, onProgress);
  }

  /**
   * Upload car photos
   */
  async uploadCarPhoto(
    file: File,
    carId: string,
    onProgress?: (progress: UploadProgress) => void  
  ): Promise<string> {
    return this.uploadPhoto(file, {
      folder: `cars/${carId}`,
      maxWidth: 1600,
      maxHeight: 1200,
      quality: 0.9
    }, onProgress);
  }

  /**
   * Delete a photo from Supabase Storage
   */
  async deletePhoto(photoUrl: string): Promise<boolean> {
    try {
      // Handle development fallback URLs
      if (!supabase || photoUrl.startsWith('blob:')) {
        console.log('🔧 Development mode: Simulating photo deletion...');
        if (photoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photoUrl);
        }
        return true;
      }

      // Extract file path from Supabase URL
      const filePath = this.extractFilePathFromUrl(photoUrl);
      if (!filePath) {
        throw new Error('Invalid Supabase Storage URL');
      }

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('✅ Photo deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ Photo deletion error:', error);
      return false;
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Process image (resize and compress)
   */
  private async processImage(file: File, options: UploadOptions): Promise<File> {
    const { maxWidth = 1200, maxHeight = 900, quality = 0.8 } = options;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const processedFile = new File(
              [blob!], 
              file.name, 
              { type: file.type }
            );
            resolve(processedFile);
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Extract file path from Supabase Storage URL
   */
  private extractFilePathFromUrl(url: string): string | null {
    try {
      // Supabase URL format: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file
      const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Development fallback for when Supabase is not configured
   */
  private async developmentFallback(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    console.log('🔧 Development mode: Simulating photo upload...');
    
    // Validate file first
    this.validateFile(file);
    
    // Process image even in development
    const processedFile = await this.processImage(file, {
      maxWidth: 1200,
      maxHeight: 900,
      quality: 0.8
    });

    // Simulate upload progress
    return new Promise<string>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        
        if (onProgress) {
          onProgress({
            bytesTransferred: (progress / 100) * processedFile.size,
            totalBytes: processedFile.size,
            progress: progress
          });
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          
          const blobUrl = URL.createObjectURL(processedFile);
          
          console.log('✅ Development upload complete:', {
            originalSize: file.size,
            processedSize: processedFile.size,
            compression: Math.round((1 - processedFile.size / file.size) * 100) + '%',
            blobUrl: blobUrl
          });
          
          resolve(blobUrl);
        }
      }, 100);
    });
  }
}

// Export singleton instance
export const supabasePhotoUploadService = new SupabasePhotoUploadService();
export default supabasePhotoUploadService;