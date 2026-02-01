'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  LayoutGrid,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createHomeSectionAction,
  getAllHomeSectionsAction,
  getSectionWithItemsAction,
  deleteHomeSectionAction,
  updateItemRankAction,
  removeItemFromSectionAction,
} from '@/actions/home-section-actions';
import { 
  HomeSection, 
  HomeSectionItem, 
  HomeSectionWithItems,
  SectionType,
  CreateSectionInput,
  SECTION_TEMPLATES 
} from '@/lib/types/home-section-types';
import { AddProductDialog } from '@/components/home-sections/add-product-dialog';
import { EditProductDialog } from '@/components/home-sections/edit-product-dialog';

export default function HomeSectionsV2Page() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<HomeSectionWithItems | null>(null);
  const [loadingSection, setLoadingSection] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showAddProductsDialog, setShowAddProductsDialog] = useState(false);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeSectionItem | null>(null);
  
  // Form state for creating new section
  const [newSection, setNewSection] = useState<CreateSectionInput>({
    title: '',
    type: 'custom',
    rank: 1,
    show_view_all: true,
    max_items: 10,
  });

  // Load all sections
  const loadSections = async () => {
    setLoading(true);
    try {
      const data = await getAllHomeSectionsAction();
      setSections(data);
    } catch (error) {
      toast.error('Failed to load sections');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load section with items
  const loadSectionDetails = async (sectionId: string) => {
    setLoadingSection(true);
    try {
      const data = await getSectionWithItemsAction(sectionId);
      setSelectedSection(data);
    } catch (error) {
      toast.error('Failed to load section details');
      console.error(error);
    } finally {
      setLoadingSection(false);
    }
  };

  // Create new section
  const handleCreateSection = async () => {
    if (!newSection.title.trim()) {
      toast.error('Section title is required');
      return;
    }
    
    setLoading(true);
    try {
      const result = await createHomeSectionAction(newSection);
      
      if (result.success) {
        toast.success(result.message);
        setCreateDialogOpen(false);
        setNewSection({ title: '', type: 'custom', rank: 1, show_view_all: true, max_items: 10 });
        await loadSections();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create section');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its items?')) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await deleteHomeSectionAction(sectionId);
      
      if (result.success) {
        toast.success(result.message);
        if (selectedSection?.section_id === sectionId) {
          setSelectedSection(null);
        }
        await loadSections();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete section');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from section
  const handleRemoveItem = async (skuId: string) => {
    if (!selectedSection) return;
    
    try {
      const result = await removeItemFromSectionAction(selectedSection.section_id, skuId);
      
      if (result.success) {
        toast.success(result.message);
        await loadSectionDetails(selectedSection.section_id);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove item');
      console.error(error);
    }
  };

  // Update item rank
  const handleUpdateRank = async (skuId: string, newRank: number) => {
    if (!selectedSection) return;
    
    try {
      const result = await updateItemRankAction(selectedSection.section_id, skuId, newRank);
      
      if (result.success) {
        await loadSectionDetails(selectedSection.section_id);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update rank');
      console.error(error);
    }
  };

  // Handle edit product
  const handleEditProduct = (item: HomeSectionItem) => {
    setEditingItem(item);
    setShowEditProductDialog(true);
  };

  // Apply template
  const applyTemplate = (templateKey: string) => {
    const template = SECTION_TEMPLATES[templateKey];
    if (template) {
      setNewSection(prev => ({
        ...prev,
        ...template,
        rank: sections.length + 1,
      }));
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      popular: 'bg-purple-500',
      flash_sale: 'bg-red-500',
      seasonal_sale: 'bg-orange-500',
      category_spotlight: 'bg-blue-500',
      new_arrivals: 'bg-green-500',
      recommended: 'bg-indigo-500',
      deals: 'bg-yellow-600',
      custom: 'bg-gray-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-8 w-8" />
            Universal Home Sections
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage universal home sections - not category-based
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSections} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Section</CardTitle>
          <CardDescription>Create a new universal home section</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Section</DialogTitle>
                <DialogDescription>
                  Create a new universal home section
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Templates */}
                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(SECTION_TEMPLATES).map(key => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(key)}
                      >
                        {SECTION_TEMPLATES[key].title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Section Title</Label>
                  <Input
                    id="title"
                    value={newSection.title}
                    onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Flash Sale, Popular Items"
                  />
                </div>
                
                {/* Type */}
                <div className="space-y-2">
                  <Label>Section Type</Label>
                  <Select
                    value={newSection.type}
                    onValueChange={(value) => setNewSection(prev => ({ ...prev, type: value as SectionType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="flash_sale">Flash Sale</SelectItem>
                      <SelectItem value="seasonal_sale">Seasonal Sale</SelectItem>
                      <SelectItem value="category_spotlight">Category Spotlight</SelectItem>
                      <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="deals">Deals</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Rank */}
                <div className="space-y-2">
                  <Label htmlFor="rank">Display Rank</Label>
                  <Input
                    id="rank"
                    type="number"
                    min="1"
                    value={newSection.rank}
                    onChange={(e) => setNewSection(prev => ({ ...prev, rank: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                
                {/* Max Items */}
                <div className="space-y-2">
                  <Label htmlFor="maxItems">Max Items</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    min="1"
                    value={newSection.max_items || ''}
                    onChange={(e) => setNewSection(prev => ({ ...prev, max_items: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                
                <Button onClick={handleCreateSection} className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Section'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Sections List */}
      <Card>
        <CardHeader>
          <CardTitle>All Sections ({sections.length})</CardTitle>
          <CardDescription>Click on a section to view its items</CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sections found</p>
              <p className="text-sm">Create a new section to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Max Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map(section => (
                  <TableRow 
                    key={section.section_id}
                    className={selectedSection?.section_id === section.section_id ? 'bg-muted/50' : ''}
                  >
                    <TableCell className="font-bold">{section.rank}</TableCell>
                    <TableCell className="font-medium">{section.title}</TableCell>
                    <TableCell>{getTypeBadge(section.type)}</TableCell>
                    <TableCell>{getStatusBadge(section.status)}</TableCell>
                    <TableCell>{section.max_items || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadSectionDetails(section.section_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSection(section.section_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section Items */}
      {selectedSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items in "{selectedSection.title}" ({selectedSection.items.length})
            </CardTitle>
            <CardDescription>
              Products added to this section with their display data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSection ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading items...</p>
              </div>
            ) : selectedSection.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items in this section</p>
                <div className="mt-4">
                  <Button 
                    onClick={() => setShowAddProductsDialog(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Products
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {selectedSection.items.length} items in this section
                  </p>
                  <Button 
                    onClick={() => setShowAddProductsDialog(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More Products
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSection.items.map((item, index) => (
                      <TableRow key={item.sku_id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{item.rank}</span>
                            <div className="flex flex-col">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                disabled={item.rank <= 1}
                                onClick={() => handleUpdateRank(item.sku_id, item.rank - 1)}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => handleUpdateRank(item.sku_id, item.rank + 1)}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{item.category_id}</div>
                            <div className="text-muted-foreground">{item.subcategory_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.mrp}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          {item.discount_percent > 0 && (
                            <Badge variant="destructive">{item.discount_percent}% OFF</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveItem(item.sku_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      {selectedSection && (
        <AddProductDialog
          open={showAddProductsDialog}
          onOpenChange={setShowAddProductsDialog}
          sectionId={selectedSection.section_id}
          onProductsAdded={() => loadSectionDetails(selectedSection.section_id)}
          existingItems={selectedSection.items}
        />
      )}

      {/* Edit Product Dialog */}
      {selectedSection && editingItem && (
        <EditProductDialog
          open={showEditProductDialog}
          onOpenChange={setShowEditProductDialog}
          sectionId={selectedSection.section_id}
          item={editingItem}
          onItemUpdated={() => {
            loadSectionDetails(selectedSection.section_id);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}