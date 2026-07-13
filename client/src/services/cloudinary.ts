import { API_BASE_URL } from '../config';

/**
 * Extracts the Cloudinary public_id from a secure Cloudinary URL.
 * Supports standard formats including folders.
 */
export const getPublicIdFromUrl = (url: string): string => {
  if (!url || !url.includes('res.cloudinary.com')) return '';
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return '';
    
    // Extract everything after '/upload/'
    const afterUpload = url.substring(uploadIndex + 8);
    
    // Remove the version prefix (e.g. 'v12345678/')
    const versionMatch = afterUpload.match(/^v\d+\//);
    const publicIdWithExt = versionMatch 
      ? afterUpload.substring(versionMatch[0].length) 
      : afterUpload;
      
    // Strip the file extension (e.g. '.jpg', '.png', '.mp4')
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    if (lastDotIndex === -1) return publicIdWithExt;
    
    return publicIdWithExt.substring(0, lastDotIndex);
  } catch (err) {
    console.error('Error parsing public ID from Cloudinary URL:', err);
    return '';
  }
};

/**
 * Sends a request to the server to delete a Cloudinary asset by its public ID.
 */
export const deleteCloudinaryAsset = async (
  publicId: string, 
  accessToken: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<boolean> => {
  if (!publicId || !accessToken) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/admin/cloudinary/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to delete Cloudinary asset:', err);
    return false;
  }
};
