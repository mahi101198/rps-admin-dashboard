'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Edit, Trash2, Download, Copy } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TemplateLibraryProps {
  templates: Template[];
  onSelect?: (templateId: string) => void;
}

const categoryColors: { [key: string]: string } = {
  promotional: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  announcement: 'bg-blue-100 text-blue-800',
  seasonal: 'bg-red-100 text-red-800',
  custom: 'bg-gray-100 text-gray-800',
};

export function TemplateLibrary({ templates, onSelect }: TemplateLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelect?.(templateId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Email Templates Library</h2>
        <p className="text-muted-foreground">
          Browse and manage your email marketing templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge className={categoryColors[template.category] || 'bg-gray-100'}>
                    {template.category}
                  </Badge>
                </div>
              </div>
              <CardDescription className="mt-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                      <DialogDescription>
                        Template preview - {template.description}
                      </DialogDescription>
                    </DialogHeader>
                    {/* Preview content will be rendered here */}
                    <div className="text-sm text-muted-foreground">
                      Template ID: {template.id}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant={selectedTemplate === template.id ? 'default' : 'outline'}
                  onClick={() => handleSelectTemplate(template.id)}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
