'use client';

/**
 * ⚠️ DEPRECATED - Use MultiMediaUpload instead!
 * 
 * This component has been replaced by MultiMediaUpload which supports both images AND videos.
 * 
 * If you're adding images to a product gallery, use:
 * @see MultiMediaUpload from './multi-media-upload'
 * 
 * This component is kept for backward compatibility only.
 * @deprecated Use MultiMediaUpload for new features
 */

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedImage {
  id: string;
  url: string;
  altText: string;
  uploading: boolean;
  error?: string;
}

interface MultiImageUploadProps {
  label: string;
  value: Array<{ url: string; alt_text: string }>;
  onChange: (images: Array<{ url: string; alt_text: string }>) => void;
  placeholder?: string;
  disabled?: boolean;
  productId?: string;
  imageType?: 'gallery' | 'sku';
  maxFiles?: number;
}

export function MultiImageUpload({
  label,
  value = [],
  onChange,
  placeholder,
  disabled,
  productId,
  imageType = 'gallery',
  maxFiles = 10
}: MultiImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    value.map((img, idx) => ({
      id: `existing_${idx}`,
      url: img.url,
      altText: img.alt_text || '',
      uploading: false
    }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingOnChange, setPendingOnChange] = useState(false);

  // Use effect to handle deferred onChange calls to avoid React rendering issues
  useEffect(() => {
    if (pendingOnChange) {
      const validImages = uploadedImages
        .filter(img => img.url && !img.error)
        .map(img => ({
          url: img.url,
          alt_text: img.altText
        }));
      onChange(validImages);
      setPendingOnChange(false);
    }
  }, [uploadedImages, pendingOnChange, onChange]);

  // Handle multiple file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !productId) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files limit
    const totalFiles = uploadedImages.length + files.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed. You can upload ${maxFiles - uploadedImages.length} more.`);
      return;
    }

    setIsUploading(true);

    try {
      const { uploadProductImageAction } = await import('@/actions/product-details-actions');
      
      // Create placeholder entries for each file
      const newImageIds = files.map(() => `temp_${Date.now()}_${Math.random()}`);
      const placeholders: UploadedImage[] = files.map((file, idx) => ({
        id: newImageIds[idx],
        url: '',
        altText: file.name.replace(/\.[^/.]+$/, ''), // Use filename as default alt text
        uploading: true
      }));

      setUploadedImages(prev => [...prev, ...placeholders]);

      // Upload all files in parallel
      const uploadPromises = files.map(async (file, idx) => {
        try {
          // Validate file type
          if (!file.type.match('image.*')) {
            throw new Error('Please select image files (JPEG, PNG, WEBP)');
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
          }

          const result = await uploadProductImageAction(file, productId, imageType);

          if (result.success && result.imageUrl) {
            return {
              id: newImageIds[idx],
              url: result.imageUrl,
              altText: placeholders[idx].altText,
              success: true
            };
          } else {
            throw new Error(result.message || 'Failed to upload image');
          }
        } catch (error: any) {
          return {
            id: newImageIds[idx],
            error: error.message || 'Upload failed',
            success: false
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      // Update state with results
      setUploadedImages(prev => {
        const updated = prev.map(img => {
          const result = results.find(r => r.id === img.id);
          if (result) {
            if (result.success) {
              return {
                ...img,
                url: result.url!,
                uploading: false
              };
            } else {
              return {
                ...img,
                uploading: false,
                error: result.error
              };
            }
          }
          return img;
        });
        return updated;
      });
      
      // Mark that onChange needs to be called
      setPendingOnChange(true);

      // Show summary toast
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} image${successCount !== 1 ? 's' : ''} uploaded successfully`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} image${failureCount !== 1 ? 's' : ''} failed to upload`);
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error('Error uploading images');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Update alt text for an image
  const updateAltText = (id: string, altText: string) => {
    setUploadedImages(prev => {
      const updated = prev.map(img =>
        img.id === id ? { ...img, altText } : img
      );
      return updated;
    });
    setPendingOnChange(true);
  };

  // Remove an image
  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      return updated;
    });
    setPendingOnChange(true);
  };

  // Retry failed upload
  const retryUpload = async (id: string) => {
    const image = uploadedImages.find(img => img.id === id);
    if (!image || !productId || image.uploading) return;

    // For now, we need the original file to retry
    // This would require storing the file reference
    toast.info('Please re-upload the image file');
  };

  const canAddMore = uploadedImages.length < maxFiles;

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Upload Button */}
      {canAddMore && (
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id={`multi-image-upload-${imageType}`}
            multiple
            disabled={disabled || isUploading || !productId}
          />
          <Label
            htmlFor={`multi-image-upload-${imageType}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
              disabled || !productId || isUploading
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Choose Files
              </>
            )}
          </Label>
          <span className="text-sm text-muted-foreground pt-2">
            {uploadedImages.length}/{maxFiles}
          </span>
        </div>
      )}

      {!productId && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2">
          <p className="text-sm text-amber-800">
            Save the product first to upload images directly.
          </p>
        </div>
      )}

      {/* Uploaded Images List */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} selected
          </p>

          {uploadedImages.map((image, index) => (
            <div key={image.id} className="p-3 border rounded-lg bg-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Image #{index + 1}</span>
                    {image.uploading && (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    )}
                    {!image.uploading && !image.error && image.url && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {image.error && (
                      <span className="text-xs text-red-600">Error: {image.error}</span>
                    )}
                  </div>

                  {/* Alt Text Input */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Alt Text</label>
                    <Input
                      type="text"
                      placeholder="Enter description for this image"
                      value={image.altText}
                      onChange={(e) => updateAltText(image.id, e.target.value)}
                      disabled={disabled || image.uploading}
                      className="text-sm h-8"
                    />
                  </div>

                  {/* Image Preview */}
                  {image.url && (
                    <div className="mt-2">
                      <img
                        src={image.url}
                        alt={image.altText || `Image ${index + 1}`}
                        className="max-w-full h-auto rounded border max-h-24"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  {image.error && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => retryUpload(image.id)}
                      className="text-xs h-8"
                    >
                      Retry
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImage(image.id)}
                    className="h-8 w-8 flex-shrink-0"
                    disabled={disabled || image.uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
