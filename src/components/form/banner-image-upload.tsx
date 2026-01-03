'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface BannerImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BannerImageUpload({ label, value, onChange, placeholder }: BannerImageUploadProps) {
  const [uploadType, setUploadType] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    // Store the selected file and show preview
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    toast.info('Image selected. Will upload when saving the banner.');
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreviewUrl(url);
    setSelectedFile(null); // Clear selected file when using URL
  };

  // Clear the current image
  const clearImage = () => {
    onChange('');
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to get the selected file (to be called by parent components)
  const getFile = () => selectedFile;

  // Expose getFile function to parent components
  (BannerImageUpload as any).getFile = getFile;

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
            id="banner-image-upload"
            disabled={uploading}
          />
          <Label
            htmlFor="banner-image-upload"
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
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">Image preview</p>
          <div className="relative inline-block">
            <img 
              src={previewUrl || value} 
              alt="Banner preview" 
              className="max-w-full h-auto rounded border"
              style={{ maxHeight: '200px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {(previewUrl || value) && (
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