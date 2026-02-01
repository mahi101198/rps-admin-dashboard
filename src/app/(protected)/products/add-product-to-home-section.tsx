'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getAllHomeSectionsAction, 
  addItemToSectionAction
} from '@/actions/home-section-actions';
import { 
  HomeSection,
  AddSectionItemInput
} from '@/lib/types/home-section-types';
import { ProductDetailsDocument } from '@/lib/types/product-details-sku';
import { getCategoriesAction, getSubCategoriesByCategoryAction } from '@/actions/category-actions';
import { Category, SubCategory } from '@/lib/types/all-schemas';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AddProductToHomeSectionProps {
  product: ProductDetailsDocument;
  children: React.ReactNode;
}

export function AddProductToHomeSection({ product, children }: AddProductToHomeSectionProps) {
  const [open, setOpen] = React.useState(false);
  const [rank, setRank] = React.useState(1);
  const [priceOverride, setPriceOverride] = React.useState('');
  const [badgeText, setBadgeText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<string>('');
  const [availableSections, setAvailableSections] = React.useState<HomeSection[]>([]);
  const [availableCategories, setAvailableCategories] = React.useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = React.useState<SubCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<string>('');
  
  const normalizeValue = (value: string) => value.toLowerCase().replace(/_/g, ' ').trim();

  // Load subcategories when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubcategories = async () => {
        try {
          const subcategories = await getSubCategoriesByCategoryAction(selectedCategoryId);
          setAvailableSubcategories(subcategories);
          // Reset selected subcategory when category changes
          setSelectedSubcategoryId('');
        } catch (error) {
          console.error('Error loading subcategories:', error);
          toast.error('Failed to load subcategories');
          setAvailableSubcategories([]);
          setSelectedSubcategoryId('');
        }
      };
      
      loadSubcategories();
    } else {
      // Clear subcategories if no category is selected
      setAvailableSubcategories([]);
      setSelectedSubcategoryId('');
    }
  }, [selectedCategoryId]);
  
  // Load available sections and categories when dialog opens
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          // Load home sections
          const sections = await getAllHomeSectionsAction();
          setAvailableSections(sections);
          
          // Load categories
          const categories = await getCategoriesAction();
          setAvailableCategories(categories);
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Failed to load data');
          setAvailableSections([]);
          setAvailableCategories([]);
        }
      };
      
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (!open || availableCategories.length === 0 || selectedCategoryId) return;

    const matchedCategory = availableCategories.find(category => {
      if (category.id === product.category) return true;
      return normalizeValue(category.name) === normalizeValue(product.category);
    });

    if (matchedCategory) {
      setSelectedCategoryId(matchedCategory.id);
    }
  }, [availableCategories, open, product.category, selectedCategoryId]);

  useEffect(() => {
    if (!open || availableSubcategories.length === 0 || selectedSubcategoryId) return;

    const matchedSubcategory = availableSubcategories.find(subcategory => {
      if (subcategory.id === product.sub_category) return true;
      return normalizeValue(subcategory.name) === normalizeValue(product.sub_category);
    });

    if (matchedSubcategory) {
      setSelectedSubcategoryId(matchedSubcategory.id);
    }
  }, [availableSubcategories, open, product.sub_category, selectedSubcategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) {
      toast.error('Please select a section');
      return;
    }

    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!selectedSubcategoryId) {
      toast.error('Please select a subcategory');
      return;
    }

    setLoading(true);
    try {
      // Get the primary SKU for pricing information
      const primarySku = product.product_skus[0]; // Simplified for this example
      
      // Prepare the item input for the universal home section
      const itemInput: AddSectionItemInput = {
        sku_id: product.product_id, // Using product_id as sku_id for this case
        product_id: product.product_id,
        rank: rank,
        name: product.name,
        image_url: product.media?.main_image?.url || '',
        mrp: primarySku?.mrp || primarySku?.price || 0,
        price: primarySku?.price || 0,
        discount_percent: primarySku ? Math.round(((primarySku.mrp - primarySku.price) / primarySku.mrp) * 100) : 0,
        price_override: priceOverride ? parseFloat(priceOverride) : undefined,
        badge_text: badgeText || undefined,
        category_id: selectedCategoryId,
        subcategory_id: selectedSubcategoryId,
      };

      console.log('Adding item to section:', {
        sectionId: selectedSection,
        itemInput: itemInput,
      });

      // Call the action to add SKU product to home section
      const result = await addItemToSectionAction(selectedSection, itemInput);

      console.log('Add to section result:', result);

      if (result.success) {
        toast.success('Product added to home section successfully');
        setOpen(false);
        // Reset form state after successful submission
        setRank(1);
        setPriceOverride('');
        setBadgeText('');
        setSelectedSection('');
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
      } else {
        console.error('Failed to add to section:', result);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error adding to home section:', error);
      toast.error('Failed to add product to section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => {
        e.stopPropagation();
      }}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-4" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="p-0 mb-3">
          <DialogTitle className="text-lg">Add to Home Section</DialogTitle>
          <DialogDescription className="text-xs">
            Add {product.name} to a homepage section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs">Category *</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-sm">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No categories available. Create categories first.
              </p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="subcategory" className="text-xs">Subcategory</Label>
            <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id} className="text-sm">
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCategories.length > 0 && availableSubcategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No subcategories for this category. Select another category or create subcategories.
              </p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="section" className="text-xs">Section *</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {availableSections.map((section) => (
                  <SelectItem key={section.section_id} value={section.section_id} className="text-sm">
                    {section.title} ({section.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableSections.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No sections available. Create sections in Home Sections first.
              </p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="rank" className="text-xs">Rank (Position) *</Label>
            <Input
              id="rank"
              type="number"
              min="1"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 1)}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="priceOverride" className="text-xs">Price Override (Optional)</Label>
            <Input
              id="priceOverride"
              type="number"
              min="0"
              step="0.01"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              placeholder="Special price for this section"
              className="h-8 text-sm"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="badgeText" className="text-xs">Badge Text (Optional)</Label>
            <Input
              id="badgeText"
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="e.g., Bestseller, New"
              className="h-8 text-sm"
            />
          </div>
          
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            <strong>Note:</strong> Product will be added to the selected section with the specified rank.
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="h-8 text-xs px-3"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedSection || !selectedCategoryId} 
              className="h-8 text-xs px-3"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Adding...
                </>
              ) : (
                'Add to Section'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
