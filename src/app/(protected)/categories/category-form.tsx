'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Category } from '@/lib/types/product';
import { createCategoryAction, updateCategoryAction } from '@/actions/category-actions';
import { toast } from 'sonner';
import { Loader2, FolderIcon } from 'lucide-react';
import { ImageUploadField } from '@/components/form/image-upload-field';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ isOpen, onClose, category, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    rank: 0,
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name,
          image: category.image || '',
          rank: category.rank,
          isActive: category.isActive
        });
      } else {
        setFormData({
          name: '',
          image: '',
          rank: 0,
          isActive: true
        });
      }
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (category) {
        result = await updateCategoryAction(category.id, formData);
      } else {
        result = await createCategoryAction(formData);
      }

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category Details' : 'Create New Category'}
      description={category ? 'Update category details' : 'Add a new product category'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Electronics, Books, Clothing"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <ImageUploadField
            label="Category Icon"
            value={formData.image}
            onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
            placeholder="https://example.com/image.png"
          />
        </div>

        <div>
          <Label htmlFor="rank">Display Order</Label>
          <Input
            id="rank"
            type="number"
            min="0"
            placeholder="0"
            value={formData.rank}
            onChange={(e) => setFormData(prev => ({ ...prev, rank: parseInt(e.target.value) || 0 }))}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Lower numbers appear first in the list
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {category ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FolderIcon className="mr-2 h-4 w-4" />
                {category ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}