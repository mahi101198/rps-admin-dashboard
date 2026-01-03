'use client';

import { useRouter } from 'next/navigation';
import { HomeSectionsTable } from './home-sections-table';

export function HomeSectionsTableWrapper({ categoryId, sectionId, title, description, items }: { 
  categoryId: string;
  sectionId: string;
  title: string;
  description: string;
  items: any[];
}) {
  const router = useRouter();

  const handleDataChange = () => {
    // Use router.refresh() to re-fetch the data without a full page reload
    router.refresh();
  };

  return (
    <HomeSectionsTable 
      categoryId={categoryId}
      sectionId={sectionId}
      title={title}
      description={description}
      items={items}
      onDataChange={handleDataChange}
    />
  );
}