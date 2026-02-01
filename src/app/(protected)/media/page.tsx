'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, Download, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import {
  getAllImagesAction,
  getProductImagesAction,
  getCategoryImagesAction,
  getSubcategoryImagesAction,
  getBannerImagesAction,
  StorageFile,
} from '@/actions/media-actions';

export default function MediaManagerPage() {
  const [allImages, setAllImages] = useState<StorageFile[]>([]);
  const [productImages, setProductImages] = useState<StorageFile[]>([]);
  const [categoryImages, setCategoryImages] = useState<StorageFile[]>([]);
  const [subcategoryImages, setSubcategoryImages] = useState<StorageFile[]>([]);
  const [bannerImages, setBannerImages] = useState<StorageFile[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Load all images on mount
  useEffect(() => {
    loadAllImages();
  }, []);

  const loadAllImages = async () => {
    setLoading(true);
    try {
      const [all, products, categories, subcategories, banners] = await Promise.all([
        getAllImagesAction(),
        getProductImagesAction(),
        getCategoryImagesAction(),
        getSubcategoryImagesAction(),
        getBannerImagesAction(),
      ]);

      setAllImages(all);
      setProductImages(products);
      setCategoryImages(categories);
      setSubcategoryImages(subcategories);
      setBannerImages(banners);
      
      toast.success('Images loaded successfully');
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const ImageGrid = ({ images }: { images: StorageFile[] }) => {
    const filtered = images.filter((img) =>
      img.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No images found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((image) => (
          <Card key={image.path} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative group aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(image.url)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                  >
                    <a href={image.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={image.name}>
                  {image.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(image.size / 1024).toFixed(2)} KB
                </p>
                <div className="mt-2">
                  <input
                    type="text"
                    value={image.url}
                    readOnly
                    className="w-full text-xs px-2 py-1 bg-slate-50 rounded border border-slate-200 cursor-pointer hover:bg-slate-100"
                    onClick={(e) => {
                      e.currentTarget.select();
                      copyToClipboard(image.url);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Manager</h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage images from Firebase Storage
          </p>
        </div>
        <Button onClick={loadAllImages} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Images</CardTitle>
          <CardDescription>Find images by name</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Image Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({allImages.length})
          </TabsTrigger>
          <TabsTrigger value="products">
            Products ({productImages.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categoryImages.length})
          </TabsTrigger>
          <TabsTrigger value="subcategories">
            Subcategories ({subcategoryImages.length})
          </TabsTrigger>
          <TabsTrigger value="banners">
            Banners ({bannerImages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Images</CardTitle>
              <CardDescription>
                View and copy URLs of all images in Firebase Storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGrid images={allImages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Images used for product listings and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGrid images={productImages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Images</CardTitle>
              <CardDescription>
                Images for main product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGrid images={categoryImages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subcategory Images</CardTitle>
              <CardDescription>
                Images for product subcategories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGrid images={subcategoryImages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banner Images</CardTitle>
              <CardDescription>
                Images used for promotional banners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGrid images={bannerImages} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>✓ Copy URL:</strong> Click the "Copy" button or click on the URL field to copy the image link
          </p>
          <p>
            <strong>✓ Open in Browser:</strong> Click the "Open" button to view the image in a new tab
          </p>
          <p>
            <strong>✓ Use in Products:</strong> Paste the copied URL in product image fields or media fields
          </p>
          <p>
            <strong>✓ Search:</strong> Use the search box to quickly find specific images
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
