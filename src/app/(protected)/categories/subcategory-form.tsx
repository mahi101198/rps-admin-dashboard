'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Category, SubCategory } from '@/lib/types/all-schemas';
import { createSubCategoryAction, updateSubCategoryAction } from '@/actions/category-actions';
import { toast } from 'sonner';
import { Loader2, FolderIcon } from 'lucide-react';
import { ImageUploadField } from '@/components/form/image-upload-field';

interface SubCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: SubCategory;
  onSuccess?: () => void;
  categories: Category[];
}

export function SubCategoryForm({ isOpen, onClose, subcategory, onSuccess, categories }: SubCategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    rank: 0,
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (subcategory) {
        setFormData({
          name: subcategory.name,
          categoryId: subcategory.categoryId,
          rank: subcategory.rank,
          isActive: subcategory.isActive
        });
      } else {
        setFormData({
          name: '',
          categoryId: '',
          rank: 0,
          isActive: true
        });
      }
    }
  }, [subcategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (subcategory) {
        result = await updateSubCategoryAction(subcategory.id, formData);
      } else {
        result = await createSubCategoryAction(formData);
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
      title={subcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
      description={subcategory ? 'Update subcategory details' : 'Add a new subcategory'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Subcategory Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Smartphones, Fiction Books"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="categoryId">Parent Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {subcategory ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FolderIcon className="mr-2 h-4 w-4" />
                {subcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}