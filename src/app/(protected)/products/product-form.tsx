'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Minus,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { 
  createSkuProductAction,
  updateSkuProductAction,
  deleteSkuProductAction
} from '@/actions/product-details-actions';
import { 
  getCategoriesAction,
  getSubCategoriesByCategoryAction
} from '@/actions/category-actions';
import { 
  ProductDetailsDocument,
  ProductSKU,
  ContentCard,
  ContentCardType,
  ProductMedia
} from '@/lib/types/product-details-sku';
import { Category, SubCategory } from '@/lib/types/all-schemas';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProductImageUpload } from '@/components/form/product-image-upload';

// Define Zod schema for validation - SCHEMA COMPLIANT with ALL constraints
const productSchema = z.object({
  product_id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be max 100 characters'),
  subtitle: z.string().min(1, 'Subtitle is required').max(150, 'Subtitle must be max 150 characters'),
  brand: z.string().optional(), // Schema: optional field
  category: z.string().min(1, 'Category is required'),
  sub_category: z.string().min(1, 'Sub-category is required'),
  is_active: z.boolean().default(true),
  
  media: z.object({
    main_image: z.object({
      url: z.string().min(1, 'Main image URL required').url('Must be a valid URL'),
      alt_text: z.string().min(1, 'Alt text required')
    }),
    gallery: z.array(z.object({
      url: z.string().min(1, 'Gallery image URL required').url('Must be a valid URL'),
      alt_text: z.string().min(1, 'Gallery alt text required')
    })).default([])
  }),
  
  variant_attributes: z.record(z.array(z.string())).default({}),
  
  product_skus: z.array(z.object({
    sku_id: z.string().min(1, 'SKU ID is required'),
    attributes: z.object({
      color: z.string().optional(),
      size: z.string().optional(),
      pack: z.string().optional(),
      gsm: z.string().optional(),
      type: z.string().optional()
    }).optional(),
    price: z.number().min(0, 'Price must be >= 0'),
    mrp: z.number().min(0, 'MRP must be >= 0'),
    currency: z.string().default('INR'),
    availability: z.enum(['in_stock', 'limited', 'out_of_stock']),
    available_quantity: z.number().min(0, 'Quantity must be >= 0')
  }).refine(
    (sku) => sku.mrp >= sku.price,
    { message: 'MRP must be >= Price', path: ['mrp'] }
  )).min(1, 'At least one SKU is required'),
  
  overall_availability: z.enum(['in_stock', 'limited', 'out_of_stock']),
  
  content_cards: z.array(z.object({
    card_id: z.string().min(1, 'Card ID required'),
    title: z.string().min(1, 'Card title required'),
    type: z.string(),
    order: z.number().min(1, 'Order required'),
    data: z.union([z.string(), z.array(z.string()), z.record(z.string())])
  })).min(1, 'At least one content card is required'),
  
  delivery_info: z.object({
    estimated_delivery: z.string().min(1, 'Estimated delivery required'),
    return_policy: z.string().min(1, 'Return policy required'),
    cod_available: z.boolean(),
    free_delivery_threshold: z.number().optional()
  }),
  
  rating: z.object({
    average: z.number().min(0).max(5).default(0),
    count: z.number().min(0).default(0)
  }),
  
  purchase_limits: z.object({
    max_per_order: z.number().min(1, 'Max per order required'),
    max_per_user_per_day: z.number().optional()
  })
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: ProductDetailsDocument;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSubmitSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // State to track all images for comprehensive preview
  const [allImages, setAllImages] = useState({
    mainImage: product?.media?.main_image?.url || '',
    gallery: product?.media?.gallery || [],
    skuImages: product?.product_skus?.filter(sku => sku.pricing) || []
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_id: product?.product_id || '',
      title: product?.title || '',
      subtitle: product?.subtitle || '',
      brand: product?.brand || '',
      category: product?.category || '',
      sub_category: product?.sub_category || '',
      is_active: product?.is_active ?? true,
      media: {
        main_image: {
          url: product?.media?.main_image?.url || '',
          alt_text: product?.media?.main_image?.alt_text || ''
        },
        gallery: product?.media?.gallery || []
      },
      variant_attributes: product?.variant_attributes || {},
      product_skus: product?.product_skus || [{
        sku_id: '',
        attributes: {
          color: '',
          size: '',
          pack: '',
          gsm: ''
        },
        price: 0,
        mrp: 0,
        currency: 'INR',
        availability: 'in_stock',
        available_quantity: 0
      }],
      overall_availability: product?.overall_availability || 'in_stock',
      content_cards: product?.content_cards || [
        {
          card_id: 'highlights',
          title: 'Highlights',
          type: 'list',
          order: 1,
          data: []
        },
        {
          card_id: 'description',
          title: 'Product Description',
          type: 'text',
          order: 2,
          data: ''
        },
        {
          card_id: 'specifications',
          title: 'Specifications',
          type: 'key_value',
          order: 3,
          data: {}
        }
      ],
      delivery_info: {
        estimated_delivery: product?.delivery_info?.estimated_delivery || '3-5 business days',
        return_policy: product?.delivery_info?.return_policy || '7 days return',
        cod_available: product?.delivery_info?.cod_available ?? true,
        free_delivery_threshold: product?.delivery_info?.free_delivery_threshold || 499
      },
      rating: {
        average: product?.rating?.average || 0,
        count: product?.rating?.count || 0
      },
      purchase_limits: {
        max_per_order: product?.purchase_limits?.max_per_order || 50,
        max_per_user_per_day: product?.purchase_limits?.max_per_user_per_day
      }
    } as ProductFormValues
  });

  // Helper function to upload a file and return the URL
  const uploadImageFile = async (file: File, productId: string, imageType: 'main' | 'gallery' | 'sku'): Promise<string> => {
    try {
      const { uploadProductImageAction } = await import('@/actions/product-details-actions');
      const result = await uploadProductImageAction(file, productId, imageType);
      
      if (result.success && result.imageUrl) {
        return result.imageUrl;
      } else {
        console.error('Image upload failed:', result.message);
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    
    try {
      // Generate product_id if not provided
      const newProductId = data.product_id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate overall_availability from SKUs
      const hasInStock = data.product_skus.some(sku => sku.availability === 'in_stock');
      const hasLimited = data.product_skus.some(sku => sku.availability === 'limited');
      const overallAvailability: 'in_stock' | 'limited' | 'out_of_stock' = hasInStock ? 'in_stock' : (hasLimited ? 'limited' : 'out_of_stock');
      
      // Prepare the payload matching NEW SCHEMA
      const productPayload: ProductDetailsDocument = {
        product_id: newProductId,
        title: data.title,
        subtitle: data.subtitle,
        brand: data.brand,
        category: data.category,
        sub_category: data.sub_category,
        media: data.media,
        variant_attributes: data.variant_attributes,
        product_skus: data.product_skus,
        overall_availability: overallAvailability,
        content_cards: data.content_cards,
        delivery_info: data.delivery_info,
        rating: data.rating,
        purchase_limits: data.purchase_limits,
        is_active: data.is_active,
        created_at: "__SERVER_TIMESTAMP__",
        updated_at: "__SERVER_TIMESTAMP__"
      };
      
      // Log the prepared payload
      console.log('Product payload ready for submission:', productPayload);
      
      if (product) {
        // Update existing product
        const result = await updateSkuProductAction(
          product.product_id,
          productPayload as Partial<ProductDetailsDocument>
        );
        
        if (result.success) {
          toast.success('Product updated successfully');
          onSubmitSuccess?.();
        } else {
          console.error('Update failed:', result);
          toast.error(result.message || 'Failed to update product');
        }
      } else {
        // Create new product
        const result = await createSkuProductAction(productPayload);
        
        if (result.success) {
          toast.success('Product created successfully');
          onSubmitSuccess?.();
        } else {
          console.error('Creation failed:', result);
          toast.error(result.message || 'Failed to create product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('An error occurred while saving the product');
    } finally {
      setLoading(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getCategoriesAction();
        setCategories(data);
        
        // After categories are loaded, if editing a product, set the category ID
        if (product?.category) {
          const foundCategory = data.find(cat => cat.name === product.category);
          if (foundCategory) {
            setSelectedCategoryId(foundCategory.id);
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [product?.category]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!selectedCategoryId) {
        setSubcategories([]);
        return;
      }
      try {
        const data = await getSubCategoriesByCategoryAction(selectedCategoryId);
        setSubcategories(data);
      } catch (error) {
        console.error('Failed to load subcategories:', error);
        toast.error('Failed to load subcategories');
      }
    };
    loadSubcategories();
  }, [selectedCategoryId]);

  // Add a new SKU
  const addSku = () => {
    const skus = form.getValues('product_skus') || [];
    form.setValue('product_skus', [
      ...skus,
      {
        sku_id: '',
        attributes: {},
        price: 0,
        mrp: 0,
        currency: 'INR',
        availability: 'in_stock',
        available_quantity: 0
      }
    ]);
  };

  // Remove a SKU
  const removeSku = (index: number) => {
    const skus = form.getValues('product_skus') || [];
    if (skus.length <= 1) return; // Don't remove the last SKU
    const newSkus = [...skus];
    newSkus.splice(index, 1);
    form.setValue('product_skus', newSkus);
  };

  // State for dynamic card creation
  const [newCardType, setNewCardType] = React.useState<string>('text');
  const [newCardTitle, setNewCardTitle] = React.useState<string>('');
  const [showAddCardDialog, setShowAddCardDialog] = React.useState(false);

  // Add a new content card (predefined or custom)
  const addContentCard = () => {
    const cards = form.getValues('content_cards') || [];
    
    // Define the three required card definitions
    const cardDefinitions = [
      { card_id: 'highlights', title: 'Highlights', type: 'list', order: 1 },
      { card_id: 'description', title: 'Product Description', type: 'text', order: 2 },
      { card_id: 'specifications', title: 'Specifications', type: 'key_value', order: 3 }
    ];
    
    // Find the next missing required card
    const existingIds = new Set(cards.map(c => c.card_id));
    const nextCard = cardDefinitions.find(c => !existingIds.has(c.card_id));
    
    if (!nextCard) {
      // All required cards exist, open dialog for custom card
      setShowAddCardDialog(true);
      return;
    }
    
    form.setValue('content_cards', [
      ...cards,
      {
        card_id: nextCard.card_id,
        title: nextCard.title,
        type: nextCard.type,
        order: nextCard.order,
        data: nextCard.type === 'list' || nextCard.type === 'steps' ? [] : (nextCard.type === 'key_value' ? {} : '')
      }
    ]);
  };

  // Add custom content card
  const addCustomCard = () => {
    if (!newCardTitle.trim()) {
      toast.error('Please enter a card title');
      return;
    }

    const cards = form.getValues('content_cards') || [];
    const maxOrder = Math.max(...cards.map(c => c.order), 0);
    const cardId = newCardTitle.toLowerCase().replace(/\s+/g, '_');
    
    // Check if card_id already exists
    if (cards.some(c => c.card_id === cardId)) {
      toast.error('A card with this title already exists');
      return;
    }

    form.setValue('content_cards', [
      ...cards,
      {
        card_id: cardId,
        title: newCardTitle,
        type: newCardType,
        order: maxOrder + 1,
        data: newCardType === 'list' || newCardType === 'steps' ? [] : (newCardType === 'key_value' ? {} : '')
      }
    ]);

    // Reset form
    setNewCardTitle('');
    setNewCardType('text');
    setShowAddCardDialog(false);
    toast.success('Card added successfully');
  };

  // Remove a content card
  const removeContentCard = (index: number) => {
    const cards = form.getValues('content_cards') || [];
    const requiredCardIds = new Set(['highlights', 'description', 'specifications']);
    const cardToRemove = cards[index];
    
    // Don't allow removing required cards
    if (requiredCardIds.has(cardToRemove.card_id)) {
      toast.error('Cannot remove required cards');
      return;
    }
    
    if (cards.length <= 1) return; // Don't remove if only one card remains
    const newCards = [...cards];
    newCards.splice(index, 1);
    form.setValue('content_cards', newCards);
  };

  // Add a gallery image
  const addGalleryImage = () => {
    const gallery = form.getValues('media.gallery') || [];
    form.setValue('media.gallery', [
      ...gallery,
      { url: '', alt_text: '' }
    ]);
  };

  // Remove a gallery image
  const removeGalleryImage = (index: number) => {
    const gallery = form.getValues('media.gallery') || [];
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    form.setValue('media.gallery', newGallery);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{product ? 'Edit Product' : 'Create New Product'}</CardTitle>
            <CardDescription>
              {product 
                ? 'Update the product details below' 
                : 'Fill in the product information to create a new product'}
            </CardDescription>
          </CardHeader>
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="px-6 pt-4">
              <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
                <p className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</p>
                <ul className="text-xs text-destructive space-y-1">
                  {Object.entries(form.formState.errors).map(([field, error]: any) => (
                    <li key={field}>• {field}: {error?.message || 'Invalid'}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title * (Max 100 characters)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product title" {...field} className="h-8 text-sm" maxLength={100} />
                    </FormControl>
                    <FormDescription className="text-xs">{String(field.value || '').length}/100 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle * (Max 150 characters)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pack of 20 · Assorted colors · Premium quality" {...field} className="h-8 text-sm" maxLength={150} />
                    </FormControl>
                    <FormDescription className="text-xs">Use · to separate highlights. {String(field.value || '').length}/150 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Generic, Classmate, Camlin (optional)" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormDescription className="text-xs">Optional field</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(categoryName) => {
                        // Find the category ID for the selected name
                        const selectedCat = categories.find(cat => cat.name === categoryName);
                        if (selectedCat) {
                          field.onChange(categoryName); // Store name in form
                          setSelectedCategoryId(selectedCat.id); // Store ID for fetching subcategories
                        }
                        form.setValue('sub_category', ''); // Reset subcategory when category changes
                      }}
                      disabled={loadingCategories || loading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sub_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-category *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedCategoryId || loadingCategories || loading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.name}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable/disable product visibility
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Purchase Limits Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Purchase Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="purchase_limits.max_per_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max per Order *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" className="h-8 text-sm" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchase_limits.max_per_user_per_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max per User per Day</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" className="h-8 text-sm" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                      </FormControl>
                      <FormDescription className="text-xs">Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Delivery Info Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Delivery Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="delivery_info.estimated_delivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3-5 business days" className="h-8 text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_info.return_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Policy *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 7 days return" className="h-8 text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_info.cod_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>COD Available</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_info.free_delivery_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Delivery Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="e.g., 499" className="h-8 text-sm" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                      </FormControl>
                      <FormDescription className="text-xs">Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Rating Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Rating</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="rating.average"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Rating (0-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="5" step="0.1" className="h-8 text-sm" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating.count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Count</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" className="h-8 text-sm" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Media Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Media</h3>
              
              <ProductImageUpload
                label="Main Product Image *"
                value={form.watch('media.main_image.url') || ''}
                onChange={(value) => {
                  form.setValue('media.main_image.url', value || '');
                  setAllImages(prev => ({ ...prev, mainImage: value || '' }));
                }}
                placeholder="https://example.com/image.jpg"
                productId={product?.product_id}
                imageType="main"
              />

              <FormField
                control={form.control}
                name="media.main_image.alt_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image Alt Text *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for main image" className="h-8 text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <FormLabel>Gallery Images</FormLabel>
                  <Button type="button" onClick={addGalleryImage} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Image
                  </Button>
                </div>
                
                {form.watch('media.gallery')?.map((image, index) => (
                  <div key={index} className="mb-4 p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium">Gallery Image #{index + 1}</h5>
                      <Button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <ProductImageUpload
                      label="Image"
                      value={image?.url || ''}
                      onChange={(value) => {
                        form.setValue(`media.gallery.${index}.url`, value);
                        const updatedGallery = form.getValues('media.gallery') || [];
                        setAllImages(prev => ({ ...prev, gallery: updatedGallery }));
                      }}
                      placeholder="https://example.com/image.jpg"
                      productId={product?.product_id}
                      imageType="gallery"
                    />
                    
                    <FormField
                      control={form.control}
                      name={`media.gallery.${index}.alt_text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="mt-3">Alt Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter alt text for this gallery image" className="h-8 text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Variant Attributes Section - For Multi-SKU Products */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-medium mb-2">Variant Attributes (For Multi-SKU Products)</h3>
              <FormDescription className="text-sm mb-4">
                Define variant dimensions if this product has multiple SKUs with different options. Leave empty for single-SKU products.
                <br />
                Example: If offering A3 and A4 sizes, add "size" with options ["A3", "A4"]
              </FormDescription>

              <div className="space-y-3">
                {Object.entries(form.watch('variant_attributes') || {}).map(([attrKey, attrValues], index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-medium capitalize">{attrKey}</Label>
                      <Button
                        type="button"
                        onClick={() => {
                          const currentAttrs = form.getValues('variant_attributes') || {};
                          const newAttrs = { ...currentAttrs };
                          delete newAttrs[attrKey];
                          form.setValue('variant_attributes', newAttrs);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(attrValues as string[]).map((value, valueIndex) => (
                        <div key={valueIndex} className="flex gap-2">
                          <Input
                            value={value}
                            onChange={(e) => {
                              const currentAttrs = form.getValues('variant_attributes') || {};
                              const values = [...(currentAttrs[attrKey] || [])];
                              values[valueIndex] = e.target.value;
                              form.setValue('variant_attributes', {
                                ...currentAttrs,
                                [attrKey]: values
                              });
                            }}
                            placeholder="Enter variant option"
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const currentAttrs = form.getValues('variant_attributes') || {};
                              const values = [...(currentAttrs[attrKey] || [])];
                              values.splice(valueIndex, 1);
                              form.setValue('variant_attributes', {
                                ...currentAttrs,
                                [attrKey]: values
                              });
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          const currentAttrs = form.getValues('variant_attributes') || {};
                          form.setValue('variant_attributes', {
                            ...currentAttrs,
                            [attrKey]: [...((currentAttrs[attrKey] as string[]) || []), '']
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() => {
                    const attrNames = ['size', 'color', 'pack', 'gsm', 'type'];
                    const currentAttrs = form.getValues('variant_attributes') || {};
                    const existingKeys = Object.keys(currentAttrs);
                    const nextAttr = attrNames.find(name => !existingKeys.includes(name));
                    
                    if (nextAttr) {
                      form.setValue('variant_attributes', {
                        ...currentAttrs,
                        [nextAttr]: ['']
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant Dimension
                </Button>
              </div>
            </div>

            {/* SKUs Section */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">SKUs</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.watch('product_skus')?.length === 1 
                      ? 'Single SKU Product' 
                      : `Multi-SKU Product (${form.watch('product_skus')?.length} variants)`}
                  </p>
                </div>
                <Button type="button" onClick={addSku} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add SKU
                </Button>
              </div>
              
              {form.watch('product_skus')?.map((_, skuIndex) => (
                <div key={skuIndex} className="mb-4 p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">SKU #{skuIndex + 1}</h4>
                    {form.watch('product_skus')?.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSku(skuIndex)}
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name={`product_skus.${skuIndex}.sku_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SKU ID" className="h-8 text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_skus.${skuIndex}.mrp`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MRP *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter MRP" 
                              className="h-8 text-sm"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_skus.${skuIndex}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter Price" 
                              className="h-8 text-sm"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_skus.${skuIndex}.currency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_skus.${skuIndex}.availability`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in_stock">In Stock</SelectItem>
                              <SelectItem value="limited">Limited</SelectItem>
                              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_skus.${skuIndex}.available_quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter quantity" 
                              className="h-8 text-sm"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* SKU Attributes - Dynamic based on Variant Attributes */}
                  <div className="mt-4 p-3 border rounded-lg bg-slate-50">
                    <h5 className="font-medium mb-3">Attributes</h5>
                    {Object.keys(form.watch('variant_attributes') || {}).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.keys(form.watch('variant_attributes') || {}).map((attrKey) => (
                          <FormField
                            key={attrKey}
                            control={form.control}
                            name={`product_skus.${skuIndex}.attributes.${attrKey}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="capitalize">{attrKey}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue placeholder={`Select ${attrKey}`} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(form.watch('variant_attributes')?.[attrKey] || []).map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <p>No variant attributes defined. For single-SKU products, leave attributes empty.</p>
                        <p className="text-xs mt-1">For multi-SKU products, define variant dimensions above (e.g., Size, Color, Pack).</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Content Cards Section */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Content Cards</h3>
                  <p className="text-xs text-gray-500 mt-1">Required: Highlights, Description, Specifications. Add more for extra details.</p>
                </div>
                <Button type="button" onClick={addContentCard} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Card
                </Button>
              </div>

              {/* Dialog for adding custom cards */}
              {showAddCardDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Add Custom Content Card</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Card Title *</label>
                        <input
                          type="text"
                          placeholder="e.g., How to Use, FAQ, Shipping Info"
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Card Type *</label>
                        <select
                          value={newCardType}
                          onChange={(e) => setNewCardType(e.target.value)}
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Text (Paragraph)</option>
                          <option value="list">List (Bullet Points)</option>
                          <option value="steps">Steps (Numbered)</option>
                          <option value="key_value">Key-Value Pairs</option>
                          <option value="warning">Warning (Red Alert)</option>
                          <option value="info">Info (Blue Note)</option>
                        </select>
                      </div>

                      <div className="mt-6 flex gap-2">
                        <button
                          type="button"
                          onClick={addCustomCard}
                          className="flex-1 bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700"
                        >
                          Add Card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCardDialog(false);
                            setNewCardTitle('');
                            setNewCardType('text');
                          }}
                          className="flex-1 bg-gray-200 text-gray-800 rounded px-4 py-2 text-sm font-medium hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {form.watch('content_cards')?.map((card, cardIndex) => (
                <div key={cardIndex} className="mb-4 p-4 border rounded-lg bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{card.title || 'Card'}</h4>
                    <div className="flex gap-2">
                      <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {card.type}
                      </div>
                      {!['highlights', 'description', 'specifications'].includes(card.card_id) && (
                        <button
                          type="button"
                          onClick={() => {
                            const cards = form.getValues('content_cards') || [];
                            const newCards = cards.filter((_, i) => i !== cardIndex);
                            form.setValue('content_cards', newCards);
                            toast.success('Card removed');
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    <FormField
                      control={form.control}
                      name={`content_cards.${cardIndex}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Card title" className="h-8 text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`content_cards.${cardIndex}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Type</FormLabel>
                          <FormControl>
                            <Input 
                              disabled 
                              value={field.value} 
                              className="h-8 text-sm bg-gray-100 cursor-not-allowed"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`content_cards.${cardIndex}.order`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Order *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="1"
                              className="h-8 text-sm"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`content_cards.${cardIndex}.data`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Content *</FormLabel>
                        
                        {card.type === 'text' && (
                          <FormControl>
                            <Textarea 
                              placeholder="Enter text content" 
                              rows={3}
                              className="text-sm"
                              value={typeof field.value === 'string' ? field.value : ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        )}
                        
                        {(card.type === 'list' || card.type === 'steps') && (
                          <FormControl>
                            <Textarea 
                              placeholder="Enter items, one per line" 
                              rows={3}
                              className="text-sm"
                              value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                              onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim()))}
                            />
                          </FormControl>
                        )}
                        
                        {card.type === 'key_value' && (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                              Enter key-value pairs: each line in format "Key: Value"
                            </div>
                            <FormControl>
                              <Textarea 
                                placeholder="Example:&#10;Size: A3 (297 x 420 mm)&#10;Weight: 80 GSM&#10;Colors: Assorted Mix" 
                                rows={4}
                                className="text-sm font-mono"
                                value={typeof field.value === 'object' && field.value !== null 
                                  ? Object.entries(field.value).map(([k, v]) => `${k}: ${v}`).join('\n') 
                                  : ''}
                                onChange={(e) => {
                                  const obj: Record<string, string> = {};
                                  e.target.value.split('\n').forEach(line => {
                                    const [key, ...valueParts] = line.split(':');
                                    if (key.trim() && valueParts.length > 0) {
                                      obj[key.trim()] = valueParts.join(':').trim();
                                    }
                                  });
                                  field.onChange(obj);
                                }}
                              />
                            </FormControl>
                          </div>
                        )}

                        {(card.type === 'warning' || card.type === 'info') && (
                          <FormControl>
                            <Textarea 
                              placeholder={`Enter ${card.type} message`}
                              rows={2}
                              className="text-sm"
                              value={typeof field.value === 'string' ? field.value : ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        )}
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Image Preview Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Image Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">Review all images before saving</p>
              
              <div className="space-y-6">
                {/* Main Image Preview */}
                {allImages.mainImage && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium mb-3">Main Product Image</h4>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={allImages.mainImage}
                          alt={form.watch('media.main_image.alt_text') || 'Main product image'}
                          className="h-32 w-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Alt Text:</span> {form.watch('media.main_image.alt_text') || '(not set)'}
                        </p>
                        <p className="text-xs text-muted-foreground break-all">
                          <span className="font-medium">URL:</span> {allImages.mainImage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery Images Preview */}
                {allImages.galleryImages?.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium mb-3">Gallery Images ({allImages.galleryImages?.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allImages.galleryImages?.map((image, index) =>
                        image.url ? (
                          <div key={index} className="border rounded p-2 bg-background">
                            <img
                              src={image.url}
                              alt={image.alt_text || `Gallery image ${index + 1}`}
                              className="w-full h-40 object-cover rounded mb-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <p className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Image #{index + 1}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Alt:</span> {image.alt_text || '(not set)'}
                            </p>
                            <p className="text-xs text-muted-foreground break-all">
                              <span className="font-medium">URL:</span> {image.url}
                            </p>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* SKU Images Preview */}
                {allImages.skuImages?.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium mb-3">SKU Images ({allImages.skuImages?.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {allImages.skuImages?.map((sku, index) =>
                        sku.image_url ? (
                          <div key={index} className="border rounded p-2 bg-background">
                            <img
                              src={sku.image_url}
                              alt={`SKU ${sku.sku_id}`}
                              className="w-full h-32 object-cover rounded mb-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <p className="text-xs text-muted-foreground break-all">
                              <span className="font-medium">SKU:</span> {sku.sku_id}
                            </p>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  {product ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
