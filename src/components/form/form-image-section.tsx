import { MAX_FILE_SIZE, MAX_IMAGE_COUNT, SUPPORTED_IMAGE_TYPES } from '@/lib/constant';
import { ImageFile } from '@/lib/types/image-file';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Plus, UploadCloud, X, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function FormImageSection({
  images,
  setImages,
  removeImage,
}: {
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  removeImage: (id: string) => void;
}) {
  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    // This shouldn't happen, but just in case
    if (images.length >= MAX_IMAGE_COUNT) {
      toast.error(`You can only upload up to ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    let tooLargeCount = 0;
    let duplicateCount = 0;
    let unsupportedCount = 0;

    const filesToProcess = Array.from(files).filter((file) => {
      // Check if the file is an image
      if (file.size > MAX_FILE_SIZE) {
        tooLargeCount++;
        return false;
      }

      // Check if the file is already in the images array
      if (images.some((img) => img.file.name === file.name)) {
        duplicateCount++;
        return false;
      }

      // Check if the file type is supported
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        unsupportedCount++;
        return false;
      }

      return true;
    });

    // Show warnings for any issues found
    const pluralize = (count: number, singular: string, plural = `${singular}s`) => (count === 1 ? singular : plural);
    (async () => {
      if (tooLargeCount > 0) {
        toast.warning(
          `${tooLargeCount} ${pluralize(tooLargeCount, 'file', 'files')} exceed maximum size of ${
            MAX_FILE_SIZE / (1024 * 1024)
          } MB.`
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (duplicateCount > 0) {
        toast.warning(`${duplicateCount} duplicate ${pluralize(duplicateCount, 'file was', 'files were')} not added.`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (unsupportedCount > 0) {
        toast.warning(
          `${unsupportedCount} ${pluralize(
            unsupportedCount,
            'file is',
            'files are'
          )} not valid image types and not added`,
          { description: `Only JPG, PNG and WEBP images are allowed.` }
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const exceedingFileCount = filesToProcess.length + images.length - MAX_IMAGE_COUNT;
      if (exceedingFileCount > 0) {
        toast.warning(
          `${exceedingFileCount} ${pluralize(
            exceedingFileCount,
            'image was',
            'images were'
          )} ignored to fit maximum limit of ${MAX_IMAGE_COUNT}.`
        );
      }
    })();

    if (filesToProcess.length === 0) {
      return;
    }

    // Process the valid files
    const newImages: ImageFile[] = [];

    for (const file of filesToProcess.slice(0, MAX_IMAGE_COUNT - images.length)) {
      try {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id: crypto.randomUUID(),
          file,
          preview,
          status: 'pending',
        });
      } catch (error) {
        console.error('Failed to create object URL for file:', file.name, error);
        toast.error(`Failed to create preview for ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  return (
    <DragAndDropArea onDrop={handleFileSelection} showBackground={images.length === 0}>
      {images.length === 0 ? (
        <NoSelectedImage handleFileSelection={handleFileSelection} />
      ) : (
        <SelectedImagePreview images={images} removeImage={removeImage} handleFileSelection={handleFileSelection} />
      )}
    </DragAndDropArea>
  );
}

function DragAndDropArea({
  onDrop,
  children,
  showBackground = false,
}: {
  onDrop: (files: FileList) => void;
  children: React.ReactNode;
  showBackground?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onDrop(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'w-full h-full min-h-[200px] rounded-md transition-colors',
        showBackground && 'border-2 border-dashed border-less-muted bg-less-muted/30',
        isDragging && 'border-primary bg-primary/10'
      )}
    >
      {children}
    </div>
  );
}

function NoSelectedImage({ handleFileSelection }: { handleFileSelection: (files: FileList | null) => void }) {
  return (
    <div className="h-full">
      <label
        htmlFor="image-upload"
        className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center text-muted-foreground"
      >
        <UploadCloud className="h-12 w-12" />
        <span className="mt-2 font-semibold">Drag & drop images here</span>
        <span className="text-sm">or click to browse</span>
        <p className="text-xs mt-4">Up to {MAX_IMAGE_COUNT} images (PNG, JPG, WEBP)</p>
      </label>
      <input
        id="image-upload"
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        className="sr-only"
        onChange={(e) => handleFileSelection(e.target.files)}
      />
    </div>
  );
}

function SelectedImagePreview({
  images,
  removeImage,
  handleFileSelection,
}: {
  images: ImageFile[];
  removeImage: (id: string) => void;
  handleFileSelection: (files: FileList | null) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {images.map((imageFile, index) => (
        <ImagePreviewItem key={imageFile.id} imageFile={imageFile} index={index} removeImage={removeImage} />
      ))}
      {images.length < MAX_IMAGE_COUNT && (
        <div className={cn(images.length < 2 ? 'col-span-2' : 'col-span-1')}>
          <label
            htmlFor="add-more-images"
            className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-8 w-8" />
            <span className="mt-1 text-xs">Add more</span>
          </label>
          <input
            id="add-more-images"
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="sr-only"
            onChange={(e) => {
              handleFileSelection(e.target.files);
              // e.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}

function ImagePreviewItem({
  imageFile,
  index,
  removeImage,
}: {
  imageFile: ImageFile;
  index: number;
  removeImage: (id: string) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div
      className={cn(
        'relative aspect-square w-full rounded-md border-2 flex items-center justify-center bg-muted',
        index < 2 ? 'col-span-2' : 'col-span-1',
        imageFile.status === 'error' ? 'border-red-500' : 'border-muted'
      )}
    >
      {!imageError ? (
        <img
          src={imageFile.preview}
          alt={`Preview ${index}`}
          className={cn(
            'h-full w-full rounded-md object-cover object-top transition-opacity',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <XCircle className="h-8 w-8" />
          <span className="text-xs mt-1">Failed to load</span>
        </div>
      )}

      {/* Loading/Status overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-md bg-black/50 transition-opacity',
          imageLoaded && imageFile.status === 'pending' ? 'opacity-0' : 'opacity-100'
        )}
      >
        {imageFile.status === 'uploading' && <Loader2 className="h-8 w-8 animate-spin text-white" />}
        {imageFile.status === 'success' && <CheckCircle2 className="h-8 w-8 text-green-400" />}
        {imageFile.status === 'error' && <XCircle className="h-8 w-8 text-red-500" />}
      </div>

      <button
        type="button"
        onClick={() => removeImage(imageFile.id)}
        className="absolute -right-2 -top-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-md transition-transform hover:scale-110"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
