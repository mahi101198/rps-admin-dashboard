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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { createHomeSectionAction } from '@/actions/home-section-actions';

export function CreateSectionDialog({ onSectionCreated }: { onSectionCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [type, setType] = useState<'flashSale' | 'popular' | 'recommended' | 'banner' | 'newArrivals'>('popular');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !sectionId || !title) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await createHomeSectionAction(categoryId, {
        sectionId,
        title,
        type,
      });
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setTitle('');
        setCategoryId('');
        setSectionId('');
        // Call the callback to notify parent component instead of reloading
        onSectionCreated?.();
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
          Create Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Home Section</DialogTitle>
          <DialogDescription>
            Add a new section to a category's homepage to feature products.
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
              placeholder="e.g., popular, flashSale"
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Section Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Recommended Products"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Section Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="flashSale">Flash Sale</SelectItem>
                <SelectItem value="newArrivals">New Arrivals</SelectItem>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
              </SelectContent>
            </Select>
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