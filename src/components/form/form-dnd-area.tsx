import { cn } from "@/lib/utils";
import { useState } from "react";

export default function FormDragAndDropArea({
  onDrop,
  children,
  showBackground = false,
}: {
  onDrop: (files: FileList) => void;
  children: React.ReactNode;
  showBackground?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onDrop(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'w-full h-full min-h-[200px] rounded-md transition-colors',
        showBackground && 'border-2 border-dashed border-less-muted bg-less-muted/30',
        isDragging && 'border-primary bg-primary/10'
      )}
    >
      {children}
    </div>
  );
}
