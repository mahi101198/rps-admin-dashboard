'use client';

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedMedia {
  id: string;
  url: string;
  videoUrl: string;
  type: 'image' | 'video'; // Type indicator
  altText: string;
  uploading: boolean;
  error?: string;
}

interface MediaItem {
  url?: string;
  videoUrl?: string;
  alt_text: string;
  type?: 'image' | 'video';
}

interface MultiMediaUploadProps {
  label: string;
  value: Array<MediaItem>;
  onChange: (media: Array<MediaItem>) => void;
  placeholder?: string;
  disabled?: boolean;
  productId?: string;
  imageType?: 'gallery' | 'sku';
  maxFiles?: number;
}

export function MultiMediaUpload({
  label,
  value = [],
  onChange,
  placeholder,
  disabled,
  productId,
  imageType = 'gallery',
  maxFiles = 10
}: MultiMediaUploadProps) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>(
    value.map((media, idx) => ({
      id: `existing_${idx}`,
      url: media.url || '',
      videoUrl: media.videoUrl || '',
      type: media.type || (media.videoUrl ? 'video' : 'image'),
      altText: media.alt_text || '',
      uploading: false
    }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingOnChange, setPendingOnChange] = useState(false);

  // Use effect to handle deferred onChange calls
  useEffect(() => {
    if (pendingOnChange) {
      const validMedia = uploadedMedia
        .filter(m => (m.url || m.videoUrl) && !m.error)
        .map(m => ({
          ...(m.type === 'image' ? { url: m.url } : { videoUrl: m.videoUrl }),
          alt_text: m.altText,
          type: m.type
        }));
      onChange(validMedia);
      setPendingOnChange(false);
    }
  }, [uploadedMedia, pendingOnChange, onChange]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !productId) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = uploadedMedia.length + files.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} media allowed. You can upload ${maxFiles - uploadedMedia.length} more.`);
      return;
    }

    setIsUploading(true);

    try {
      const { uploadProductImageAction } = await import('@/actions/product-details-actions');
      
      const newMediaIds = files.map(() => `temp_${Date.now()}_${Math.random()}`);
      const placeholders: UploadedMedia[] = files.map((file, idx) => {
        // Determine type based on file extension
        const isVideo = file.type.startsWith('video/');
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        
        return {
          id: newMediaIds[idx],
          url: '',
          videoUrl: '',
          type: isVideo ? 'video' : 'image',
          altText: fileName,
          uploading: true
        };
      });

      setUploadedMedia(prev => [...prev, ...placeholders]);

      // Upload all files in parallel
      const uploadPromises = files.map(async (file, idx) => {
        try {
          // Determine media type
          const isVideo = file.type.startsWith('video/');

          if (isVideo) {
            // Validate video type
            if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(file.type)) {
              throw new Error('Only MP4, WebM, OGG, and MOV video formats supported');
            }
            // Validate video size (max 100MB for videos)
            if (file.size > 100 * 1024 * 1024) {
              throw new Error('Video file size must be less than 100MB');
            }
          } else {
            // Validate image
            if (!file.type.match('image.*')) {
              throw new Error('Please select image files (JPEG, PNG, WEBP)');
            }
            // Validate image size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
              throw new Error('Image file size must be less than 5MB');
            }
          }

          // Upload using the image action (handles both images and videos)
          const result = await uploadProductImageAction(file, productId, imageType);

          if (result.success && result.imageUrl) {
            return {
              id: newMediaIds[idx],
              url: isVideo ? '' : result.imageUrl,
              videoUrl: isVideo ? result.imageUrl : '',
              type: isVideo ? 'video' : 'image',
              altText: placeholders[idx].altText,
              success: true
            };
          } else {
            throw new Error(result.message || 'Failed to upload file');
          }
        } catch (error: any) {
          return {
            id: newMediaIds[idx],
            error: error.message || 'Upload failed',
            success: false
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Update state with results
      setUploadedMedia(prev => {
        const updated: UploadedMedia[] = prev.map(media => {
          const result = results.find(r => r.id === media.id);
          if (result) {
            if (result.success) {
              return {
                ...media,
                url: result.url || '',
                videoUrl: result.videoUrl || '',
                type: (result.type as 'image' | 'video') || media.type,
                uploading: false
              };
            } else {
              return {
                ...media,
                uploading: false,
                error: result.error
              };
            }
          }
          return media;
        });
        return updated;
      });

      setPendingOnChange(true);

      // Show summary toast
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} file${successCount !== 1 ? 's' : ''} uploaded successfully`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} file${failureCount !== 1 ? 's' : ''} failed to upload`);
      }
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast.error('Error uploading media');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Update alt text
  const updateAltText = (id: string, altText: string) => {
    setUploadedMedia(prev => {
      const updated = prev.map(media =>
        media.id === id ? { ...media, altText } : media
      );
      return updated;
    });
    setPendingOnChange(true);
  };

  // Remove media
  const removeMedia = (id: string) => {
    setUploadedMedia(prev => {
      const updated = prev.filter(media => media.id !== id);
      return updated;
    });
    setPendingOnChange(true);
  };

  const canAddMore = uploadedMedia.length < maxFiles;

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Upload Button */}
      {canAddMore && (
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
            id={`multi-media-upload-${imageType}`}
            multiple
            disabled={disabled || isUploading || !productId}
          />
          <Label
            htmlFor={`multi-media-upload-${imageType}`}
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
                Choose Files (Images & Videos)
              </>
            )}
          </Label>
          <span className="text-sm text-muted-foreground pt-2">
            {uploadedMedia.length}/{maxFiles}
          </span>
        </div>
      )}

      {!productId && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2">
          <p className="text-sm text-amber-800">
            Save the product first to upload media directly.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
        <p>📁 Supported: Images (JPG, PNG, WebP) • Videos (MP4, WebM, OGG, MOV)</p>
        <p>📊 Limits: Images ≤5MB • Videos ≤100MB</p>
      </div>

      {/* Media List */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {uploadedMedia.length} media item{uploadedMedia.length !== 1 ? 's' : ''} selected
          </p>

          {uploadedMedia.map((media, index) => (
            <div key={media.id} className="p-3 border rounded-lg bg-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">
                      {media.type === 'video' ? '🎬 Video' : '🖼️ Image'} #{index + 1}
                    </span>
                    {media.uploading && (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    )}
                    {!media.uploading && !media.error && (media.url || media.videoUrl) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {media.error && (
                      <span className="text-xs text-red-600">Error: {media.error}</span>
                    )}
                  </div>

                  {/* Alt Text Input */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Alt Text / Description</label>
                    <Input
                      type="text"
                      placeholder={media.type === 'video' ? "Video description..." : "Image description..."}
                      value={media.altText}
                      onChange={(e) => updateAltText(media.id, e.target.value)}
                      disabled={disabled || media.uploading}
                      className="text-sm h-8"
                    />
                  </div>

                  {/* Media Preview */}
                  {(media.url || media.videoUrl) && (
                    <div className="mt-2">
                      {media.type === 'video' ? (
                        <div className="relative bg-black rounded border max-h-32 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white opacity-70" />
                          <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            Video
                          </span>
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={media.altText || `Media ${index + 1}`}
                          className="max-w-full h-auto rounded border max-h-24"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  {media.error && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info('Please re-upload the file');
                      }}
                      className="text-xs h-8"
                    >
                      Retry
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeMedia(media.id)}
                    className="h-8 w-8 flex-shrink-0"
                    disabled={disabled || media.uploading}
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
