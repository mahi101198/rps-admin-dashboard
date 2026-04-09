'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductDetailsDocument } from '@/lib/types/product-details-sku';
import { 
  CheckCircle,
  XCircle,
  Package,
  Boxes,
  Wallet,
  Eye,
  Edit,
  Trash,
  RefreshCw,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Info,
  List,
  FileText,
  Tag,
  ShoppingCart,
  Truck,
  IndianRupee,
  Play,
  Copy
} from 'lucide-react';

interface ProductViewProps {
  product: ProductDetailsDocument;
  onClose?: () => void;
}

export function ProductView({ product, onClose }: ProductViewProps) {
  const getAvailabilityBadge = (availability: string | undefined) => {
    switch (availability) {
      case 'in_stock':
        return <Badge className="bg-green-500 hover:bg-green-500">In Stock</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500">Limited</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-500 hover:bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge>{availability}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    return isActive ? (
      <Badge variant="default">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case 'text':
        return <Badge variant="outline">Text</Badge>;
      case 'list':
        return <Badge variant="outline">List</Badge>;
      case 'steps':
        return <Badge variant="outline">Steps</Badge>;
      case 'key_value':
        return <Badge variant="outline">Key-Value</Badge>;
      case 'warning':
        return <Badge variant="destructive">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatCardData = (data: string | string[] | Record<string, string>) => {
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (typeof data === 'object' && data !== null) {
      return (
        <dl className="grid grid-cols-2 gap-2">
          {Object.entries(data).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt className="font-semibold text-muted-foreground">{key}:</dt>
              <dd>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      );
    } else {
      return <p>{data}</p>;
    }
  };

  return (
    <div className="space-y-6 w-full overflow-y-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {product.title}
              </CardTitle>
              <CardDescription className="mt-1">{product.subtitle}</CardDescription>
            </div>
            <div>
              {getStatusBadge(product.is_active)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Product ID</div>
            <div className="font-medium font-mono text-sm flex items-center gap-2">
              {product.product_id}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(product.product_id);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Brand</div>
            <div className="font-medium">{product.brand}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Category</div>
            <div className="font-medium">{product.category}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Sub Category</div>
            <div className="font-medium">{product.sub_category}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Rating</div>
            <div className="font-medium">{product.rating?.average || 0} ({product.rating?.count || 0} reviews)</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">SKUs</div>
            <div className="font-medium">{product.product_skus.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Availability</div>
            <div>{getAvailabilityBadge(product.overall_availability)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Created At</div>
            <div>{new Date(product.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Updated At</div>
            <div>{new Date(product.updated_at).toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">
            {(typeof product.content_cards?.find(card => card.card_id === 'description')?.data === 'string' 
              ? product.content_cards?.find(card => card.card_id === 'description')?.data 
              : 'No description available') as string}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            SKUs
          </CardTitle>
          <CardDescription>Variant level pricing and inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.product_skus.map(sku => (
                  <TableRow key={sku.sku_id}>
                    <TableCell className="font-mono text-sm">{sku.sku_id}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(sku.attributes || {}).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-semibold">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {sku.mrp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {sku.price}
                      </div>
                    </TableCell>
                    <TableCell>{sku.currency}</TableCell>
                    <TableCell>{sku.available_quantity}</TableCell>
                    <TableCell>{getAvailabilityBadge(sku.availability)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {product.variant_attributes && Object.keys(product.variant_attributes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Variant Attributes
            </CardTitle>
            <CardDescription>Available selections for this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.variant_attributes).map(([attributeName, attributeValues]) => (
                <div key={attributeName}>
                  <div className="text-sm text-muted-foreground capitalize">{attributeName}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {attributeValues.map((value, index) => (
                      <Badge key={index} variant="outline">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Content Cards
          </CardTitle>
          <CardDescription>Additional product information and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {product.content_cards.map((card) => (
              <Card key={card.card_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{card.title}</span>
                    {getContentTypeBadge(card.type)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formatCardData(card.data)}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Cash on Delivery</div>
            <div>{product.delivery_info.cod_available ? 'Available' : 'Not Available'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Estimated Delivery</div>
            <div>{product.delivery_info.estimated_delivery || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Free Delivery Above</div>
            <div>
              {product.delivery_info.free_delivery_threshold 
                ? `₹${product.delivery_info.free_delivery_threshold}` 
                : 'Not specified'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Return Policy</div>
            <div>{product.delivery_info.return_policy}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Limits
          </CardTitle>
          <CardDescription>Order and usage restrictions for this product</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Max Per Order</div>
            <div className="font-medium">{product.purchase_limits?.max_per_order || 'Not specified'} items</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Max Per User Per Day</div>
            <div className="font-medium">{product.purchase_limits?.max_per_user_per_day ? `${product.purchase_limits.max_per_user_per_day} items` : 'Unlimited'}</div>
          </div>
        </CardContent>
      </Card>

      {product.media && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {product.media.main_image && (
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Main Image</div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.media.main_image.url} 
                      alt={product.media.main_image.alt_text} 
                      className="w-40 h-40 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold">Alt Text:</span> {product.media.main_image.alt_text}
                      </div>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">URL:</span>
                        <div className="text-xs font-mono text-gray-600 break-all mt-1">{product.media.main_image.url}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {product.media.gallery && product.media.gallery.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-3">Gallery Media ({product.media.gallery.length})</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {product.media.gallery.map((media, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {media.type === 'video' || media.videoUrl ? (
                          <div className="relative w-full aspect-square bg-black rounded-md border border-gray-300 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white opacity-70" />
                            <span className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                              Video
                            </span>
                          </div>
                        ) : (
                          <img 
                            src={media.url} 
                            alt={media.alt_text} 
                            className="w-full aspect-square object-cover rounded-md border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="text-xs mt-2 text-center text-gray-600 break-words w-full">{media.alt_text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}