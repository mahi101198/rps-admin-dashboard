'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Category, SubCategory } from '@/lib/types/all-schemas';
import { createSubCategoryAction, updateSubCategoryAction, uploadSubCategoryImageAction } from '@/actions/category-actions';
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
    image: '',
    rank: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (subcategory) {
        setFormData({
          name: subcategory.name,
          categoryId: subcategory.categoryId,
          image: subcategory.image || '',
          rank: subcategory.rank,
          isActive: subcategory.isActive
        });
        setImageFile(null);
      } else {
        setFormData({
          name: '',
          categoryId: '',
          image: '',
          rank: 0,
          isActive: true
        });
        setImageFile(null);
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
      let subcategoryId = subcategory?.id;

      if (subcategory) {
        // Edit mode - if there's a new image file, upload it first
        if (imageFile) {
          const uploadResult = await uploadSubCategoryImageAction(imageFile, subcategory.id);
          if (uploadResult.success && uploadResult.imageUrl) {
            formData.image = uploadResult.imageUrl;
          } else {
            toast.error(uploadResult.message);
            setLoading(false);
            return;
          }
        }
        result = await updateSubCategoryAction(subcategory.id, formData);
      } else {
        // Create mode - create subcategory first, then upload image if exists
        result = await createSubCategoryAction(formData);
        
        if (result.success && result.subCategoryId && imageFile) {
          subcategoryId = result.subCategoryId;
          const uploadResult = await uploadSubCategoryImageAction(imageFile, subcategoryId);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            // Update subcategory with the uploaded image URL
            await updateSubCategoryAction(subcategoryId, { image: uploadResult.imageUrl });
          } else {
            toast.warning('Subcategory created but image upload failed');
          }
        }
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
            key={`category-${formData.categoryId}-${isOpen}`}
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
          <Label htmlFor="image">Subcategory Image</Label>
          <ImageUploadField
            label="Subcategory Image"
            value={formData.image}
            onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
            onFileSelect={(file) => setImageFile(file)}
            entityType="subcategory"
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