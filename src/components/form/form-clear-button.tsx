'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrushCleaning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export default function FormClearButton({ isFormDirty, onClick }: { isFormDirty: boolean; onClick: VoidFunction }) {
  const isMobile = useIsMobile();
  const [buttonText, setButtonText] = useState('Clear Form');
  const handleClick = () => {
    if (buttonText === 'Clear Form') {
      setButtonText('Discard Changes?');
      return;
    }

    setButtonText('Clear Form');
    onClick();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={!isFormDirty}
      className={cn(
        'absolute top-4 right-6',
        isMobile && 'hidden',
        buttonText.includes('Discard') &&
          `hover:text-destructive-foreground hover:bg-destructive
          dark:hover:text-destructive-foreground dark:hover:bg-destructive`
      )}
    >
      <BrushCleaning className="h-5 w-5" />
      {buttonText}
    </Button>
  );
}
