'use client';

import { useState, useEffect } from 'react';
import { getCategoriesAction } from '@/actions/category-actions';
import { getCompleteHomeSectionDataAction } from '@/actions/dynamic-subcollection-actions';
import { DynamicSubcollectionTable } from './dynamic-subcollection-table';
import { Loader2 } from 'lucide-react';

export default function DynamicSubcollectionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategoriesAction();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dynamic Home Section Subcollections</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Manage products in dynamically discovered subcollections
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        {categories.map((category) => (
          <CategorySection 
            key={category.id} 
            category={category}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: any }) {
  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCompleteHomeSectionDataAction(category.id);
        setCategoryData(data);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category.id]);

  if (loading) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
        <div className="text-center text-red-500 py-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
        <p className="text-muted-foreground">No data available for this category.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
      
      {categoryData.subcollections.length === 0 ? (
        <p className="text-muted-foreground">No subcollections found for this category.</p>
      ) : (
        <div className="space-y-6">
          {categoryData.subcollections.map((subcollectionName: string) => (
            <DynamicSubcollectionTable 
              key={subcollectionName}
              categoryId={category.id}
              subcollectionName={subcollectionName}
              title={subcollectionName.charAt(0).toUpperCase() + subcollectionName.slice(1)}
              description={`Products in the ${subcollectionName} subcollection for ${category.name}`}
              items={categoryData.subcollectionData[subcollectionName] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}