'use client';

import { useState, useEffect } from 'react';
import { getCategoriesAction } from '@/actions/category-actions';
import { 
  getAllDynamicHomeSectionsAction,
  getDynamicHomeSectionsForCategoryAction,
  getDynamicHomeSectionItemsAction
} from '@/actions/dynamic-home-section-actions';
import { DynamicHomeSectionsTable } from './dynamic-home-sections-table';
import { CreateDynamicSectionDialog } from './create-dynamic-section-dialog';
import { Loader2 } from 'lucide-react';

export default function DynamicHomeSectionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allHomeSections, setAllHomeSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, allHomeSectionsData] = await Promise.all([
          getCategoriesAction(),
          getAllDynamicHomeSectionsAction()
        ]);
        setCategories(categoriesData);
        setAllHomeSections(allHomeSectionsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dynamic Home Page Sections</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Manage products featured on the homepage with dynamic sections
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dynamic Home Page Sections</h1>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dynamic Home Page Sections</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Manage products featured on the homepage with dynamic sections
          </p>
          <CreateDynamicSectionDialog />
        </div>
      </div>
      
      <div className="space-y-8">
        {categories.map((category) => (
          <CategorySection 
            key={category.id} 
            category={category} 
            allHomeSections={allHomeSections}
          />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ category, allHomeSections }: { category: any; allHomeSections: any[] }) {
  const [sectionsWithItems, setSectionsWithItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        // Get home sections for this category
        const categoryHomeSections = await getDynamicHomeSectionsForCategoryAction(category.id);
        const sections = categoryHomeSections.sections || [];
        
        // Get all section IDs for this category
        const sectionIds = sections.map((section: any) => section.sectionId);
        
        // Get items for each section
        const sectionsWithItemsData = await Promise.all(
          sectionIds.map(async (sectionId: string) => {
            // Find section details
            const sectionDetails = sections.find((s: any) => s.sectionId === sectionId) || {
              sectionId,
              title: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
              type: sectionId
            };
            
            const items = await getDynamicHomeSectionItemsAction(category.id, sectionId);
            return {
              ...sectionDetails,
              items
            };
          })
        );
        
        setSectionsWithItems(sectionsWithItemsData);
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [category.id]);

  if (loading) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
      
      {sectionsWithItems.length === 0 ? (
        <p className="text-muted-foreground">No sections configured for this category yet.</p>
      ) : (
        <div className="space-y-6">
          {sectionsWithItems.map((section: any) => (
            <DynamicHomeSectionsTable 
              key={section.sectionId}
              categoryId={category.id}
              sectionId={section.sectionId}
              title={section.title}
              description={`Products featured in the ${section.title} section for ${category.name}`}
              items={section.items}
            />
          ))}
        </div>
      )}
    </div>
  );
}