import sharp from 'sharp';

/**
 * Gets the dimensions of an image buffer
 * @param buffer The image buffer
 * @returns Promise resolving to { width, height, format }
 */
export async function getImageDimensions(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw new Error('Failed to get image dimensions');
  }
}

/**
 * Checks if image dimensions match banner requirements
 * @param buffer The image buffer
 * @returns Promise resolving to validation result
 */
export async function validateBannerDimensions(buffer: Buffer) {
  try {
    const dimensions = await getImageDimensions(buffer);
    
    // Banner requirements
    const requiredWidth = 900;
    const requiredHeight = 360;
    const requiredAspectRatio = 2.5; // 900/360 = 2.5
    const maxWidth = 1200; // Allow some flexibility
    const maxHeight = 480; // Allow some flexibility
    
    const aspectRatio = dimensions.width / dimensions.height;
    
    return {
      ...dimensions,
      meetsRequirements: 
        dimensions.width >= requiredWidth &&
        dimensions.height >= requiredHeight &&
        dimensions.width <= maxWidth &&
        dimensions.height <= maxHeight &&
        Math.abs(aspectRatio - requiredAspectRatio) < 0.1, // Allow small variance
      requiredWidth,
      requiredHeight,
      requiredAspectRatio,
      actualAspectRatio: aspectRatio
    };
  } catch (error) {
    console.error('Error validating banner dimensions:', error);
    throw new Error('Failed to validate banner dimensions');
  }
}