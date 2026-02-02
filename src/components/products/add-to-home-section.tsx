'use client';

import React, { useRef } from 'react';
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
import { toast } from 'sonner';
import { Home } from 'lucide-react';
import { 
  getAllHomeSectionsAction, 
  addItemToSectionAction 
} from '@/actions/home-section-actions';
import { 
  HomeSection, 
  AddSectionItemInput,
  calculateDiscountPercent 
} from '@/lib/types/home-section-types';

interface AddToHomeSectionProps {
  product: any; // Product data structure
}

export function AddToHomeSection({ product }: AddToHomeSectionProps) {
  const [open, setOpen] = React.useState(false);
  const [rank, setRank] = React.useState(1);
  const [priceOverride, setPriceOverride] = React.useState('');
  const [badgeText, setBadgeText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<string>('');
  const [availableSections, setAvailableSections] = React.useState<HomeSection[]>([]);
  
  // Ref to track if dialog was recently closed
  const recentlyClosedRef = useRef(false);

  // Load available sections when dialog opens
  React.useEffect(() => {
    let isMounted = true;
    
    if (open) {
      const loadSections = async () => {
        try {
          // Get all universal home sections
          const sections = await getAllHomeSectionsAction();
          
          if (isMounted) {
            setAvailableSections(sections);
          }
        } catch (error) {
          console.error('Error loading sections:', error);
          if (isMounted) {
            setAvailableSections([]);
          }
        }
      };
      
      loadSections();
    }
    
    // Cleanup function to prevent state updates after component unmounts
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) {
      toast.error('Please select a section');
      return;
    }

    setLoading(true);
    try {
      // Prepare the item input for the universal home section
      const itemInput: AddSectionItemInput = {
        sku_id: product.productId, // Using productId as SKU for backward compatibility
        product_id: product.productId,
        rank: rank,
        name: product.name,
        image_url: product.image || '',
        mrp: product.mrp || product.price,
        price: product.price,
        discount_percent: calculateDiscountPercent(product.mrp || product.price, product.price),
        category_id: product.categoryId || 'unknown',
        subcategory_id: product.subcategoryId || 'unknown',
        currency_code: 'INR',
        price_override: priceOverride ? parseFloat(priceOverride) : undefined,
        badge_text: badgeText || undefined,
      };

      const result = await addItemToSectionAction(selectedSection, itemInput);

      if (result.success) {
        toast.success(result.message);
        // Add a small delay before closing to ensure state is properly updated
        setTimeout(() => {
          setOpen(false);
          // Reset form state after successful submission
          setRank(1);
          setPriceOverride('');
          setBadgeText('');
          setSelectedSection('');
        }, 100);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add product to section');
      console.error('Error adding to home section:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      // Add a small delay before resetting state to ensure dialog is fully closed
      const timer = setTimeout(() => {
        // Reset form state when dialog closes
        setRank(1);
        setPriceOverride('');
        setBadgeText('');
        setSelectedSection('');
        setAvailableSections([]);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (newOpen !== open) {
        setOpen(newOpen);
        // If closing, reset the form
        if (!newOpen) {
          recentlyClosedRef.current = true;
          // Reset form state when dialog closes
          setRank(1);
          setPriceOverride('');
          setBadgeText('');
          setSelectedSection('');
          
          // Reset the recently closed flag after a short delay
          setTimeout(() => {
            recentlyClosedRef.current = false;
          }, 300);
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 h-7 text-xs px-2"
          onClick={(e) => {
            // Prevent the row click event from firing when clicking the button
            e.stopPropagation();
            // Prevent opening if recently closed
            if (recentlyClosedRef.current) {
              e.preventDefault();
              return;
            }
          }}
        >
          <Home className="h-3 w-3" />
          <span className="hidden md:inline">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px] p-4">
        <DialogHeader className="p-0 mb-3">
          <DialogTitle className="text-lg">Add to Home Section</DialogTitle>
          <DialogDescription className="text-xs">
            Add {product.name} to a homepage section.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="section" className="text-xs">Section</Label>
            <select
              id="section"
              className="w-full p-1.5 border rounded text-sm"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">Select a section</option>
              {availableSections.map((section) => (
                <option key={section.section_id} value={section.section_id} className="text-sm">
                  {section.title} ({section.type})
                </option>
              ))}
            </select>
            {availableSections.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No sections available. Create sections in Home Sections first.
              </p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="rank" className="text-xs">Rank (Position)</Label>
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
            <strong>Note:</strong> Minimal product data is stored in home sections. 
            Full product details are fetched when needed.
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-8 text-xs px-3">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedSection} className="h-8 text-xs px-3">
              {loading ? 'Adding...' : 'Add to Section'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
