'use client';

import React, { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { type VariantProps } from 'class-variance-authority';

interface ActionButtonProps extends 
  Omit<React.ComponentProps<'button'>, 'onClick'>,
  VariantProps<typeof buttonVariants> {
  action: () => Promise<{ success: boolean; message: string }>;
  successMessage?: string;
  confirmMessage?: string;
  loadingText?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export function ActionButton({ 
  action, 
  successMessage, 
  confirmMessage, 
  loadingText,
  children, 
  ...props 
}: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await action();
      if (result.success) {
        toast.success(successMessage || result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      {...props} 
      onClick={handleClick} 
      disabled={isLoading || props.disabled}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? (loadingText || 'Loading...') : children}
    </Button>
  );
}