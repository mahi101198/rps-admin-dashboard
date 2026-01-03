import sharp from 'sharp';
import { MAX_FILE_SIZE } from '@/lib/constant';

// Banner image optimization requirements - 900x360 for web display
export const BANNER_IMAGE_REQUIREMENTS = {
  width: 900,
  height: 360,
  aspectRatio: 2.5, // 2.5:1 aspect ratio (900/360 = 2.5)
  maxSize: 200 * 1024, // 200KB in bytes
  preferredFormat: 'webp',
  fallbackFormat: 'jpeg',
  quality: 80, // Quality for good balance of size and quality
};

/**
 * Optimizes an image buffer to meet banner requirements
 * @param buffer The image buffer to optimize
 * @param format The desired output format ('webp' or 'jpeg')
 * @returns Promise resolving to the optimized buffer
 */
export async function optimizeBannerImage(
  buffer: Buffer,
  format: 'webp' | 'jpeg' = 'webp'
): Promise<Buffer> {
  try {
    // First, get metadata to understand the image
    const metadata = await sharp(buffer).metadata();
    console.log('Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length
    });
    
    // Resize the image to the required dimensions (900x360) with proper aspect ratio handling
    let sharpInstance = sharp(buffer)
      .resize(BANNER_IMAGE_REQUIREMENTS.width, BANNER_IMAGE_REQUIREMENTS.height, {
        fit: 'cover', // Cover the entire area
        position: 'center', // Center the crop
        withoutEnlargement: false, // Allow enlargement if needed
      });

    // Apply the format and quality settings
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({
        quality: BANNER_IMAGE_REQUIREMENTS.quality,
        effort: 6, // Higher effort for better quality
      });
    } else {
      sharpInstance = sharpInstance.jpeg({
        quality: BANNER_IMAGE_REQUIREMENTS.quality,
        progressive: true, // Progressive JPEG
      });
    }

    // Get the optimized buffer
    let optimizedBuffer = await sharpInstance.toBuffer();
    
    console.log('First optimization attempt size:', optimizedBuffer.length, 'bytes');
    
    // If the file is still too large, reduce quality iteratively
    let quality = BANNER_IMAGE_REQUIREMENTS.quality;
    while (optimizedBuffer.length > BANNER_IMAGE_REQUIREMENTS.maxSize && quality > 30) {
      quality -= 5; // Smaller decrements for better quality control
      
      if (format === 'webp') {
        sharpInstance = sharp(buffer)
          .resize(BANNER_IMAGE_REQUIREMENTS.width, BANNER_IMAGE_REQUIREMENTS.height, {
            fit: 'cover',
            position: 'center',
            withoutEnlargement: false,
          })
          .webp({
            quality: Math.max(quality, 30),
            effort: 6,
          });
      } else {
        sharpInstance = sharp(buffer)
          .resize(BANNER_IMAGE_REQUIREMENTS.width, BANNER_IMAGE_REQUIREMENTS.height, {
            fit: 'cover',
            position: 'center',
            withoutEnlargement: false,
          })
          .jpeg({
            quality: Math.max(quality, 30),
            progressive: true,
          });
      }
      
      optimizedBuffer = await sharpInstance.toBuffer();
      console.log('Optimization with quality', quality, 'size:', optimizedBuffer.length, 'bytes');
    }
    
    console.log('Final optimized image size:', optimizedBuffer.length, 'bytes');
    return optimizedBuffer;
  } catch (error) {
    console.error('Error optimizing banner image:', error);
    throw new Error('Failed to optimize banner image');
  }
}

/**
 * Validates if an image meets banner requirements
 * @param buffer The image buffer to validate
 * @returns Promise resolving to validation result
 */
export async function validateBannerImage(buffer: Buffer): Promise<{
  valid: boolean;
  width: number;
  height: number;
  size: number;
  format: string;
  message?: string;
}> {
  try {
    const metadata = await sharp(buffer).metadata();
    
    return {
      valid: true,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: buffer.length,
      format: metadata.format || 'unknown',
    };
  } catch (error) {
    return {
      valid: false,
      width: 0,
      height: 0,
      size: buffer.length,
      format: 'unknown',
      message: 'Failed to process image',
    };
  }
}

/**
 * Converts an image to WebP format with optimization
 * @param buffer The image buffer to convert
 * @returns Promise resolving to WebP buffer
 */
export async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  // Resize to 900x360 and convert to WebP
  return await sharp(buffer)
    .resize(900, 360, {
      fit: 'cover',
      position: 'center'
    })
    .webp({
      quality: 80,
      effort: 6,
    })
    .toBuffer();
}

/**
 * Converts an image to JPEG format with optimization
 * @param buffer The image buffer to convert
 * @returns Promise resolving to JPEG buffer
 */
export async function convertToJPEG(buffer: Buffer): Promise<Buffer> {
  // Resize to 900x360 and convert to JPEG
  return await sharp(buffer)
    .resize(900, 360, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toBuffer();
}