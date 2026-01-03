'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { deleteSubCategoryAction } from '@/actions/category-actions';
import { SubCategoryForm } from './subcategory-form';
import { Category, SubCategory } from '@/lib/types/all-schemas';

interface SubCategoryActionsProps {
  subcategory: SubCategory;
  categories: Category[];
  onRefresh?: () => void;
}

export function SubCategoryActions({ subcategory, categories, onRefresh }: SubCategoryActionsProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onRefresh?.();
    window.location.reload();
  };

  return (
    <>
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowEditForm(true)}
        >
          ✏️
        </Button>
        <ActionButton
          action={async () => {
            return await deleteSubCategoryAction(subcategory.id);
          }}
          confirmMessage={`Are you sure you want to delete the subcategory "${subcategory.name}"? This action cannot be undone.`}
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-600"
          loadingText="..."
        >
          🗑️
        </ActionButton>
      </div>
      
      <SubCategoryForm 
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        subcategory={subcategory}
        onSuccess={handleEditSuccess}
        categories={categories}
      />
    </>
  );
}