import { BANNER_IMAGE_REQUIREMENTS, optimizeBannerImage, validateBannerImage } from '@/lib/utils/image-optimizer';
import * as fs from 'fs';
import * as path from 'path';

async function testImageOptimization() {
  try {
    // Read a test image file
    const testImagePath = path.join(process.cwd(), 'public', 'logo.png');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('Test image not found, skipping test');
      return;
    }
    
    const imageBuffer = fs.readFileSync(testImagePath);
    console.log('Original image size:', imageBuffer.length, 'bytes');
    
    // Validate original image
    const validation = await validateBannerImage(imageBuffer);
    console.log('Original image validation:', validation);
    
    // Optimize the image
    const optimizedBuffer = await optimizeBannerImage(imageBuffer, 'webp');
    console.log('Optimized image size:', optimizedBuffer.length, 'bytes');
    
    // Validate optimized image
    const optimizedValidation = await validateBannerImage(optimizedBuffer);
    console.log('Optimized image validation:', optimizedValidation);
    
    // Check if it meets requirements
    console.log('Meets size requirement:', optimizedBuffer.length <= BANNER_IMAGE_REQUIREMENTS.maxSize);
    console.log('Target size:', BANNER_IMAGE_REQUIREMENTS.maxSize, 'bytes');
    
    // Save optimized image for inspection
    const outputPath = path.join(process.cwd(), 'src', 'lib', 'utils', 'optimized-test.webp');
    fs.writeFileSync(outputPath, optimizedBuffer);
    console.log('Optimized image saved to:', outputPath);
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testImageOptimization();