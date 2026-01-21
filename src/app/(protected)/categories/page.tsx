'use client';

import { useState, useEffect } from 'react';
import { Category, SubCategory } from '@/lib/types/all-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCategoriesAction, 
  getSubCategoriesAction,
  deleteCategoryAction,
  deleteSubCategoryAction,
  updateCategoryAction,
  updateSubCategoryAction
} from '@/actions/category-actions';
import { CategoryForm } from './category-form';
import { SubCategoryForm } from './subcategory-form';
import { CategoryActions } from './category-actions';
import { SubCategoryActions } from './subcategory-actions';

function getCategoryStats(categories: Category[], subCategories: SubCategory[]) {
  return {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    totalSubCategories: subCategories.length,
    activeSubCategories: subCategories.filter(sc => sc.isActive).length,
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSubCategoryFormOpen, setIsSubCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | undefined>(undefined);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalSubCategories: 0,
    activeSubCategories: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [categoriesResult, subCategoriesResult] = await Promise.all([
        getCategoriesAction(),
        getSubCategoriesAction()
      ]);
      setCategories(categoriesResult || []);
      setSubCategories(subCategoriesResult || []);
      setStats(getCategoryStats(categoriesResult || [], subCategoriesResult || []));
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const result = await deleteCategoryAction(categoryId);
      if (result.success) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const result = await updateCategoryAction(categoryId, { isActive });
      if (result.success) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  const handleCreateSubCategory = () => {
    setEditingSubCategory(undefined);
    setIsSubCategoryFormOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setIsSubCategoryFormOpen(true);
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      const result = await deleteSubCategoryAction(subCategoryId);
      if (result.success) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  const handleToggleSubCategoryStatus = async (subCategoryId: string, isActive: boolean) => {
    try {
      const result = await updateSubCategoryAction(subCategoryId, { isActive });
      if (result.success) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update subcategory status');
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter(subCategory => 
    subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subCategory.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📂 Category Management</h1>
            <p className="text-muted-foreground">Organize your products</p>
          </div>
          <div className="flex gap-2">
            <Button disabled>+ Add Category</Button>
            <Button disabled variant="outline">+ Add Subcategory</Button>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📂</div>
          <h3 className="font-semibold mb-2">Loading Categories...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📂 Category Management</h1>
          <p className="text-muted-foreground">Organize your products</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCategory}>+ Add Category</Button>
          <Button onClick={handleCreateSubCategory} variant="outline">+ Add Subcategory</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <span className="text-2xl">📁</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Main categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCategories}</div>
            <p className="text-xs text-muted-foreground">Currently visible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subcategories</CardTitle>
            <span className="text-2xl">📂</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubCategories}</div>
            <p className="text-xs text-muted-foreground">Nested categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subcategories</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeSubCategories}</div>
            <p className="text-xs text-muted-foreground">Currently visible</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search Categories</CardTitle>
          <CardDescription>Find categories and subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>📁 Main Categories</CardTitle>
          <CardDescription>Manage your main product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Image</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xl">
                            📁
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{category.name}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-muted-foreground">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{category.rank}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <CategoryActions 
                          category={category}
                          onRefresh={fetchCategories}
                          variant="compact"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="font-semibold mb-2">No Categories Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No categories match your search' : 'Create your first category'}
              </p>
              <Button onClick={handleCreateCategory}>
                + Create First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcategories Table */}
      <Card>
        <CardHeader>
          <CardTitle>📂 Subcategories</CardTitle>
          <CardDescription>Manage your product subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Image</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Parent Category</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubCategories.map((subCategory) => {
                    const parentCategory = categories.find(c => c.id === subCategory.categoryId);
                    return (
                      <tr key={subCategory.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          {subCategory.image ? (
                            <img src={subCategory.image} alt={subCategory.name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xl">
                              📂
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{subCategory.name}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {parentCategory?.name || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-muted-foreground">
                            {subCategory.description || 'No description'}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{subCategory.rank}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={subCategory.isActive ? 'default' : 'secondary'}>
                            {subCategory.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <SubCategoryActions 
                            subcategory={subCategory}
                            categories={categories}
                            onRefresh={fetchCategories}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="font-semibold mb-2">No Subcategories Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No subcategories match your search' : 'Create your first subcategory'}
              </p>
              <Button onClick={handleCreateSubCategory}>
                + Create First Subcategory
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryForm 
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        category={editingCategory}
        onSuccess={fetchCategories}
      />

      <SubCategoryForm 
        isOpen={isSubCategoryFormOpen}
        onClose={() => setIsSubCategoryFormOpen(false)}
        subcategory={editingSubCategory}
        categories={categories}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
