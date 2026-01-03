'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Trash2 } from 'lucide-react';

interface FormDeleteButtonProps {
  productId?: string;
  onDelete: (productId: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function FormDeleteButton({ productId, onDelete, isDeleting = false }: FormDeleteButtonProps) {
  const isMobile = useIsMobile();
  const [buttonText, setButtonText] = useState('Delete');

  const handleClick = async () => {
    if (!productId) return;

    if (buttonText === 'Delete') {
      setButtonText('Confirm Delete?');
      return;
    }

    if (buttonText === 'Confirm Delete?') {
      await onDelete(productId);
      setButtonText('Delete');
    }
  };

  // Don't show delete button if no productId (create mode)
  if (!productId) return null;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isDeleting}
      className={cn(
        'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground',
        buttonText.includes('Confirm') && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      )}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? 'Deleting...' : buttonText}
    </Button>
  );
}
