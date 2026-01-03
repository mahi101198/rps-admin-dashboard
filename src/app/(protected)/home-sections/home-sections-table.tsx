'use client';

import { HomeSectionItem } from '@/lib/types/all-schemas';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SmartImage } from '@/components/smart-image';
import { 
  removeFromHomeSectionAction, 
  updateHomeSectionRankAction, 
  addToHomeSectionAction,
  updateHomeSectionItemAction as updateHomeSectionPriceOverrideAction
} from '@/actions/home-section-actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { getProductsAction } from '@/actions/product-actions';

// Helper function to safely convert addedAt to a Date object
function getAddedAtDate(addedAt: any): Date {
  // If it's already a Date object
  if (addedAt instanceof Date) {
    return addedAt;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof addedAt === 'object' && '_seconds' in addedAt) {
    return new Date(addedAt._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof addedAt === 'string') {
    const date = new Date(addedAt);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof addedAt === 'number') {
    return new Date(addedAt);
  }
  
  // Fallback
  return new Date();
}

interface HomeSectionsTableProps {
  categoryId: string;
  sectionId: string;
  title: string;
  description: string;
  items: (HomeSectionItem & { product?: any })[];
  onDataChange?: () => void;
}

export function HomeSectionsTable({ categoryId, sectionId, title, description, items, onDataChange }: HomeSectionsTableProps) {
  const [editingRank, setEditingRank] = useState<string | null>(null);
  const [newRank, setNewRank] = useState<number>(1);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPriceOverride, setNewPriceOverride] = useState<string>('');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product from the section?')) return;
    
    try {
      const result = await removeFromHomeSectionAction(categoryId, sectionId as any, productId);
      if (result.success) {
        toast.success(result.message);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove product from section');
    }
  };

  const handleUpdateRank = async (productId: string) => {
    try {
      const result = await updateHomeSectionRankAction(categoryId, sectionId as any, productId, newRank);
      if (result.success) {
        toast.success(result.message);
        setEditingRank(null);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update rank');
    }
  };

  const handleUpdatePriceOverride = async (productId: string) => {
    try {
      const priceValue = newPriceOverride === '' ? undefined : parseFloat(newPriceOverride);
      const result = await updateHomeSectionPriceOverrideAction(
        categoryId, 
        sectionId as any, 
        productId, 
        { priceOverride: priceValue }
      );
      if (result.success) {
        toast.success(result.message);
        setEditingPrice(null);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update price override');
    }
  };

  const loadAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await getProductsAction();
      setAllProducts(products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProductOpen = () => {
    setAddProductOpen(true);
    if (allProducts.length === 0) {
      loadAllProducts();
    }
  };

  const handleAddProductToSection = async (productId: string) => {
    setAddingProductId(productId);
    try {
      // Find the product to get its name
      const product = allProducts.find(p => p.productId === productId);
      const productName = product?.name || 'Product';
      
      // Add product to section with default rank
      const result = await addToHomeSectionAction(categoryId, sectionId as any, productId, 1);
      
      if (result.success) {
        toast.success(`${productName} added to ${title}`);
        // Notify parent component to refresh data instead of reloading
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add product to section');
    } finally {
      setAddingProductId(null);
    }
  };

  // Filter products that are not already in this section
  const availableProducts = allProducts.filter(product => 
    !items.some(item => item.productId === product.productId) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Dialog open={addProductOpen} onOpenChange={(open) => {
            setAddProductOpen(open);
            if (open) {
              setSearchTerm('');
              if (allProducts.length === 0) {
                loadAllProducts();
              }
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddProductOpen}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Product to {title}</DialogTitle>
                <DialogDescription>
                  Search and select a product to add to this section. Only lightweight references are stored.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {loadingProducts ? (
                  <div className="text-center py-4">Loading products...</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableProducts.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        {searchTerm ? 'No products found matching your search' : 'No available products'}
                      </div>
                    ) : (
                      availableProducts.map((product) => (
                        <div 
                          key={product.productId}
                          className="flex items-center gap-3 p-2 border rounded hover:bg-muted cursor-pointer"
                          onClick={() => {
                            if (addingProductId !== product.productId) {
                              handleAddProductToSection(product.productId);
                            }
                          }}
                        >
                          <SmartImage 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ₹{product.price.toLocaleString()} • Stock: {product.stock}
                            </div>
                          </div>
                          {addingProductId === product.productId && (
                            <div className="text-sm text-muted-foreground">Adding...</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            {sectionId === 'flashSale' && <TableHead>Override Price</TableHead>}
            <TableHead>Rank</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={sectionId === 'flashSale' ? 6 : 5} className="text-center py-8 text-muted-foreground">
                No products in this section yet. Add some products to get started.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <SmartImage 
                      src={item.product?.image} 
                      alt={item.product?.name || 'Product'}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {item.productId.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  ₹{item.product?.price?.toLocaleString() || '0'}
                </TableCell>
                {sectionId === 'flashSale' && (
                  <TableCell>
                    {editingPrice === item.productId ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={newPriceOverride}
                          onChange={(e) => setNewPriceOverride(e.target.value)}
                          className="w-24"
                          placeholder="Price"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdatePriceOverride(item.productId)}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingPrice(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {item.priceOverride ? (
                          <span className="font-medium">₹{item.priceOverride.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => {
                            setEditingPrice(item.productId);
                            setNewPriceOverride(item.priceOverride?.toString() || '');
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {editingRank === item.productId ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newRank}
                        onChange={(e) => setNewRank(parseInt(e.target.value) || 1)}
                        className="w-20"
                        min="1"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateRank(item.productId)}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingRank(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium">{item.rank}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => {
                          setEditingRank(item.productId);
                          setNewRank(item.rank || 1);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getAddedAtDate(item.addedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemove(item.productId)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}