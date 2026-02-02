'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Package, 
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductDetailsDocument, ProductSKU } from '@/lib/types/product-details-sku';
import { getAllSkuProductsAction } from '@/actions/product-details-actions';
import { 
  AddSectionItemInput, 
  HomeSectionItem 
} from '@/lib/types/home-section-types';
import { getCategoriesAction, getSubCategoriesByCategoryAction } from '@/actions/category-actions';
import { Category, SubCategory } from '@/lib/types/all-schemas';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  onProductsAdded: () => void;
  existingItems: HomeSectionItem[];
}

interface SkuWithProduct extends ProductSKU {
  product_id: string;
  product_title: string;
  product_brand: string;
  product_category: string;
  product_sub_category: string;
  product_media?: {
    main_image?: {
      url: string;
    };
  };
}

export function AddProductDialog({
  open,
  onOpenChange,
  sectionId,
  onProductsAdded,
  existingItems
}: AddProductDialogProps) {
  const [allSkus, setAllSkus] = useState<SkuWithProduct[]>([]);
  const [filteredSkus, setFilteredSkus] = useState<SkuWithProduct[]>([]);
  const [selectedSkus, setSelectedSkus] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [rankInputs, setRankInputs] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, SubCategory[]>>({});
  const [categoryNameToIdMap, setCategoryNameToIdMap] = useState<Record<string, string>>({});
  const [subcategoryNameToIdMap, setSubcategoryNameToIdMap] = useState<Record<string, string>>({});

  // Load all products and flatten SKUs
  const loadAllSkus = async () => {
    setLoading(true);
    try {
      // Load categories and subcategories for mapping
      const cats = await getCategoriesAction();
      setCategories(cats);
      
      // Build category name to ID map
      const catNameToId: Record<string, string> = {};
      const subNameToId: Record<string, string> = {};
      
      // For each category, load its subcategories
      for (const cat of cats) {
        catNameToId[cat.name] = cat.id;
        const subCats = await getSubCategoriesByCategoryAction(cat.id);
        
        // Build subcategory name to ID map for all subcategories
        for (const subCat of subCats) {
          subNameToId[subCat.name] = subCat.id;
        }
      }
      
      setCategoryNameToIdMap(catNameToId);
      setSubcategoryNameToIdMap(subNameToId);
      
      // Load all products and flatten SKUs
      const products = await getAllSkuProductsAction();
      
      // Flatten products into individual SKUs with product context
      const skus: SkuWithProduct[] = products.flatMap(product => 
        product.product_skus.map(sku => ({
          ...sku,
          product_id: product.product_id,
          product_title: product.title || '',
          product_brand: product.brand,
          product_category: product.category,
          product_sub_category: product.sub_category,
          product_media: product.media
        }))
      );
      
      setAllSkus(skus);
      setFilteredSkus(skus);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter SKUs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSkus(allSkus);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allSkus.filter(sku => 
      sku.product_title.toLowerCase().includes(term) ||
      sku.product_brand.toLowerCase().includes(term) ||
      sku.product_category.toLowerCase().includes(term) ||
      sku.product_sub_category.toLowerCase().includes(term) ||
      sku.sku_id.toLowerCase().includes(term) ||
      Object.values(sku.attributes || {}).some(attr => 
        attr && attr.toLowerCase().includes(term)
      )
    );
    
    setFilteredSkus(filtered);
  }, [searchTerm, allSkus]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      loadAllSkus();
      setSelectedSkus({});
      setRankInputs({});
      setSearchTerm('');
    }
  }, [open]);

  // Check if SKU is already in section
  const isSkuInSection = (skuId: string) => {
    return existingItems.some(item => item.sku_id === skuId);
  };

  // Handle SKU selection
  const handleSkuToggle = (skuId: string) => {
    setSelectedSkus(prev => ({
      ...prev,
      [skuId]: !prev[skuId]
    }));
  };

  // Handle rank input change
  const handleRankChange = (skuId: string, rank: number) => {
    setRankInputs(prev => ({
      ...prev,
      [skuId]: rank
    }));
  };

  // Add selected products to section
  const handleAddProducts = async () => {
    const selectedSkuIds = Object.entries(selectedSkus)
      .filter(([, selected]) => selected)
      .map(([skuId]) => skuId);

    if (selectedSkuIds.length === 0) {
      toast.error('Please select at least one SKU');
      return;
    }

    setLoading(true);
    try {
      // Import the action here to avoid circular dependencies
      const { addItemToSectionAction } = await import('@/actions/home-section-actions');
      
      let successCount = 0;
      let errorCount = 0;

      for (const skuId of selectedSkuIds) {
        const sku = allSkus.find(s => s.sku_id === skuId);
        if (!sku) continue;

        // Map category name to ID
        const categoryId = categoryNameToIdMap[sku.product_category] || sku.product_category;
        
        // Map subcategory name to ID
        const subcategoryId = subcategoryNameToIdMap[sku.product_sub_category] || sku.product_sub_category;

        const input: AddSectionItemInput = {
          sku_id: sku.sku_id,
          product_id: sku.product_id,
          rank: rankInputs[skuId] || 1,
          name: `${sku.product_title} - ${Object.values(sku.attributes || {}).filter(v => v).join(', ')}`,
          image_url: sku.product_media?.main_image?.url || '',
          mrp: sku.mrp,
          price: sku.price,
          discount_percent: Math.round(((sku.mrp - sku.price) / sku.mrp) * 100),
          category_id: categoryId,
          subcategory_id: subcategoryId,
          currency_code: sku.currency || 'INR'
        };

        try {
          const result = await addItemToSectionAction(sectionId, input);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to add SKU ${skuId}:`, result.message);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error adding SKU ${skuId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} SKU(s) to section`);
        onProductsAdded();
        onOpenChange(false);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} SKU(s) failed to add`);
      }
    } catch (error) {
      toast.error('Failed to add products to section');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Products to Section</DialogTitle>
          <DialogDescription>
            Search and select specific SKUs to add to this home section
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, brand, category, SKU ID, or attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Count */}
          {Object.values(selectedSkus).filter(Boolean).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {Object.values(selectedSkus).filter(Boolean).length} SKU(s) selected
              </p>
            </div>
          )}

          {/* SKU List */}
          <div className="flex-1 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span>Loading products...</span>
                </div>
              </div>
            ) : filteredSkus.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No SKUs found</p>
                  {searchTerm && <p className="text-sm">Try a different search term</p>}
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredSkus.map((sku) => {
                  const isInSection = isSkuInSection(sku.sku_id);
                  const isSelected = selectedSkus[sku.sku_id] || false;
                  
                  return (
                    <div 
                      key={sku.sku_id} 
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        isInSection ? 'opacity-50 bg-muted/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSkuToggle(sku.sku_id)}
                            disabled={isInSection}
                          />
                        </div>
                        
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {sku.product_media?.main_image?.url ? (
                            <img
                              src={sku.product_media?.main_image?.url}
                              alt={sku.product_title}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-md border flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-sm truncate">
                                {sku.product_title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {sku.product_brand} • {sku.product_category} • {sku.product_sub_category}
                              </p>
                              
                              {/* Attributes */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(sku.attributes).map(([key, value]) => (
                                  <span 
                                    key={key} 
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary"
                                  >
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* Pricing */}
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium">
                                ₹{sku.price}
                                {sku.mrp > sku.price && (
                                  <span className="text-xs text-muted-foreground line-through ml-2">
                                    ₹{sku.mrp}
                                  </span>
                                )}
                              </div>
                              {sku.mrp > sku.price && (
                                <div className="text-xs text-destructive">
                                  {Math.round(((sku.mrp - sku.price) / sku.mrp) * 100)}% OFF
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* SKU Details */}
                          <div className="mt-3 pt-3 border-t text-xs">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-muted-foreground">SKU ID:</span>
                                <span className="ml-2 font-mono">{sku.sku_id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Product ID:</span>
                                <span className="ml-2 font-mono">{sku.product_id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <span className="ml-2">{sku.product_category}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sub-category:</span>
                                <span className="ml-2">{sku.product_sub_category}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Rank Input */}
                          {isSelected && (
                            <div className="mt-3 flex items-center gap-2">
                              <Label htmlFor={`rank-${sku.sku_id}`} className="text-xs">
                                Display Rank:
                              </Label>
                              <Input
                                id={`rank-${sku.sku_id}`}
                                type="number"
                                min="1"
                                value={rankInputs[sku.sku_id] || 1}
                                onChange={(e) => handleRankChange(sku.sku_id, parseInt(e.target.value) || 1)}
                                className="w-20 h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Already in section indicator */}
                      {isInSection && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3" />
                          <span>Already in this section</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleAddProducts}
            disabled={loading || Object.values(selectedSkus).filter(Boolean).length === 0}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Add Selected SKUs ({Object.values(selectedSkus).filter(Boolean).length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}