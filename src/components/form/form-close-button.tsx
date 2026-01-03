'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export default function FormCloseButton({ isFormDirty, onClick }: { isFormDirty: boolean; onClick: VoidFunction }) {
  const isMobile = useIsMobile();
  const [buttonText, setButtonText] = useState('Close');
  const handleClick = () => {
    if (!isFormDirty) {
      onClick();
      return;
    }

    if (buttonText === 'Close') {
      setButtonText('Discard Changes?');
      return;
    }

    setButtonText('Close');
    onClick();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className={cn(
        buttonText.includes('Discard') &&
          `hover:text-destructive-foreground hover:bg-destructive
          dark:hover:text-destructive-foreground dark:hover:bg-destructive`
      )}
    >
      {buttonText}
    </Button>
  );
}
