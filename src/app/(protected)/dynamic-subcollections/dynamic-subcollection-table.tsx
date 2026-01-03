'use client';

import { HomeSectionItem } from '@/lib/types/all-schemas';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SmartImage } from '@/components/smart-image';
import { 
  deleteFromDynamicSubcollectionAction as removeProductFromSubcollectionAction, 
  updateDynamicSubcollectionItemAction as updateSubcollectionRankAction, 
  addToDynamicSubcollectionAction as addProductToSubcollectionAction,
  updateDynamicSubcollectionItemAction as updateSubcollectionPriceOverrideAction
} from '@/actions/dynamic-subcollection-actions';
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

interface DynamicSubcollectionTableProps {
  categoryId: string;
  subcollectionName: string;
  title: string;
  description: string;
  items: (HomeSectionItem & { product?: any })[];
}

export function DynamicSubcollectionTable({ categoryId, subcollectionName, title, description, items }: DynamicSubcollectionTableProps) {
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
      const result = await removeProductFromSubcollectionAction(categoryId, subcollectionName, productId);
      if (result.success) {
        toast.success(result.message);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove product from section');
    }
  };

  const handleUpdateRank = async (productId: string) => {
    try {
      const result = await updateSubcollectionRankAction(categoryId, subcollectionName, productId, { rank: newRank });
      if (result.success) {
        toast.success(result.message);
        setEditingRank(null);
        // Refresh the page to show updated data
        window.location.reload();
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
      const result = await updateSubcollectionPriceOverrideAction(
        categoryId, 
        subcollectionName, 
        productId, 
        { priceOverride: priceValue }
      );
      if (result.success) {
        toast.success(result.message);
        setEditingPrice(null);
        // Refresh the page to show updated data
        window.location.reload();
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
      const result = await addProductToSubcollectionAction(categoryId, subcollectionName, { productId, rank: 1 });
      
      if (result.success) {
        toast.success(`${productName} added to ${title}`);
        // Refresh the page to show updated data
        window.location.reload();
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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <SmartImage 
                              src={product.image || '/logo.png'} 
                              alt={product.name} 
                              className="w-12 h-12 rounded-md object-cover" 
                            />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ₹{product.price}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddProductToSection(product.productId)}
                            disabled={addingProductId === product.productId}
                          >
                            {addingProductId === product.productId ? 'Adding...' : 'Add'}
                          </Button>
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
            <TableHead>Rank</TableHead>
            {subcollectionName === 'flashSale' && <TableHead>Price Override</TableHead>}
            <TableHead>Added At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={subcollectionName === 'flashSale' ? 5 : 4} className="text-center py-8 text-muted-foreground">
                No products in this section. Add products using the "Add Product" button above.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <SmartImage 
                      src={item.product?.image || '/logo.png'} 
                      alt={item.product?.name || 'Product'} 
                      className="w-12 h-12 rounded-md object-cover" 
                    />
                    <div>
                      <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{item.product?.price || 0}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {editingRank === item.productId ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={newRank}
                        onChange={(e) => setNewRank(parseInt(e.target.value) || 1)}
                        className="w-20"
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
                    <div className="flex items-center gap-2">
                      <span>{item.rank}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingRank(item.productId);
                          setNewRank(item.rank);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </TableCell>
                {subcollectionName === 'flashSale' && (
                  <TableCell>
                    {editingPrice === item.productId ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPriceOverride}
                          onChange={(e) => setNewPriceOverride(e.target.value)}
                          placeholder="Enter price override"
                          className="w-24"
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
                      <div className="flex items-center gap-2">
                        <span>{item.priceOverride ? `₹${item.priceOverride}` : 'Not set'}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
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