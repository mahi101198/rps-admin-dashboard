'use client';

import { useState } from 'react';
import { MAX_FILE_SIZE, MAX_IMAGE_COUNT, SUPPORTED_IMAGE_TYPES } from '@/lib/constant';
import { ImageFile, UploadStatus } from '@/lib/types/image-file';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Plus, UploadCloud, X, XCircle, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductImageAction } from '@/actions/product-image-actions';
import { Button } from '@/components/ui/button';

// Helper function to optimize images before upload
const optimizeImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Set maximum dimensions (1200x1200 for product images)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression (0.8 quality for product images)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert canvas to blob'));
          }
        },
        'image/jpeg',
        0.8
      );
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

interface EnhancedImageUploadProps {
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  removeImage: (id: string) => void;
  productId?: string; // Optional productId for uploading images
}

export default function EnhancedImageUpload({ images, setImages, removeImage, productId }: EnhancedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // Add images to the selection
  const addImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length >= MAX_IMAGE_COUNT) {
      toast.error(`You can only upload up to ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    const newImages: ImageFile[] = [];
    let errorCount = 0;

    Array.from(files).forEach((file) => {
      // Check remaining capacity
      if (images.length + newImages.length >= MAX_IMAGE_COUNT) {
        return;
      }

      // Validate file type
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        errorCount++;
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
        return;
      }

      // Check for duplicates
      if (images.some((img) => img.file.name === file.name && img.file.size === file.size)) {
        toast.warning(`${file.name} is already selected`);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      const imageData: ImageFile = {
        id: crypto.randomUUID(),
        file,
        preview,
        status: 'pending' as UploadStatus,
      };

      newImages.push(imageData);
    });

    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) rejected. Only JPG, PNG, and WEBP images are allowed.`);
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addImages(e.target.files);
    e.target.value = ''; // Reset input
  };

  // Upload all images at once - requires productId to upload to Firebase Storage
  const uploadAllImages = async (productId?: string) => {
    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) {
      toast.info('No new images to upload');
      return;
    }

    if (!productId) {
      toast.error('Cannot upload images without a product ID. Please save the product first.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const totalImages = pendingImages.length;
      let successCount = 0;
      let failureCount = 0;

      // Update all to uploading status
      setImages(prev => prev.map(img => 
        img.status === 'pending' ? { ...img, status: 'uploading' as UploadStatus } : img
      ));

      // Upload each image to Firebase Storage
      for (let i = 0; i < pendingImages.length; i++) {
        const imageData = pendingImages[i];
        
        try {
          console.log(`[EnhancedImageUpload] Optimizing and uploading image ${i + 1}/${totalImages}: ${imageData.file.name}`);
          
          // Optimize image before uploading to reduce file size
          const optimizedBlob = await optimizeImage(imageData.file);
          const optimizedFile = new File([optimizedBlob], imageData.file.name, { type: 'image/jpeg' });
          
          const originalSize = (imageData.file.size / 1024).toFixed(2);
          const optimizedSize = (optimizedBlob.size / 1024).toFixed(2);
          console.log(`[EnhancedImageUpload] Image optimized: ${originalSize}KB → ${optimizedSize}KB`);
          
          // Upload optimized image to Firebase Storage
          const result = await uploadProductImageAction(optimizedFile, productId);
          
          if (result.success && result.imageUrl) {
            console.log(`[EnhancedImageUpload] Image uploaded successfully: ${result.imageUrl}`);
            setImages(prev => prev.map(img => 
              img.id === imageData.id 
                ? { ...img, status: 'success' as UploadStatus, uploadedUrl: result.imageUrl }
                : img
            ));
            successCount++;
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (error) {
          console.error(`[EnhancedImageUpload] Failed to upload ${imageData.file.name}:`, error);
          
          // Update image status to error
          setImages(prev => prev.map(img => 
            img.id === imageData.id 
              ? { ...img, status: 'error' as UploadStatus }
              : img
          ));
          
          failureCount++;
        }

        // Update progress
        setUploadProgress(((i + 1) / totalImages) * 100);
      }

      // Show results
      if (successCount > 0 && failureCount === 0) {
        toast.success(`Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''} to Firebase Storage!`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(`Uploaded ${successCount} image(s), ${failureCount} failed`);
      } else {
        toast.error('All uploads failed');
      }

    } catch (error) {
      console.error('[EnhancedImageUpload] Upload error:', error);
      toast.error('Upload process failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Clear all images
  const clearAll = () => {
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
  };

  // Retry failed uploads
  const retryFailedUploads = () => {
    setImages(prev => prev.map(img => 
      img.status === 'error' ? { ...img, status: 'pending' as UploadStatus } : img
    ));
  };

  const pendingCount = images.filter(img => img.status === 'pending').length;
  const successCount = images.filter(img => img.status === 'success').length;
  const errorCount = images.filter(img => img.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-muted',
          images.length === 0 ? 'min-h-[150px]' : 'min-h-[100px]'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm mb-2">
          Drag & drop images here, or click to select
        </p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-primary hover:bg-primary/90 cursor-pointer transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" />
          Select Images
        </label>
        <p className="text-[0.6rem] text-muted-foreground mt-1">
          Up to {MAX_IMAGE_COUNT} images • JPG, PNG, WEBP • Max {MAX_FILE_SIZE / (1024 * 1024)}MB each
        </p>
      </div>

      {/* Selected Images */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium">
              Selected Images ({images.length}/{MAX_IMAGE_COUNT})
            </h3>
            <div className="flex gap-1">
              {errorCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={retryFailedUploads}
                  disabled={uploading}
                  className="h-7 text-xs px-2"
                >
                  Retry
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={uploading}
                className="h-7 text-xs px-2"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
            {images.map((imageData, index) => (
              <ImagePreviewCard
                key={imageData.id}
                imageData={imageData}
                index={index}
                onRemove={removeImage}
                disabled={uploading}
              />
            ))}
          </div>

          {/* Upload Controls */}
          {pendingCount > 0 && (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={() => uploadAllImages(productId)}
                disabled={uploading || pendingCount === 0 || !productId}
                className="w-full max-w-xs h-8 text-sm"
                size="sm"
                title={!productId ? 'Save product first to upload images' : undefined}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Uploading... ({Math.round(uploadProgress)}%)
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-1" />
                    Upload {pendingCount} Image{pendingCount > 1 ? 's' : ''} to Firebase
                  </>
                )}
              </Button>
              {!productId && pendingCount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  💡 Images will be uploaded to Firebase Storage after you create the product
                </p>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="w-full max-w-xs">
                  <div className="bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-[0.6rem] text-muted-foreground mt-1">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status Summary */}
          {(successCount > 0 || errorCount > 0) && (
            <div className="flex items-center justify-center gap-3 pt-3 border-t">
              {successCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  {successCount} uploaded
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <XCircle className="w-3 h-3" />
                  {errorCount} failed
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual image preview card
function ImagePreviewCard({
  imageData,
  index,
  onRemove,
  disabled,
}: {
  imageData: ImageFile;
  index: number;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative group bg-muted rounded-md overflow-hidden aspect-square">
      {/* Image */}
      <img
        src={imageData.preview}
        alt={`Preview ${index + 1}`}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => {
          setImageLoaded(true);
          setImageError(false);
        }}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
      />

      {/* Status Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity',
          imageLoaded && imageData.status === 'pending' ? 'opacity-0' : 'opacity-100'
        )}
      >
        {imageData.status === 'uploading' && (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        )}
        {imageData.status === 'success' && (
          <CheckCircle2 className="h-5 w-5 text-green-400" />
        )}
        {imageData.status === 'error' && (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(imageData.id)}
        disabled={disabled}
        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>

      {/* File Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[0.5rem] truncate" title={imageData.file.name}>
          {imageData.file.name}
        </p>
        <p className="text-[0.5rem] text-gray-300">
          {(imageData.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
}