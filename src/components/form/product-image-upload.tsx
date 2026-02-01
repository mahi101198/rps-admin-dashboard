'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  productId?: string;
  imageType?: 'main' | 'gallery' | 'sku';
}

export function ProductImageUpload({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  disabled,
  productId,
  imageType = 'main'
}: ProductImageUploadProps) {
  const [uploadType, setUploadType] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !productId) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Show preview while uploading
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Upload the file
      const { uploadProductImageAction } = await import('@/actions/product-details-actions');
      const result = await uploadProductImageAction(file, productId, imageType);
      
      if (result.success && result.imageUrl) {
        // Set the actual URL from server
        onChange(result.imageUrl);
        setPreviewUrl(result.imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const url = e.target.value;
    onChange(url);
    setPreviewUrl(url);
  };

  // Clear the current image
  const clearImage = () => {
    if (disabled) return;
    
    onChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Upload Type Selection */}
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="url-option"
            name="upload-type"
            checked={uploadType === 'url'}
            onChange={() => !disabled && setUploadType('url')}
            className="h-4 w-4"
            disabled={disabled}
          />
          <Label htmlFor="url-option">URL</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="upload-option"
            name="upload-type"
            checked={uploadType === 'upload'}
            onChange={() => !disabled && setUploadType('upload')}
            className="h-4 w-4"
            disabled={disabled || !productId}
          />
          <Label htmlFor="upload-option">Upload {!productId && '(Save product first)'}</Label>
        </div>
      </div>
      
      {/* URL Input */}
      {uploadType === 'url' && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder={placeholder || "https://example.com/image.png"}
            value={value}
            onChange={handleUrlChange}
            disabled={disabled}
          />
          {value && !disabled && (
            <Button type="button" variant="outline" size="icon" onClick={clearImage}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      {/* File Upload */}
      {uploadType === 'upload' && (
        <div className="space-y-2">
          {!productId && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2">
              <p className="text-sm text-amber-800">
                Save the product first to upload images directly. Or use the URL option above.
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id={`product-image-upload-${imageType}`}
              disabled={disabled || uploading || !productId}
            />
            <Label
              htmlFor={`product-image-upload-${imageType}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                disabled || !productId
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer'
              }`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Label>
            {uploading && (
              <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" />
              </div>
            )}
            {value && !uploading && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>
      )}
      
      {/* Image Preview */}
      {(previewUrl || value) && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">Image preview</p>
          <div className="relative inline-block">
            <img 
              src={previewUrl || value} 
              alt="Product preview" 
              className="max-w-full h-auto rounded border"
              style={{ maxHeight: '200px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {(previewUrl || value) && !disabled && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={clearImage}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}