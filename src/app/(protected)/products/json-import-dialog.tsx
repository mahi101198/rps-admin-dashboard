'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileJson, Copy, Check } from 'lucide-react';
import { ProductDetailsDocument } from '@/lib/types/product-details-sku';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JsonImportDialogProps {
  onImport: (product: ProductDetailsDocument) => void;
  children?: React.ReactNode;
}

const EXAMPLE_JSON = {
  product_id: 'PROD-001',
  title: 'Premium Notebook Set',
  subtitle: 'High-quality ruled notebooks',
  brand: 'BrandName',
  category: 'stationery',
  sub_category: 'notebooks',
  is_active: true,
  media: {
    main_image: {
      url: 'https://example.com/image.jpg',
      alt_text: 'Notebook Set'
    },
    gallery: [
      {
        url: 'https://example.com/image1.jpg',
        alt_text: 'Front view'
      },
      {
        url: 'https://example.com/image2.jpg',
        alt_text: 'Back view'
      }
    ]
  },
  variant_attributes: {
    size: ['A4', 'A5'],
    color: ['Red', 'Blue']
  },
  product_skus: [
    {
      sku_id: 'SKU-001',
      attributes: {
        size: 'A4',
        color: 'Red'
      },
      price: 150,
      mrp: 199,
      currency: 'INR',
      availability: 'in_stock',
      available_quantity: 100
    },
    {
      sku_id: 'SKU-002',
      attributes: {
        size: 'A5',
        color: 'Blue'
      },
      price: 100,
      mrp: 149,
      currency: 'INR',
      availability: 'in_stock',
      available_quantity: 50
    }
  ],
  overall_availability: 'in_stock',
  content_cards: [
    {
      card_id: 'card-1',
      title: 'Features',
      type: 'list',
      order: 1,
      data: ['Eco-friendly paper', 'Durable binding', 'Smooth pages']
    },
    {
      card_id: 'card-2',
      title: 'Specifications',
      type: 'key_value',
      order: 2,
      data: {
        Pages: '100',
        'Paper Weight': '80 gsm',
        Binding: 'Spiral'
      }
    }
  ],
  delivery_info: {
    estimated_delivery: '2-3 business days',
    return_policy: '30 days returns',
    cod_available: true
  },
  rating: {
    average: 4.5,
    count: 120
  },
  purchase_limits: {
    max_per_order: 10,
    max_per_user_per_day: 5
  }
};

export function JsonImportDialog({ onImport, children }: JsonImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [validating, setValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const copyExampleJson = () => {
    navigator.clipboard.writeText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Example JSON copied to clipboard');
  };

  const validateJson = (jsonStr: string): { valid: boolean; data?: ProductDetailsDocument; errors: string[] } => {
    const validationErrors: string[] = [];

    try {
      const data = JSON.parse(jsonStr);

      // Generate product_id if not provided
      if (!data.product_id || typeof data.product_id !== 'string' || !data.product_id.trim()) {
        data.product_id = `PROD-${Date.now()}`;
      } else {
        data.product_id = data.product_id.trim();
      }

      // Validate required text fields
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        validationErrors.push('title is required and must be a non-empty string');
      } else {
        data.title = data.title.trim();
      }

      if (!data.subtitle || typeof data.subtitle !== 'string' || !data.subtitle.trim()) {
        validationErrors.push('subtitle is required and must be a non-empty string');
      } else {
        data.subtitle = data.subtitle.trim();
      }

      if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
        validationErrors.push('category is required and must be a non-empty string');
      } else {
        data.category = data.category.trim();
      }

      if (!data.sub_category || typeof data.sub_category !== 'string' || !data.sub_category.trim()) {
        validationErrors.push('sub_category is required and must be a non-empty string');
      } else {
        data.sub_category = data.sub_category.trim();
      }

      // Validate media
      if (!data.media || !data.media.main_image) {
        validationErrors.push('media.main_image is required with url and alt_text');
      } else {
        const mainImageUrl = data.media.main_image.url?.trim();
        const mainImageAlt = data.media.main_image.alt_text?.trim();
        
        if (!mainImageUrl || !mainImageAlt) {
          validationErrors.push('media.main_image must have url and alt_text');
        } else if (!mainImageUrl.startsWith('http')) {
          validationErrors.push('media.main_image.url must start with http or https');
        } else {
          // Update with trimmed values
          data.media.main_image.url = mainImageUrl;
          data.media.main_image.alt_text = mainImageAlt;
        }
      }

      // Validate SKUs
      if (!Array.isArray(data.product_skus) || data.product_skus.length === 0) {
        validationErrors.push('At least one SKU is required in product_skus array');
      } else {
        data.product_skus.forEach((sku: any, index: number) => {
          if (!sku.sku_id) validationErrors.push(`SKU ${index}: sku_id is required`);
          if (typeof sku.price !== 'number' || sku.price < 0) {
            validationErrors.push(`SKU ${index}: price must be a non-negative number`);
          }
          if (typeof sku.mrp !== 'number' || sku.mrp < 0) {
            validationErrors.push(`SKU ${index}: mrp must be a non-negative number`);
          }
          if (sku.mrp < sku.price) {
            validationErrors.push(`SKU ${index}: mrp must be >= price`);
          }
          if (!['in_stock', 'limited', 'out_of_stock'].includes(sku.availability)) {
            validationErrors.push(`SKU ${index}: availability must be one of: in_stock, limited, out_of_stock`);
          }
          if (typeof sku.available_quantity !== 'number' || sku.available_quantity < 0) {
            validationErrors.push(`SKU ${index}: available_quantity must be a non-negative number`);
          }
        });
      }

      // Validate content cards
      if (!Array.isArray(data.content_cards) || data.content_cards.length === 0) {
        validationErrors.push('At least one content card is required');
      } else {
        data.content_cards.forEach((card: any, index: number) => {
          if (!card.card_id) validationErrors.push(`Content card ${index}: card_id is required`);
          if (!card.title) validationErrors.push(`Content card ${index}: title is required`);
          if (!card.type) validationErrors.push(`Content card ${index}: type is required`);
          if (!card.order || typeof card.order !== 'number') {
            validationErrors.push(`Content card ${index}: order must be a number`);
          }
          if (!card.data) validationErrors.push(`Content card ${index}: data is required`);
        });
      }

      // Validate delivery info
      if (!data.delivery_info) {
        validationErrors.push('delivery_info is required');
      } else {
        if (!data.delivery_info.estimated_delivery) {
          validationErrors.push('delivery_info.estimated_delivery is required');
        }
        if (!data.delivery_info.return_policy) {
          validationErrors.push('delivery_info.return_policy is required');
        }
        if (typeof data.delivery_info.cod_available !== 'boolean') {
          validationErrors.push('delivery_info.cod_available must be a boolean');
        }
      }

      // Validate rating
      if (!data.rating) {
        validationErrors.push('rating is required');
      } else {
        if (typeof data.rating.average !== 'number') {
          validationErrors.push('rating.average must be a number');
        }
        if (typeof data.rating.count !== 'number') {
          validationErrors.push('rating.count must be a number');
        }
      }

      // Validate purchase limits
      if (!data.purchase_limits) {
        validationErrors.push('purchase_limits is required');
      } else {
        if (!data.purchase_limits.max_per_order || typeof data.purchase_limits.max_per_order !== 'number') {
          validationErrors.push('purchase_limits.max_per_order must be a number');
        }
      }

      if (validationErrors.length > 0) {
        return { valid: false, errors: validationErrors };
      }

      return { valid: true, data, errors: [] };
    } catch (error) {
      const errorMsg = error instanceof SyntaxError ? error.message : 'Invalid JSON format';
      return { valid: false, errors: [`JSON Parse Error: ${errorMsg}`] };
    }
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setErrors(['Please paste JSON data']);
      return;
    }

    setValidating(true);
    setErrors([]);

    try {
      const validation = validateJson(jsonText);

      if (!validation.valid) {
        setErrors(validation.errors);
        toast.error(`Validation failed: ${validation.errors[0]}`);
        setValidating(false);
        return;
      }

      onImport(validation.data!);
      setJsonText('');
      setOpen(false);
      toast.success('Product imported successfully from JSON');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrors([errorMsg]);
      toast.error(`Failed to import: ${errorMsg}`);
    } finally {
      setValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Add from JSON
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Create Product from JSON
          </DialogTitle>
          <DialogDescription>
            Paste your product JSON data. Form fields will auto-fill for quick product creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Example JSON Card */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-sm">Product JSON Format</CardTitle>
              <CardDescription>
                Click "Copy Example" to get started with the format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <code className="text-xs bg-background p-2 rounded flex-1 overflow-x-auto">
                  {JSON.stringify(EXAMPLE_JSON, null, 2).slice(0, 200)}...
                </code>
                <Button
                  onClick={copyExampleJson}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Example
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* JSON Input */}
          <div className="space-y-2">
            <Label htmlFor="json-input">Product JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder="Paste your product JSON here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="font-mono text-xs h-64"
            />
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Validation Errors:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Required Fields Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Required Fields:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>title, subtitle, category, sub_category</li>
                <li>media (with main_image URL and alt_text)</li>
                <li>At least 1 SKU with price, mrp, availability</li>
                <li>At least 1 content card</li>
                <li>delivery_info, rating, purchase_limits</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">Note: product_id will be auto-generated if not provided</p>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setJsonText('');
                setErrors([]);
                setOpen(false);
              }}
              disabled={validating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={validating || !jsonText.trim()}
              className="flex items-center gap-2"
            >
              {validating ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Validating...
                </>
              ) : (
                <>
                  <FileJson className="h-4 w-4" />
                  Fill Form from JSON
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
