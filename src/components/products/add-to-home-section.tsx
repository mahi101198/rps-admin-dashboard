'use client';

import React, { useRef } from 'react';
import { Product } from '@/lib/types/product';
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
import { Home, Check } from 'lucide-react';
import { addToHomeSectionAction, isProductInHomeSectionAction, getHomeSectionsForCategoryAction } from '@/actions/home-section-actions';

interface AddToHomeSectionProps {
  product: Product;
}

// Define the section type
interface HomeSection {
  sectionId: string;
  title: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the return type for getHomeSectionsForCategoryAction
interface CategoryHomeSections {
  categoryId: string;
  sections: HomeSection[];
  [key: string]: any; // Allow other properties
}

export function AddToHomeSection({ product }: AddToHomeSectionProps) {
  const [open, setOpen] = React.useState(false);
  const [rank, setRank] = React.useState(1);
  const [priceOverride, setPriceOverride] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<string>('');
  const [availableSections, setAvailableSections] = React.useState<HomeSection[]>([]);
  const [productSections, setProductSections] = React.useState<Record<string, boolean>>({});
  
  // Ref to track if dialog was recently closed
  const recentlyClosedRef = useRef(false);

  // Load available sections when dialog opens
  React.useEffect(() => {
    let isMounted = true;
    
    if (open) {
      const loadSections = async () => {
        try {
          // Get available sections for this product's category
          const categorySections: CategoryHomeSections = await getHomeSectionsForCategoryAction(product.categoryId);
          
          if (isMounted) {
            // Set available sections from metadata
            const sections: HomeSection[] = categorySections.sections || [];
            setAvailableSections(sections);
            
            // Check which sections the product is already in
            const sectionStatus: Record<string, boolean> = {};
            const sectionChecks = sections.map((section: HomeSection) => 
              isProductInHomeSectionAction(
                product.categoryId,
                section.sectionId,
                product.productId
              ).catch(() => false)
            );
            
            const results = await Promise.all(sectionChecks);
            sections.forEach((section: HomeSection, index: number) => {
              sectionStatus[section.sectionId] = results[index];
            });
            
            setProductSections(sectionStatus);
          }
        } catch (error) {
          console.error('Error loading sections:', error);
          if (isMounted) {
            setAvailableSections([]);
            setProductSections({});
          }
        }
      };
      
      loadSections();
    }
    
    // Cleanup function to prevent state updates after component unmounts
    return () => {
      isMounted = false;
    };
  }, [open, product.productId, product.categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) {
      toast.error('Please select a section');
      return;
    }

    setLoading(true);
    try {
      const result = await addToHomeSectionAction(
        product.categoryId, // Use product's categoryId
        selectedSection,
        product.productId,
        rank,
        selectedSection === 'flashSale' && priceOverride ? parseFloat(priceOverride) : undefined
      );

      if (result.success) {
        toast.success(result.message);
        // Add a small delay before closing to ensure state is properly updated
        setTimeout(() => {
          setOpen(false);
          // Reset form state after successful submission
          setRank(1);
          setPriceOverride('');
          setSelectedSection('');
          setProductSections({});
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
        setSelectedSection('');
        setAvailableSections([]);
        setProductSections({});
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
            Add {product.name} to a homepage section. Only lightweight references are stored.
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
                <option key={section.sectionId} value={section.sectionId} className="text-sm">
                  {section.title} {productSections[section.sectionId] && '(Added)'}
                </option>
              ))}
            </select>
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
          
          {selectedSection === 'flashSale' && (
            <div className="space-y-1.5">
              <Label htmlFor="priceOverride" className="text-xs">Flash Sale Price (Optional)</Label>
              <Input
                id="priceOverride"
                type="number"
                min="0"
                step="0.01"
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                placeholder="Override price for flash sale"
                className="h-8 text-sm"
              />
            </div>
          )}
          
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            <strong>Note:</strong> Only product references (ID, rank, price override) are stored in home sections. 
            Product details are fetched from the main products collection when needed.
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