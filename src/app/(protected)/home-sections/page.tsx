'use client';

import { useState, useEffect } from 'react';
import { getCategoriesAction } from '@/actions/category-actions';
import { 
  getHomeSectionItemsAction, 
  getAllHomeSectionsAction,
  getHomeSectionsForCategoryAction
} from '@/actions/home-section-actions';
import { CreateSectionDialogWrapper } from './create-section-dialog-wrapper';
import { HomeSectionsTableWrapper } from './home-sections-table-wrapper';
import { useAuth } from '@/contexts/auth-context';

export default function HomeSectionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allHomeSections, setAllHomeSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, allHomeSectionsData] = await Promise.all([
          getCategoriesAction(),
          getAllHomeSectionsAction()
        ]);
        setCategories(categoriesData);
        setAllHomeSections(allHomeSectionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading home sections...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Home Page Sections</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Manage products featured on the homepage
          </p>
          <CreateSectionDialogWrapper />
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadCategoryData = async () => {
      try {
        setLoading(true);
        
        console.log(`[CategorySection] Loading data for category: ${category.name}`);
        
        // Get home sections for this category
        const categoryHomeSections = await getHomeSectionsForCategoryAction(category.id);
        
        // Cache to avoid duplicate API calls
        const itemsCache = new Map<string, any[]>();
        
        // Helper function to fetch items only once
        const fetchItemsOnce = async (sectionId: string) => {
          if (!itemsCache.has(sectionId)) {
            try {
              const items = await getHomeSectionItemsAction(category.id, sectionId);
              itemsCache.set(sectionId, items);
              console.log(`[CategorySection] Fetched ${items.length} items for section: ${sectionId}`);
            } catch (error) {
              console.debug(`[CategorySection] Error fetching section ${sectionId}:`, error);
              itemsCache.set(sectionId, []);
            }
          }
          return itemsCache.get(sectionId) || [];
        };
        
        const sectionsToProcess: Array<{ sectionId: string; title: string; type: string }> = [];
        
        // Add sections from metadata
        if (categoryHomeSections.sections && Array.isArray(categoryHomeSections.sections)) {
          sectionsToProcess.push(...categoryHomeSections.sections.map((s: any) => ({
            sectionId: s.sectionId,
            title: s.title,
            type: s.type
          })));
        }
        
        // Add common subcollections for backward compatibility
        const commonSubcollections = [
          { sectionId: 'popular', title: 'Popular Products', type: 'popular' },
          { sectionId: 'flashSale', title: 'Flash Sale', type: 'flashSale' },
          { sectionId: 'newArrivals', title: 'New Arrivals', type: 'newArrivals' },
          { sectionId: 'recommended', title: 'Recommended Products', type: 'recommended' }
        ];
        
        for (const common of commonSubcollections) {
          if (!sectionsToProcess.some(s => s.sectionId === common.sectionId)) {
            sectionsToProcess.push(common);
          }
        }
        
        // Fetch all items in parallel (but only once per section)
        await Promise.all(
          sectionsToProcess.map(section => fetchItemsOnce(section.sectionId))
        );
        
        // Build final sections array with items (filtered to only those with items)
        const sectionsWithItemsData = sectionsToProcess
          .map(section => {
            const items = itemsCache.get(section.sectionId) || [];
            return {
              sectionId: section.sectionId,
              title: section.title,
              type: section.type,
              itemsCount: items.length,
              items
            };
          })
          .filter(section => section.items.length > 0); // Only include sections with items
        
        console.log(`[CategorySection] Loaded ${sectionsWithItemsData.length} sections for ${category.name}`);
        setSectionsWithItems(sectionsWithItemsData);
      } catch (error) {
        console.error('[CategorySection] Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [category.id, user]);

  if (loading) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
      
      <div className="space-y-6">
        {sectionsWithItems.map((section: any) => (
          <HomeSectionsTableWrapper 
            key={section.sectionId}
            categoryId={category.id}
            sectionId={section.sectionId}
            title={section.title}
            description={`Products featured in the ${section.title} section for ${category.name} (${section.itemsCount} products)`}
            items={section.items}
          />
        ))}
      </div>
    </div>
  );
}