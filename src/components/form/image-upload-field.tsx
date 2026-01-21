'use client';

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFileSelect?: (file: File | null) => void;
  entityType?: 'category' | 'subcategory' | 'product';
}

export function ImageUploadField({ label, value, onChange, placeholder, onFileSelect, entityType = 'product' }: ImageUploadFieldProps) {
  const [uploadType, setUploadType] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  // Update preview when value changes externally
  useEffect(() => {
    if (value && value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create a preview using FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Store the file for later upload
    if (onFileSelect) {
      onFileSelect(file);
      toast.success(`${entityType === 'subcategory' ? 'Subcategory' : entityType === 'category' ? 'Category' : 'Product'} image selected. Will upload when saving.`);
    } else {
      toast.info('Image selected. Will upload when saving.');
    }
    
    setUploading(false);
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreviewUrl(url);
  };

  // Clear the current image
  const clearImage = () => {
    onChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
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
            onChange={() => setUploadType('url')}
            className="h-4 w-4"
          />
          <Label htmlFor="url-option">URL</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="upload-option"
            name="upload-type"
            checked={uploadType === 'upload'}
            onChange={() => setUploadType('upload')}
            className="h-4 w-4"
          />
          <Label htmlFor="upload-option">Upload</Label>
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
          />
          {value && (
            <Button type="button" variant="outline" size="icon" onClick={clearImage}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      {/* File Upload */}
      {uploadType === 'upload' && (
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <Label
            htmlFor="image-upload"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </Label>
          {uploading && (
            <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" />
            </div>
          )}
        </div>
      )}
      
      {/* Image Preview */}
      {(previewUrl || value) && (
        <div className="mt-2 flex items-center gap-2">
          <img 
            src={previewUrl || value} 
            alt="Preview" 
            className="w-16 h-16 rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-sm text-muted-foreground">Image preview</span>
        </div>
      )}
    </div>
  );
}