'use client';

import { useState } from 'react';
import { Category } from '@/lib/types/all-schemas';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  deleteCategoryAction, 
  updateCategoryAction 
} from '@/actions/category-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { CategoryForm } from './category-form';

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
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const result = await deleteCategoryAction(category.id);
              if (result.success) {
                toast.success(result.message);
                onRefresh?.();
              } else {
                toast.error(result.message);
              }
            }}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            const result = await deleteCategoryAction(category.id);
            if (result.success) {
              toast.success(result.message);
              onRefresh?.();
            } else {
              toast.error(result.message);
            }
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
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