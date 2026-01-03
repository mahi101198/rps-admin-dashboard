'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { createDynamicHomeSectionAction } from '@/actions/dynamic-home-section-actions';

export function CreateDynamicSectionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !sectionId || !title) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Use sectionId as type if type is not provided
    const sectionType = type || sectionId;
    
    setLoading(true);
    
    try {
      const result = await createDynamicHomeSectionAction(categoryId, sectionId, title, sectionType);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setTitle('');
        setCategoryId('');
        setSectionId('');
        setType('');
        // Refresh the page to show the new section
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Dynamic Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Dynamic Home Section</DialogTitle>
          <DialogDescription>
            Add a new dynamic section to a category's homepage. You can create any section ID you want.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoryId">Category ID *</Label>
            <Input
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="e.g., housekeeping"
              required
            />
          </div>
          <div>
            <Label htmlFor="sectionId">Section ID *</Label>
            <Input
              id="sectionId"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              placeholder="e.g., popular, flashSale, seasonal"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will create a new subcollection with this name
            </p>
          </div>
          <div>
            <Label htmlFor="title">Section Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Popular Products, Seasonal Offers"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Section Type (Optional)</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., popular, flashSale, recommended"
            />
            <p className="text-sm text-muted-foreground mt-1">
              If not provided, Section ID will be used as type
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}