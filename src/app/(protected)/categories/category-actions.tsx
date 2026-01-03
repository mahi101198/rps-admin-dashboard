'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { deleteCategoryAction } from '@/actions/category-actions';
import { CategoryForm } from './category-form';
import { Category } from '@/lib/types/product';

interface CategoryActionsProps {
  category: Category;
  onRefresh?: () => void;
  variant?: 'default' | 'compact';
}

export function CategoryActions({ category, onRefresh, variant = 'default' }: CategoryActionsProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onRefresh?.();
    window.location.reload();
  };

  if (variant === 'compact') {
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
              return await deleteCategoryAction(category.id);
            }}
            confirmMessage={`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`}
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600"
            loadingText="..."
          >
            🗑️
          </ActionButton>
        </div>
        
        <CategoryForm 
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          category={category}
          onSuccess={handleEditSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowEditForm(true)}
        >
          ✏️ Edit
        </Button>
        <ActionButton
          action={async () => {
            return await deleteCategoryAction(category.id);
          }}
          confirmMessage={`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`}
          variant="destructive"
          size="sm"
          loadingText="Deleting..."
        >
          🗑️ Delete
        </ActionButton>
      </div>
      
      <CategoryForm 
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        category={category}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}