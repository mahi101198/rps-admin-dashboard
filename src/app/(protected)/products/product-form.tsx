'use client';

import { useState, useMemo, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Loader2, ChevronsUpDown, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AdminProductForm, 
  ProductWithDetails, 
  Category, 
  SubCategory 
} from '@/lib/types/all-schemas';
import { ImageFile } from '@/lib/types/image-file';
import FormClearButton from '@/components/form/form-clear-button';
import FormCloseButton from '@/components/form/form-close-button';
import FormDeleteButton from '@/components/form/form-delete-button';
import {
  uploadProductImageAction,
  createProductAction as addProductAction,
  updateProductAction,
  deleteProductAction,
  deleteProductImageAction,
} from '@/actions/product-actions';
import {
  getCategoriesAction,
  getSubCategoriesAction,
} from '@/actions/category-actions';
import EnhancedImageUpload from '@/components/form/enhanced-image-upload';
import { useRouter } from 'next/navigation';
import { 
  DEFAULT_SHIPPING_INFO, 
  DEFAULT_SHIPPING_INFO_TITLE, 
  DEFAULT_RETURN_POLICY_TITLE, 
  DEFAULT_RETURN_POLICY_DESCRIPTION 
} from '@/lib/constant';

const MAX_IMAGES = 6;

// Helper function to generate unique IDs
const createId = () => Math.random().toString(36).substr(2, 9);

// Helper function to optimize and compress image
const optimizeImage = (file: File, maxSize: number = 1200, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert canvas to blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
    
    // Create object URL for image source
    img.src = URL.createObjectURL(file);
  });
};

// Optimize thumbnail (smaller size)
const optimizeThumbnail = (file: File) => optimizeImage(file, 400, 0.7);

interface ProductFormProps {
  iconOnly?: boolean;
  product?: ProductWithDetails;
  mode?: 'create' | 'edit';
  onClose?: () => void;
  onDataChange?: () => void;
}

export interface ProductFormRef {
  openDialog: () => void;
  closeDialog: () => void;
}

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  ({ iconOnly = false, product, mode = 'create', onClose, onDataChange }, ref) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [miniInfoInput, setMiniInfoInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [colorInput, setColorInput] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<ImageFile | null>(null);
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [subCategoryDropdownOpen, setSubCategoryDropdownOpen] = useState(false);
    const [pendingRemovalUrls, setPendingRemovalUrls] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
    const wasDialogOpened = useRef(false);

    const isMobile = useIsMobile();
    const showDialogTrigger = mode === 'create';
    const isEditMode = mode === 'edit' && product;

    const form = useForm<AdminProductForm>({
      defaultValues: isEditMode
        ? {
            name: product?.name || '',
            mrp: product?.mrp || 0,
            price: product?.price || 0,
            discount: product?.discount || 0,
            image: product?.image || '',
            stock: product?.stock || 0,
            categoryId: product?.categoryId || '',
            subcategoryId: product?.subcategoryId || '',
            isActive: product?.isActive ?? true,
            description: product?.description || '',
            images: product?.images || [],
            miniInfo: product?.miniInfo || [],
            tags: product?.tags || [],
            colors: product?.colors || [],
            shippingInfo: product?.shippingInfo || '',
            shippingInfoTitle: product?.shippingInfoTitle || '',
            returnTitle: product?.returnTitle || '',
            returnDescription: product?.returnDescription || '',
            maxQuantityPerUser: (product as any)?.maxQuantityPerUser || 10,
          }
        : {
            name: '',
            mrp: 0,
            price: 0,
            discount: 0,
            image: '',
            stock: 0,
            categoryId: '',
            subcategoryId: '',
            isActive: true,
            description: '',
            images: [],
            miniInfo: [],
            tags: [],
            colors: [],
            shippingInfo: DEFAULT_SHIPPING_INFO,
            shippingInfoTitle: DEFAULT_SHIPPING_INFO_TITLE,
            returnTitle: DEFAULT_RETURN_POLICY_TITLE,
            returnDescription: DEFAULT_RETURN_POLICY_DESCRIPTION,
            maxQuantityPerUser: 10,
          },
    });

    // Track which field was last manually changed to prevent infinite loops
    const lastChangedField = useRef<'mrp' | 'price' | 'discount' | null>(null);
    const isCalculating = useRef(false);

    // Auto-calculate values when fields change, but prevent infinite loops
    const mrp = form.watch('mrp');
    const price = form.watch('price');
    const discount = form.watch('discount');

    // Update discount when MRP and price change (but only if price was manually changed)
    useEffect(() => {
      if (isCalculating.current) return;
      if (lastChangedField.current === 'price' && mrp > 0 && price >= 0) {
        const calculatedDiscount = Math.max(0, Math.min(100, Math.round(((mrp - price) / mrp) * 100)));
        if (Math.abs(calculatedDiscount - discount) > 0.01) { // Allow for small rounding differences
          isCalculating.current = true;
          lastChangedField.current = 'discount';
          form.setValue('discount', calculatedDiscount, { shouldValidate: true });
          setTimeout(() => { isCalculating.current = false; }, 0);
        }
      }
    }, [mrp, price, discount, form]);

    // Update price when MRP and discount change (but only if discount was manually changed)
    useEffect(() => {
      if (isCalculating.current) return;
      if (lastChangedField.current === 'discount' && mrp > 0 && discount >= 0 && discount <= 100) {
        const calculatedPrice = Math.max(0, mrp - (mrp * discount) / 100);
        const roundedPrice = Math.round(calculatedPrice * 100) / 100; // Round to 2 decimal places
        if (Math.abs(roundedPrice - price) > 0.01) { // Allow for small rounding differences
          isCalculating.current = true;
          lastChangedField.current = 'price';
          form.setValue('price', roundedPrice, { shouldValidate: true });
          setTimeout(() => { isCalculating.current = false; }, 0);
        }
      }
    }, [mrp, discount, price, form]);

    // Update price when MRP changes (but only if MRP was manually changed and we have a discount)
    useEffect(() => {
      if (isCalculating.current) return;
      if (lastChangedField.current === 'mrp' && mrp > 0 && discount >= 0 && discount <= 100) {
        const calculatedPrice = Math.max(0, mrp - (mrp * discount) / 100);
        const roundedPrice = Math.round(calculatedPrice * 100) / 100; // Round to 2 decimal places
        if (Math.abs(roundedPrice - price) > 0.01) { // Allow for small rounding differences
          isCalculating.current = true;
          lastChangedField.current = 'price';
          form.setValue('price', roundedPrice, { shouldValidate: true });
          setTimeout(() => { isCalculating.current = false; }, 0);
        }
      }
    }, [mrp, discount, price, form]);

    // Load categories and subcategories
    useEffect(() => {
      const loadCategoriesAndSubCategories = async () => {
        setLoading(true);
        try {
          const [categoriesData, subCategoriesData] = await Promise.all([
            getCategoriesAction(),
            getSubCategoriesAction()
          ]);
          setCategories(categoriesData);
          setSubCategories(subCategoriesData);
        } catch (error) {
          console.error('Error loading categories:', error);
          toast.error('Failed to load categories');
        } finally {
          setLoading(false);
        }
      };

      if (open) {
        loadCategoriesAndSubCategories();
      }
    }, [open]);

    // Update form when product changes (for edit mode)
    useEffect(() => {
      if (isEditMode && product) {
        form.reset({
          name: product.name,
          mrp: product.mrp,
          price: product.price,
          discount: product.discount,
          image: product.image,
          stock: product.stock,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          isActive: product.isActive,
          description: product.description,
          images: product.images,
          miniInfo: product.miniInfo,
          tags: product.tags,
          shippingInfo: product.shippingInfo || '',
          shippingInfoTitle: product.shippingInfoTitle || '',
          returnTitle: product.returnTitle || '',
          returnDescription: product.returnDescription || '',
          maxQuantityPerUser: (product as any)?.maxQuantityPerUser || 10,
        });
        
        // Set up thumbnail if it exists
        if (product.image) {
          const thumbnailImage: ImageFile = {
            id: createId(),
            file: new File([''], 'thumbnail', { type: 'image/jpeg' }),
            preview: product.image,
            status: 'success' as const,
            uploadedUrl: product.image,
          };
          setThumbnailFile(thumbnailImage);
        } else {
          setThumbnailFile(null);
        }

        // Set up images if they exist
        if (product.images.length > 0) {
          const existingImages: ImageFile[] = product.images.map((url: string, index: number) => ({
            id: createId(),
            file: new File([''], `existing-${index}`, { type: 'image/jpeg' }),
            preview: url,
            status: 'success' as const,
            uploadedUrl: url,
          }));
          setImageFiles(existingImages);
        } else {
          setImageFiles([]);
        }

        setMiniInfoInput('');
        setTagInput('');
        
        // Reset the last changed field tracker
        lastChangedField.current = null;
      } else if (!isEditMode) {
        // Reset for create mode
        form.reset({
          name: '',
          mrp: 0,
          price: 0,
          discount: 0,
          image: '',
          stock: 0,
          categoryId: '',
          subcategoryId: '',
          isActive: true,
          description: '',
          images: [],
          miniInfo: [],
          tags: [],
          colors: [],
          shippingInfo: DEFAULT_SHIPPING_INFO,
          shippingInfoTitle: DEFAULT_SHIPPING_INFO_TITLE,
          returnTitle: DEFAULT_RETURN_POLICY_TITLE,
          returnDescription: DEFAULT_RETURN_POLICY_DESCRIPTION,
          maxQuantityPerUser: 10,
        });
        
        // Set up thumbnail if it exists
        setThumbnailFile(null);
        setImageFiles([]);
        setMiniInfoInput('');
        setTagInput('');
        
        // Reset the last changed field tracker
        lastChangedField.current = null;
      }
    }, [product, isEditMode, form]);

    // Reset form and images when dialog is closed
    useEffect(() => {
      if (!open && wasDialogOpened.current) {
        // Small delay to ensure state updates properly
        const timer = setTimeout(() => {
          resetFormAndImages();
          onClose?.();
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, [open, onClose]);

    const isUploading = useMemo(() => 
      (thumbnailFile?.status === 'uploading') || 
      imageFiles.some((img) => img.status === 'uploading'), 
      [thumbnailFile, imageFiles]
    );

    const removeThumbnail = () => {
      if (thumbnailFile) {
        if (thumbnailFile.preview && thumbnailFile.preview.startsWith('blob:')) {
          URL.revokeObjectURL(thumbnailFile.preview);
        }

        if (thumbnailFile.uploadedUrl && !thumbnailFile.preview?.startsWith('blob:')) {
          setPendingRemovalUrls((prev) => [...prev, thumbnailFile.uploadedUrl!]);
        }
      }
      setThumbnailFile(null);
    };

    const removeImage = (id: string) => {
      const fileToRemove = imageFiles.find((file) => file.id === id);
      if (fileToRemove) {
        if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
          URL.revokeObjectURL(fileToRemove.preview);
        }

        if (fileToRemove.uploadedUrl && !fileToRemove.preview.startsWith('blob:')) {
          setPendingRemovalUrls((prev) => [...prev, fileToRemove.uploadedUrl!]);
        }
      }
      setImageFiles((prev) => prev.filter((file) => file.id !== id));
    };

    // Filter subcategories based on selected category
    const filteredSubCategories = useMemo(() => {
      const selectedCategoryId = form.watch('categoryId');
      if (!selectedCategoryId) return [];
      return subCategories.filter(sub => sub.categoryId === selectedCategoryId);
    }, [subCategories, form.watch('categoryId')]);

    const handleThumbnailUpload = async (file: File) => {
      setIsThumbnailUploading(true);
      try {
        console.log('[ProductForm] Optimizing thumbnail...');
        // Optimize and compress the thumbnail
        const optimizedBlob = await optimizeThumbnail(file);
        const optimizedFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' });
        
        console.log('[ProductForm] Thumbnail optimized. Original:', file.size, 'bytes. Optimized:', optimizedBlob.size, 'bytes');
        
        // Create ImageFile object
        const imageFile: ImageFile = {
          id: createId(),
          file: optimizedFile,
          preview: URL.createObjectURL(optimizedFile),
          status: 'pending', // Keep as pending - will upload when product is saved
        };
        
        setThumbnailFile(imageFile);
        
        // For new products, thumbnail will be uploaded after product creation
        // For existing products, we could upload immediately if needed
        if (product?.productId) {
          // Edit mode - upload immediately
          console.log('[ProductForm] Uploading thumbnail for existing product...');
          const result = await uploadProductImageAction(optimizedFile, product.productId);
          
          if (result.success && result.imageUrl) {
            setThumbnailFile({
              ...imageFile,
              status: 'success',
              uploadedUrl: result.imageUrl,
            });
            toast.success('Thumbnail uploaded and optimized successfully');
          } else {
            setThumbnailFile({
              ...imageFile,
              status: 'error',
            });
            toast.error(result.message || 'Failed to upload thumbnail');
          }
        } else {
          // Create mode - just optimize, upload later
          console.log('[ProductForm] Thumbnail optimized and ready to upload');
          toast.success('Thumbnail optimized successfully');
        }
      } catch (error) {
        console.error('[ProductForm] Error optimizing thumbnail:', error);
        toast.error('Failed to optimize thumbnail');
        if (thumbnailFile) {
          setThumbnailFile({
            ...thumbnailFile,
            status: 'error',
          });
        }
      } finally {
        setIsThumbnailUploading(false);
      }
    };

    // Function to upload thumbnail for new or existing products
    const uploadThumbnail = async (productId: string) => {
      if (!thumbnailFile || thumbnailFile.status !== 'pending') {
        return thumbnailFile?.uploadedUrl || '';
      }

      try {
        const formData = new FormData();
        formData.append('file', thumbnailFile.file);
        
        const result = await uploadProductImageAction(thumbnailFile.file, productId);
        
        if (result.success && result.imageUrl) {
          setThumbnailFile({
            ...thumbnailFile,
            status: 'success',
            uploadedUrl: result.imageUrl,
          });
          return result.imageUrl;
        } else {
          throw new Error(result.message || 'Failed to upload thumbnail');
        }
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        toast.error('Failed to upload thumbnail image');
        setThumbnailFile({
          ...thumbnailFile,
          status: 'error',
        });
        throw error;
      }
    };

    const onSubmit = async (values: AdminProductForm) => {
      // Check if thumbnail is still uploading
      if (isThumbnailUploading) {
        toast.error('Please wait for thumbnail to finish uploading.');
        return;
      }

      // Check if there are any images still uploading
      const uploadingImages = imageFiles.filter(img => img.status === 'uploading');
      if (uploadingImages.length > 0) {
        toast.error('Please wait for all images to finish uploading.');
        return;
      }

      // For edit mode, check if there are pending images
      if (isEditMode) {
        const pendingImages = imageFiles.filter(img => img.status === 'pending');
        if (pendingImages.length > 0) {
          toast.error(`Please upload all ${pendingImages.length} pending image(s) first using the "Upload Images" button.`);
          return;
        }
      }

      // Get successfully uploaded images
      const imageUrls = imageFiles
        .filter(img => img.status === 'success')
        .map((f) => f.uploadedUrl)
        .filter((url): url is string => !!url && !url.startsWith('blob:'));

      // For new products, we need at least one image selected (will upload after creation)
      // For edit mode, we need at least one uploaded image URL
      if (isEditMode && imageUrls.length < 1) {
        toast.error('At least one product image is required.');
        return;
      }
      
      if (!isEditMode && imageFiles.length < 1) {
        toast.error('At least one product image is required.');
        return;
      }

      try {
        // For new products, we need to create the product first to get the productId
        let productId = product?.productId;
        let thumbnailUrl = '';

        if (isEditMode) {
          // For existing products, upload thumbnail if needed
          if (thumbnailFile?.status === 'pending' && productId) {
            thumbnailUrl = await uploadThumbnail(productId);
          } else {
            thumbnailUrl = thumbnailFile?.uploadedUrl || imageUrls[0];
          }

          const productData: AdminProductForm = {
            ...values,
            image: thumbnailUrl,
            images: imageUrls,
          };

          const result = await updateProductAction(productId!, productData);

          if (result.success) {
            toast.success(result.message);
            // Use router.refresh() to update data without full page reload
            router.refresh();
            // Notify parent component to refresh data
            onDataChange?.();
          } else {
            toast.error(result.message);
            return;
          }
        } else {
          // For new products, create product first without images
          const tempProductData: AdminProductForm = {
            ...values,
            image: '', // Will be updated after upload
            images: [], // Will be updated after upload
          };

          const createResult = await addProductAction(tempProductData);
          
          if (!createResult.success) {
            toast.error(createResult.message);
            return;
          }
          
          productId = createResult.productId!;
          console.log('[ProductForm] Product created with ID:', productId);
          
          // Upload all pending images to Firebase Storage
          const pendingImages = imageFiles.filter(img => img.status === 'pending');
          const uploadedImageUrls: string[] = [];
          
          if (pendingImages.length > 0) {
            console.log('[ProductForm] Uploading', pendingImages.length, 'images to Firebase Storage...');
            
            for (const imageFile of pendingImages) {
              try {
                // Optimize image before uploading
                const optimizedBlob = await optimizeImage(imageFile.file, 1200, 0.8);
                const optimizedFile = new File([optimizedBlob], imageFile.file.name, { type: 'image/jpeg' });
                
                const originalSize = (imageFile.file.size / 1024).toFixed(2);
                const optimizedSize = (optimizedBlob.size / 1024).toFixed(2);
                console.log(`[ProductForm] Image optimized: ${originalSize}KB → ${optimizedSize}KB`);
                
                const uploadResult = await uploadProductImageAction(optimizedFile, productId);
                if (uploadResult.success && uploadResult.imageUrl) {
                  uploadedImageUrls.push(uploadResult.imageUrl);
                  console.log('[ProductForm] Image uploaded:', uploadResult.imageUrl);
                  
                  // Update image status to success
                  setImageFiles(prev => prev.map(img => 
                    img.id === imageFile.id 
                      ? { ...img, status: 'success', uploadedUrl: uploadResult.imageUrl }
                      : img
                  ));
                } else {
                  console.error('[ProductForm] Image upload failed:', uploadResult.message);
                  toast.error(`Failed to upload ${imageFile.file.name}`);
                }
              } catch (error) {
                console.error('[ProductForm] Error uploading image:', error);
              }
            }
            
            if (uploadedImageUrls.length === 0) {
              toast.error('Failed to upload product images');
              return;
            }
            
            console.log('[ProductForm] All images uploaded. URLs:', uploadedImageUrls);
          }
          
          // Now upload thumbnail
          if (thumbnailFile?.status === 'pending') {
            thumbnailUrl = await uploadThumbnail(productId);
          } else if (uploadedImageUrls.length > 0) {
            thumbnailUrl = uploadedImageUrls[0]; // Use first uploaded image as thumbnail
          }

          // Update product with images and thumbnail
          const finalProductData: AdminProductForm = {
            ...values,
            image: thumbnailUrl,
            images: uploadedImageUrls,
            maxQuantityPerUser: values.maxQuantityPerUser || 10,
          };

          console.log('[ProductForm] Updating product with image URLs:', finalProductData.images);
          const updateResult = await updateProductAction(productId, finalProductData);

          if (updateResult.success) {
            toast.success('Product created with images successfully!');
            // Use router.refresh() to update data without full page reload
            router.refresh();
            // Notify parent component to refresh data
            onDataChange?.();
          } else {
            toast.error(updateResult.message);
            return;
          }
        }

        resetFormAndImages();
        setOpen(false);
        onClose?.();
      } catch (error) {
        toast.error(isEditMode ? 'Failed to update product' : 'Failed to create product');
      }
    };

    const handleDelete = async (productId: string) => {
      if (!productId) return;

      setIsDeleting(true);
      try {
        const result = await deleteProductAction(productId);

        if (result.success) {
          toast.success(result.message);
          resetFormAndImages();
          setOpen(false);
          onClose?.();
          // Use router.refresh() to update data without full page reload
          router.refresh();
          // Notify parent component to refresh data
          onDataChange?.();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to delete product');
      } finally {
        setIsDeleting(false);
      }
    };

    const resetFormAndImages = () => {
      form.reset({
        name: '',
        mrp: 0,
        price: 0,
        discount: 0,
        image: '',
        stock: 0,
        categoryId: '',
        subcategoryId: '',
        isActive: true,
        description: '',
        images: [],
        miniInfo: [],
        tags: [],
        colors: [],
        shippingInfo: '',
        returnTitle: '',
        returnDescription: '',
        maxQuantityPerUser: 10,
      });
      
      // Clean up thumbnail
      if (thumbnailFile?.preview && thumbnailFile.preview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailFile.preview);
      }
      
      // Clean up image files
      imageFiles.forEach((file) => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      setThumbnailFile(null);
      setImageFiles([]);
      setMiniInfoInput('');
      setTagInput('');
      setPendingRemovalUrls([]);
      
      // Reset calculation tracking
      lastChangedField.current = null;
      isCalculating.current = false;
    };

    // Imperative API for external control
    useImperativeHandle(ref, () => ({
      openDialog: () => {
        setOpen(true);
        wasDialogOpened.current = true;
      },
      closeDialog: () => {
        setOpen(false);
      },
    }));

    // Check if form is dirty (has changes)
    const isFormDirty = useMemo(() => {
      return form.formState.isDirty || !!thumbnailFile || imageFiles.length > 0;
    }, [form.formState.isDirty, thumbnailFile, imageFiles]);

    return (
      <Dialog open={open} onOpenChange={(isOpen: boolean) => {
        // Prevent closing if form is dirty
        if (open && !isOpen && isFormDirty) {
          // Don't close if form is dirty
          return;
        }
        setOpen(isOpen);
        if (isOpen) {
          wasDialogOpened.current = true;
        }
      }}>
        {showDialogTrigger && (
          <DialogTrigger asChild>
            {iconOnly ? (
              <Button>
                <Plus />
              </Button>
            ) : (
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus />
                <span>Add New Product</span>
              </Button>
            )}
          </DialogTrigger>
        )}
        <DialogContent
          showCloseButton={false}
          className="flex flex-col max-w-screen-sm h-[85vh] p-0 sm:max-w-screen-md sm:h-[80vh]"
          onEscapeKeyDown={(e) => isFormDirty && e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Fixed Header */}
          <DialogHeader className="flex-shrink-0 px-4 py-4 border-b">
            <DialogTitle className="text-lg">{isEditMode ? 'Edit Product' : 'Add a New Product'}</DialogTitle>
            <DialogDescription className="text-xs">
              {isEditMode 
                ? 'Update the product information and images below.' 
                : 'Fill in the product details and upload images to add a new product to your inventory.'}
            </DialogDescription>
            <FormClearButton
              isFormDirty={isFormDirty}
              onClick={resetFormAndImages}
            />
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {/* Left Side: Image Upload */}
                <div className="space-y-4">
                  {/* Thumbnail Upload */}
                  <div className="space-y-3">
                    <FormLabel className="text-xs">Thumbnail Image (Optimized)</FormLabel>
                    <div className="border-2 border-dashed rounded-lg p-3">
                      {thumbnailFile ? (
                        <div className="relative">
                          <img 
                            src={thumbnailFile.preview} 
                            alt="Thumbnail preview" 
                            className="w-full h-32 object-cover rounded-md md:h-40"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-1"
                            onClick={removeThumbnail}
                            disabled={thumbnailFile.status === 'uploading'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {thumbnailFile.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                            </div>
                          )}
                          {thumbnailFile.status === 'error' && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center rounded-md">
                              <span className="text-white text-xs">Error</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <div className="border-2 border-dashed rounded-lg w-12 h-12 flex items-center justify-center">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Click to upload thumbnail
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="thumbnail-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleThumbnailUpload(file);
                              }
                            }}
                          />
                          <FormLabel htmlFor="thumbnail-upload">
                            <Button type="button" variant="outline" size="sm" asChild className="h-7 text-xs">
                              <span>Choose File</span>
                            </Button>
                          </FormLabel>
                          <p className="text-[0.6rem] text-muted-foreground mt-1 text-center">
                            Optimized for faster loading (max 400x400)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="space-y-3">
                    <FormLabel className="text-xs">Product Images</FormLabel>
                    <EnhancedImageUpload 
                      images={imageFiles} 
                      setImages={setImageFiles} 
                      removeImage={removeImage}
                      productId={product?.productId}
                    />
                  </div>
                </div>

                {/* Right Side: Product Form */}
                <div className="space-y-4">
                  {/* Product Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name..." {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Colors Field - Added between Price and Description sections */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs">Colors</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('colors')?.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                        >
                          <span>{color}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentColors = form.getValues('colors') || [];
                              form.setValue(
                                'colors',
                                currentColors.filter((_, i) => i !== index)
                              );
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a color..."
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (colorInput.trim()) {
                              const currentColors = form.getValues('colors') || [];
                              form.setValue('colors', [...currentColors, colorInput.trim()]);
                              setColorInput('');
                            }
                          }
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (colorInput.trim()) {
                            const currentColors = form.getValues('colors') || [];
                            form.setValue('colors', [...currentColors, colorInput.trim()]);
                            setColorInput('');
                          }
                        }}
                        className="h-8 text-xs"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description..." 
                            rows={2}
                            {...field} 
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Price, Discount and Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="mrp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">MRP (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="199.99"
                              {...field}
                              onChange={(e) => {
                                lastChangedField.current = 'mrp';
                                field.onChange(parseFloat(e.target.value) || 0);
                              }}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Selling Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="99.99"
                              {...field}
                              onChange={(e) => {
                                lastChangedField.current = 'price';
                                field.onChange(parseFloat(e.target.value) || 0);
                              }}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Discount %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="50"
                              {...field}
                              onChange={(e) => {
                                lastChangedField.current = 'discount';
                                field.onChange(parseFloat(e.target.value) || 0);
                              }}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="28"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxQuantityPerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Max Qty Per User</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                
                  {/* Pricing Summary */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">Pricing Summary</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">MRP</p>
                        <p className="font-medium">₹{mrp.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Selling Price</p>
                        <p className="font-medium">₹{price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">You Save</p>
                        <p className="font-medium text-green-600">
                          ₹{(mrp - price).toFixed(2)} ({discount.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category and Subcategory */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Category</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset subcategory when category changes
                              form.setValue('subcategoryId', '');
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="text-sm">
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcategoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Sub Category</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                            disabled={!form.watch('categoryId')}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select sub category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredSubCategories.map((subCategory) => (
                                <SelectItem key={subCategory.id} value={subCategory.id} className="text-sm">
                                  {subCategory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Mini Info Field */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs">Mini Info</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add mini info about product..."
                        value={miniInfoInput}
                        onChange={(e) => setMiniInfoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (miniInfoInput.trim()) {
                              const currentMiniInfo = form.getValues('miniInfo') || [];
                              form.setValue('miniInfo', [...currentMiniInfo, miniInfoInput.trim()]);
                              
                              // Also add to description
                              const currentDescription = form.getValues('description') || '';
                              const newDescription = currentDescription 
                                ? `${currentDescription}\n- ${miniInfoInput.trim()}`
                                : `- ${miniInfoInput.trim()}`;
                              form.setValue('description', newDescription);
                              
                              setMiniInfoInput('');
                            }
                          }
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (miniInfoInput.trim()) {
                            const currentMiniInfo = form.getValues('miniInfo') || [];
                            form.setValue('miniInfo', [...currentMiniInfo, miniInfoInput.trim()]);
                            
                            // Also add to description
                            const currentDescription = form.getValues('description') || '';
                            const newDescription = currentDescription 
                              ? `${currentDescription}\n- ${miniInfoInput.trim()}`
                              : `- ${miniInfoInput.trim()}`;
                            form.setValue('description', newDescription);
                            
                            setMiniInfoInput('');
                          }
                        }}
                        className="h-8 text-xs"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {form.watch('miniInfo')?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {form.watch('miniInfo').map((info, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md text-xs"
                          >
                            <span>{info}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentMiniInfo = form.getValues('miniInfo') || [];
                                const removedItem = currentMiniInfo[index];
                                form.setValue(
                                  'miniInfo',
                                  currentMiniInfo.filter((_, i) => i !== index)
                                );
                                
                                // Also remove from description
                                const currentDescription = form.getValues('description') || '';
                                const updatedDescription = currentDescription
                                  .split('\n')
                                  .filter(line => line.trim() !== `- ${removedItem}`)
                                  .join('\n')
                                  .trim();
                                form.setValue('description', updatedDescription);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Field */}
                  <div className="space-y-2">
                    <FormLabel className="text-xs">Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tags for search..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (tagInput.trim()) {
                              const currentTags = form.getValues('tags') || [];
                              form.setValue('tags', [...currentTags, tagInput.trim()]);
                              setTagInput('');
                            }
                          }
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (tagInput.trim()) {
                            const currentTags = form.getValues('tags') || [];
                            form.setValue('tags', [...currentTags, tagInput.trim()]);
                            setTagInput('');
                          }
                        }}
                        className="h-8 text-xs"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {form.watch('tags')?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {form.watch('tags').map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-xs"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentTags = form.getValues('tags') || [];
                                form.setValue(
                                  'tags',
                                  currentTags.filter((_, i) => i !== index)
                                );
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Is Active Field */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs">Product Status</FormLabel>
                          <p className="text-[0.65rem] text-muted-foreground">
                            Inactive products will not be visible in the store.
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Shipping Information */}
                  <FormField
                    control={form.control}
                    name="shippingInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Shipping Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter shipping information..." 
                            rows={2}
                            {...field} 
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Shipping Information Title */}
                  <FormField
                    control={form.control}
                    name="shippingInfoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Shipping Information Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter shipping information title..." {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Refund Title */}
                  <FormField
                    control={form.control}
                    name="returnTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Return Policy Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter return policy title..." {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Refund Description */}
                  <FormField
                    control={form.control}
                    name="returnDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Return Policy Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter return policy description..." 
                            rows={3}
                            {...field} 
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="flex-shrink-0 px-4 py-3 border-t bg-muted/30">
            <div className="flex items-center justify-between w-full flex-col sm:flex-row gap-3">
              <span className="hidden sm:block text-[0.6rem] flex-1 text-muted-foreground text-center">
                Press <kbd className="px-1 py-0.5 text-[0.6rem] bg-muted border rounded">Ctrl</kbd> +{' '}
                <kbd className="px-1 py-0.5 text-[0.6rem] bg-muted border rounded">Enter</kbd> to save
              </span>
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <FormCloseButton
                  isFormDirty={isFormDirty}
                  onClick={() => {
                    resetFormAndImages();
                    setOpen(false);
                    onClose?.();
                  }}
                />
                {isEditMode && (
                  <FormDeleteButton 
                    productId={product?.productId} 
                    onDelete={handleDelete} 
                    isDeleting={isDeleting} 
                  />
                )}
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isUploading || form.formState.isSubmitting || isDeleting}
                  className="w-full sm:w-auto text-xs h-8"
                  size="sm"
                >
                  {isUploading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  {isUploading
                    ? 'Uploading...'
                    : form.formState.isSubmitting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Saving...'
                    : isEditMode
                    ? 'Update Product'
                    : 'Save Product'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ProductForm.displayName = 'ProductForm';
