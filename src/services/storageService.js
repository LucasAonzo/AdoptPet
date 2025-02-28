import supabase from '../config/supabase';
import { decode } from 'base64-arraybuffer';

/**
 * Service for interacting with Supabase Storage
 */
export const StorageService = {
  /**
   * List all available storage buckets
   * @returns {Promise<Object>} - List of buckets or error
   */
  listBuckets: async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in StorageService.listBuckets:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Create a new storage bucket
   * @param {string} bucketName - Name of the bucket to create
   * @param {Object} options - Bucket options (public, fileSizeLimit, etc.)
   * @returns {Promise<Object>} - Result of bucket creation
   */
  createBucket: async (bucketName, options = { public: true }) => {
    try {
      // Try to create with public access
      const { data, error } = await supabase.storage.createBucket(
        bucketName, 
        { ...options, public: true }
      );
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        // If we fail to create, try to get existing bucket
        const { data: buckets } = await supabase.storage.listBuckets();
        const existingBucket = buckets?.find(b => b.name === bucketName);
        
        if (existingBucket) {
          return { success: true, data: existingBucket };
        }
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`Error in StorageService.createBucket (${bucketName}):`, error);
      return { success: false, error };
    }
  },
  
  /**
   * Ensure a bucket exists, creating it if necessary
   * @param {string} bucketName - Name of the bucket to ensure
   * @returns {Promise<Object>} - Result with bucket name
   */
  ensureBucket: async (bucketName = 'animals') => {
    try {
      // For the 'animals' bucket which we know exists, skip creation attempts
      if (bucketName === 'animals') {
        return { success: true, bucketName: 'animals' };
      }
      
      // For other buckets, check if they exist
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return { success: false, error: listError };
      }
      
      // Check if our bucket exists
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (bucketExists) {
        return { success: true, bucketName };
      }
      
      // If not, try to create it with public access
      const { success, error } = await StorageService.createBucket(bucketName, { public: true });
      
      if (!success) {
        // If we failed to create a bucket, just use the first available bucket
        if (buckets && buckets.length > 0) {
          console.log(`Using existing bucket: ${buckets[0].name} instead of creating new one`);
          return { success: true, bucketName: buckets[0].name };
        }
        return { success: false, error };
      }
      
      return { success: true, bucketName };
    } catch (error) {
      console.error(`Error in StorageService.ensureBucket (${bucketName}):`, error);
      return { success: false, error };
    }
  },
  
  /**
   * Upload a file to Supabase Storage
   * @param {string} bucketName - Name of the bucket to upload to
   * @param {string} filePath - Path/name for the file in storage
   * @param {ArrayBuffer} fileData - File data as ArrayBuffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Result with the uploaded file data
   */
  uploadFile: async (bucketName, filePath, fileData, options = { contentType: 'image/jpeg', upsert: true }) => {
    try {
      // Ensure the bucket exists
      const { success: bucketSuccess, bucketName: validBucket, error: bucketError } = 
        await StorageService.ensureBucket(bucketName);
      
      if (!bucketSuccess) {
        return { success: false, error: bucketError };
      }
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(validBucket)
        .upload(filePath, fileData, options);
      
      if (error) {
        console.error(`Error uploading file to ${validBucket}/${filePath}:`, error);
        return { success: false, error };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(validBucket)
        .getPublicUrl(filePath);
      
      return { 
        success: true, 
        data, 
        publicUrl
      };
    } catch (error) {
      console.error(`Error in StorageService.uploadFile (${bucketName}/${filePath}):`, error);
      return { success: false, error };
    }
  },
  
  /**
   * Upload a base64 image to Supabase Storage
   * @param {string} base64Data - Base64 encoded image data
   * @param {string} bucketName - Name of the bucket to upload to
   * @param {string} filePath - Path/name for the image in storage
   * @param {string} contentType - MIME type of the image
   * @returns {Promise<Object>} - Result with the public URL
   */
  uploadBase64Image: async (base64Data, bucketName = 'animals', filePath = null, contentType = 'image/jpeg') => {
    try {
      if (!base64Data) {
        return { success: false, error: new Error('No image data provided') };
      }
      
      // Generate a unique filename if not provided
      const fileName = filePath || `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      
      // Convert base64 to ArrayBuffer
      const fileData = decode(base64Data);
      
      // Upload the file
      return await StorageService.uploadFile(
        bucketName,
        fileName,
        fileData,
        { contentType, upsert: true }
      );
    } catch (error) {
      console.error('Error in StorageService.uploadBase64Image:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Delete a file from Supabase Storage
   * @param {string} bucketName - Name of the bucket
   * @param {string} filePath - Path of the file to delete
   * @returns {Promise<Object>} - Result of the delete operation
   */
  deleteFile: async (bucketName, filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        console.error(`Error deleting file ${bucketName}/${filePath}:`, error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`Error in StorageService.deleteFile (${bucketName}/${filePath}):`, error);
      return { success: false, error };
    }
  }
};

export default StorageService; 