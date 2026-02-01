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
import { 
  Package, 
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  HomeSectionItem,
  AddSectionItemInput 
} from '@/lib/types/home-section-types';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  item: HomeSectionItem | null;
  onItemUpdated: () => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  sectionId,
  item,
  onItemUpdated
}: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    rank: 1,
    name: '',
    mrp: 0,
    price: 0,
    discount_percent: 0,
    price_override: '',
    discount_label: '',
    badge_text: '',
    badge_color: '',
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when item changes
  useEffect(() => {
    if (item && open) {
      setFormData({
        rank: item.rank,
        name: item.name,
        mrp: item.mrp,
        price: item.price,
        discount_percent: item.discount_percent,
        price_override: item.price_override?.toString() || '',
        discount_label: item.discount_label || '',
        badge_text: item.badge_text || '',
        badge_color: item.badge_color || '',
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

    setLoading(true);
    try {
      // Import the action here to avoid circular dependencies
      const { updateSectionItemAction } = await import('@/actions/home-section-actions');
      
      const updates: Partial<AddSectionItemInput> = {
        rank: formData.rank,
        name: formData.name,
        mrp: formData.mrp,
        price: formData.price,
        discount_percent: formData.discount_percent,
        ...(formData.price_override && { price_override: parseFloat(formData.price_override) }),
        ...(formData.discount_label && { discount_label: formData.discount_label }),
        ...(formData.badge_text && { badge_text: formData.badge_text }),
        ...(formData.badge_color && { badge_color: formData.badge_color }),
      };

      const result = await updateSectionItemAction(sectionId, item.sku_id, updates);
      
      if (result.success) {
        toast.success('Product updated successfully');
        onItemUpdated();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[80vw] w-[80vw] max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Product in Section</DialogTitle>
          <DialogDescription>
            Modify product details for this section
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Main content area - no scrolling */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Product Preview */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2 text-sm">Product Information</h3>
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <div>SKU: {item.sku_id}</div>
                      <div>Product ID: {item.product_id}</div>
                      <div>Category: {item.category_id}</div>
                      <div>Sub-category: {item.subcategory_id}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Basic Information</h3>
                
                <div>
                  <Label htmlFor="rank">Display Rank</Label>
                  <Input
                    id="rank"
                    type="number"
                    min="1"
                    value={formData.rank}
                    onChange={(e) => setFormData(prev => ({ ...prev, rank: parseInt(e.target.value) || 1 }))}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="badgeColor">Badge Color (Optional)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="badgeColor"
                      type="color"
                      value={formData.badge_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge_color: e.target.value }))}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.badge_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge_color: e.target.value }))}
                      placeholder="#FF5722"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Pricing */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Pricing Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mrp">MRP</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => setFormData(prev => ({ ...prev, mrp: parseFloat(e.target.value) || 0 }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Selling Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="priceOverride">Price Override (Optional)</Label>
                  <Input
                    id="priceOverride"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_override}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_override: e.target.value }))}
                    placeholder="Override price for this section"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Labels and Badges */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Labels & Badges</h3>
                
                <div>
                  <Label htmlFor="discountLabel">Discount Label (Optional)</Label>
                  <Input
                    id="discountLabel"
                    value={formData.discount_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_label: e.target.value }))}
                    placeholder="e.g., FLASH SALE, 50% OFF"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="badgeText">Badge Text (Optional)</Label>
                  <Input
                    id="badgeText"
                    value={formData.badge_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                    placeholder="e.g., Bestseller, New, Limited"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Always visible */}
          <div className="pt-4 border-t mt-4 flex-shrink-0">
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}