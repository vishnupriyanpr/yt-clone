const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

/**
 * Build a Cloudinary thumbnail URL with transformations
 */
export function buildThumbnailUrl(publicId, width = 640, height = 360) {
  if (!publicId) return '';
  // If it's already a full URL, return as-is
  if (publicId.startsWith('http')) return publicId;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
}

/**
 * Build a Cloudinary video URL
 */
export function buildVideoUrl(publicId) {
  if (!publicId) return '';
  // If it's already a full URL, return as-is
  if (publicId.startsWith('http')) return publicId;
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${publicId}`;
}

/**
 * Build a video thumbnail from a Cloudinary video publicId (first frame)
 */
export function buildVideoThumbnail(videoPublicId, width = 640, height = 360) {
  if (!videoPublicId) return '';
  if (videoPublicId.startsWith('http')) return videoPublicId;
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${width},h_${height},c_fill,so_0,f_jpg/${videoPublicId}`;
}
