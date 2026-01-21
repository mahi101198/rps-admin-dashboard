'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category } from '@/lib/types/all-schemas';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createCategoryAction, updateCategoryAction, uploadCategoryImageAction } from '@/actions/category-actions';
import { ImageUploadField } from '@/components/form/image-upload-field';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  image: z.string().url({ message: 'Must be a valid URL' }).or(z.literal('')),
  rank: z.number().min(0, { message: 'Rank must be 0 or greater' }),
  isActive: z.boolean(),
});

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ isOpen, onClose, category, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      image: '',
      rank: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        image: category.image || '',
        rank: category.rank || 0,
        isActive: category.isActive,
      });
      setImageFile(null);
    } else {
      form.reset({
        name: '',
        image: '',
        rank: 0,
        isActive: true,
      });
      setImageFile(null);
    }
  }, [category, form, isOpen]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      let result;
      let categoryId = category?.id;

      if (category) {
        // Edit mode - if there's a new image file, upload it first
        if (imageFile) {
          const uploadResult = await uploadCategoryImageAction(imageFile, category.id);
          if (uploadResult.success && uploadResult.imageUrl) {
            values.image = uploadResult.imageUrl;
          } else {
            toast.error(uploadResult.message);
            setLoading(false);
            return;
          }
        }
        result = await updateCategoryAction(category.id, values);
      } else {
        // Create mode - create category first, then upload image if exists
        result = await createCategoryAction(values);
        
        if (result.success && result.categoryId && imageFile) {
          categoryId = result.categoryId;
          const uploadResult = await uploadCategoryImageAction(imageFile, categoryId);
          
          if (uploadResult.success && uploadResult.imageUrl) {
            // Update category with the uploaded image URL
            await updateCategoryAction(categoryId, { image: uploadResult.imageUrl });
          } else {
            toast.warning('Category created but image upload failed');
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update category details' : 'Add a new product category'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics, Books, Clothing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Icon</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      label="Category Icon"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="https://example.com/image.png"
                      onFileSelect={(file) => setImageFile(file)}
                      entityType="category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Lower numbers appear first in the list
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {category ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  category ? 'Update Category' : 'Create Category'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}