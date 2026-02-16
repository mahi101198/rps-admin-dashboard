'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import React from 'react';

interface KeyValueEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function KeyValueEditor({ value, onChange }: KeyValueEditorProps) {
  const keyValuePairs = Object.entries(value || {});

  const handleKeyChange = (index: number, newValue: string) => {
    const newKeyValuePairs = [...keyValuePairs];
    newKeyValuePairs[index][0] = newValue;
    const newObj: Record<string, string> = {};
    newKeyValuePairs.forEach(([k, v]) => {
      if (k.trim()) newObj[k.trim()] = v;
    });
    onChange(newObj);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newKeyValuePairs = [...keyValuePairs];
    newKeyValuePairs[index][1] = newValue;
    const newObj: Record<string, string> = {};
    newKeyValuePairs.forEach(([k, v]) => {
      if (k.trim()) newObj[k.trim()] = v;
    });
    onChange(newObj);
  };

  const handleRemovePair = (index: number) => {
    const newKeyValuePairs = [...keyValuePairs];
    newKeyValuePairs.splice(index, 1);
    const newObj: Record<string, string> = {};
    newKeyValuePairs.forEach(([k, v]) => {
      if (k.trim()) newObj[k.trim()] = v;
    });
    onChange(newObj);
  };

  const handleAddPair = () => {
    const newObj = { ...value };
    const newKey = `New Key ${Object.keys(newObj).length + 1}`;
    newObj[newKey] = '';
    onChange(newObj);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 mb-2 p-2 bg-blue-50 rounded border border-blue-200">
        Add key-value pairs separately
      </div>
      <div className="space-y-2">
        {keyValuePairs.map(([key, val], index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="Key"
                value={key}
                className="h-8 text-sm"
                onChange={(e) => handleKeyChange(index, e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Value"
                value={val}
                className="h-8 text-sm"
                onChange={(e) => handleValueChange(index, e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRemovePair(index)}
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPair}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Key-Value Pair
        </Button>
      </div>
    </div>
  );
}