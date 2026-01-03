'use client';

import { useState, useEffect } from 'react';
import { Category, SubCategory } from '@/lib/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoriesAction, getSubCategoriesAction } from '@/actions/category-actions';
import { SubCategoryActions } from './subcategory-actions';
import { SimpleCategoryManagement, SimpleCategoryActions, SubCategoryManagement } from './categories-client-components';
import { CategoryActions } from './category-actions';
import { Loader2 } from 'lucide-react';

function getCategoryHierarchy(categories: Category[], subcategories: SubCategory[]) {
  return categories.map(category => {
    const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id);
    return {
      ...category,
      subcategories: categorySubcategories
    };
  });
}

function getCategoryStats(categories: Category[], subcategories: SubCategory[]) {
  return {
    totalCategories: categories.length,
    parentCategories: categories.length,
    subcategories: subcategories.length
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, subcategoriesData] = await Promise.all([
          getCategoriesAction(),
          getSubCategoriesAction()
        ]);
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load categories and subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hierarchicalCategories = getCategoryHierarchy(categories, subcategories);
  const stats = getCategoryStats(categories, subcategories);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📁 Categories & Subcategories Management</h1>
          <p className="text-muted-foreground">Manage product categories & subcategories</p>
        </div>
        <SimpleCategoryManagement categories={categories} />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <span className="text-2xl">📁</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">All categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
            <span className="text-2xl">🏷️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.parentCategories}</div>
            <p className="text-xs text-muted-foreground">Top-level categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
            <span className="text-2xl">🔗</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.subcategories}</div>
            <p className="text-xs text-muted-foreground">Nested categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ Category Hierarchy</CardTitle>
          <CardDescription>Parent and child categories</CardDescription>
        </CardHeader>
        <CardContent>
          {hierarchicalCategories.length > 0 ? (
            <div className="space-y-4">
              {hierarchicalCategories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-8 h-8 rounded" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          📁
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.subcategories.length} subcategories
                        </p>
                      </div>
                    </div>
                    <SimpleCategoryActions 
                      category={category}
                    />
                  </div>
                  
                  {/* Subcategories */}
                  {category.subcategories.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            {subcategory.image ? (
                              <img 
                                src={subcategory.image} 
                                alt={subcategory.name} 
                                className="w-5 h-5 rounded" 
                              />
                            ) : (
                              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs">
                                🏷️
                              </div>
                            )}
                            <span className="text-sm font-medium">{subcategory.name}</span>
                            <Badge variant="outline" className="text-xs">Rank {subcategory.rank}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <SubCategoryActions
                              subcategory={subcategory}
                              categories={categories}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="font-semibold mb-2">No Categories Found</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first product category
              </p>
              <SimpleCategoryManagement categories={categories} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcategory Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>🏷️ Subcategory Management</CardTitle>
              <CardDescription>Manage subcategories for each category</CardDescription>
            </div>
            <SubCategoryManagement categories={categories} />
          </div>
        </CardHeader>
        <CardContent>
          {subcategories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category) => {
                const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id);
                if (categorySubcategories.length === 0) return null;
                
                return (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-6 h-6 rounded" 
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-sm">
                          📁
                        </div>
                      )}
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge variant="outline">{categorySubcategories.length} subcategories</Badge>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {categorySubcategories.map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border">
                          <div className="flex items-center gap-2">
                            {subcategory.image ? (
                              <img 
                                src={subcategory.image} 
                                alt={subcategory.name} 
                                className="w-5 h-5 rounded" 
                              />
                            ) : (
                              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs">
                                🏷️
                              </div>
                            )}
                            <span className="text-sm font-medium">{subcategory.name}</span>
                            <Badge variant="outline" className="text-xs">Rank {subcategory.rank}</Badge>
                          </div>
                          <SubCategoryActions
                            subcategory={subcategory}
                            categories={categories}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="font-semibold mb-2">No Subcategories Found</h3>
              <p className="text-muted-foreground mb-4">
                Create subcategories to organize your products better
              </p>
              <SubCategoryManagement categories={categories} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 All Categories</CardTitle>
          <CardDescription>Complete list of all categories</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Subcategories</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Rank</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name} 
                              className="w-6 h-6 rounded" 
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-sm">
                              📁
                            </div>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        <span className="line-clamp-2">{subcategories.filter(sub => sub.categoryId === category.id).length} subcategories</span>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">Category</Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        Rank {category.rank}
                      </td>
                      <td className="p-2">
                        <CategoryActions 
                          category={category}
                          variant="default"
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
                Start by creating your first product category to organize your inventory
              </p>
              <SimpleCategoryManagement categories={categories} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}