'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Plus, Trash2, Eye, Send, Copy, X, Settings, Grid, Search, ShoppingCart, Link as LinkIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  originalPrice?: number;
}

// Mock products data - replace with real API call
const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Premium Notebook A4', 
    price: 299, 
    image: 'https://images.unsplash.com/photo-1507842425343-583cf155a306?w=400&h=400&fit=crop', 
    category: 'stationery',
    originalPrice: 499 
  },
  { 
    id: '2', 
    name: 'Professional Pen Set', 
    price: 149, 
    image: 'https://images.unsplash.com/photo-1577720643272-265f434a4f7f?w=400&h=400&fit=crop', 
    category: 'pens',
    originalPrice: 299 
  },
  { 
    id: '3', 
    name: 'Sketch Pencil Collection', 
    price: 199, 
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop', 
    category: 'pencils',
    originalPrice: 399 
  },
  { 
    id: '4', 
    name: 'Highlighter Set Premium', 
    price: 179, 
    image: 'https://images.unsplash.com/photo-1516062423479-7f3a2d9c73d4?w=400&h=400&fit=crop', 
    category: 'markers',
    originalPrice: 299 
  },
  { 
    id: '5', 
    name: 'Professional Art Canvas', 
    price: 499, 
    image: 'https://images.unsplash.com/photo-1561214115-6d2f1b1b6f8d?w=400&h=400&fit=crop', 
    category: 'art',
    originalPrice: 899 
  },
  { 
    id: '6', 
    name: 'Drawing Board Studio', 
    price: 599, 
    image: 'https://images.unsplash.com/photo-1565193566173-7ceb7e21d703?w=400&h=400&fit=crop', 
    category: 'art',
    originalPrice: 999 
  },
];

interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'products' | 'banner' | 'cta' | 'spacer' | 'divider';
  content: any;
}

interface Email {
  id: string;
  templateName: string;
  subject: string;
  previewText: string;
  blocks: EmailBlock[];
  createdAt: Date;
}

export default function EmailComposer() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch products from database on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.log('Using mock products');
      }
    };

    fetchProducts();
  }, []);

  // Create new email
  const createNewEmail = () => {
    const newEmail: Email = {
      id: Date.now().toString(),
      templateName: 'Untitled Campaign',
      subject: 'Your Email Subject',
      previewText: 'Preview text',
      blocks: [
        {
          id: '1',
          type: 'header',
          content: {
            text: 'Welcome to Our Store!',
            align: 'center',
            bgColor: selectedColor,
          },
        },
      ],
      createdAt: new Date(),
    };
    setCurrentEmail(newEmail);
    setEmails([...emails, newEmail]);
  };

  // Add block to email
  const addBlock = (type: EmailBlock['type']) => {
    if (!currentEmail) return;

    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultBlockContent(type),
    };

    const updatedEmail = {
      ...currentEmail,
      blocks: [...currentEmail.blocks, newBlock],
    };

    setCurrentEmail(updatedEmail);
    setEmails(emails.map((e) => (e.id === currentEmail.id ? updatedEmail : e)));
  };

  const getDefaultBlockContent = (type: EmailBlock['type']) => {
    switch (type) {
      case 'header':
        return { text: 'Header Text', align: 'center', bgColor: selectedColor };
      case 'text':
        return { text: 'Click to edit text', align: 'left', fontSize: 16 };
      case 'products':
        return { products: [], columns: 2 };
      case 'banner':
        return { imageUrl: '', alt: 'Banner', link: 'https://your-site.com' };
      case 'cta':
        return { text: 'Call to Action', bgColor: selectedColor, textColor: 'white', link: 'https://your-site.com' };
      case 'spacer':
        return { height: 20 };
      case 'divider':
        return { color: '#e5e7eb', height: 1 };
    }
  };

  // Update block
  const updateBlock = (blockId: string, newContent: any) => {
    if (!currentEmail) return;

    const updatedEmail = {
      ...currentEmail,
      blocks: currentEmail.blocks.map((block) =>
        block.id === blockId ? { ...block, content: newContent } : block
      ),
    };

    setCurrentEmail(updatedEmail);
    setEmails(emails.map((e) => (e.id === currentEmail.id ? updatedEmail : e)));
  };

  // Delete block
  const deleteBlock = (blockId: string) => {
    if (!currentEmail) return;

    const updatedEmail = {
      ...currentEmail,
      blocks: currentEmail.blocks.filter((block) => block.id !== blockId),
    };

    setCurrentEmail(updatedEmail);
    setEmails(emails.map((e) => (e.id === currentEmail.id ? updatedEmail : e)));
  };

  // Reorder blocks
  const reorderBlocks = (blockId: string, direction: 'up' | 'down') => {
    if (!currentEmail) return;

    const index = currentEmail.blocks.findIndex((b) => b.id === blockId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentEmail.blocks.length - 1)) {
      return;
    }

    const newBlocks = [...currentEmail.blocks];
    const swap = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swap]] = [newBlocks[swap], newBlocks[index]];

    const updatedEmail = {
      ...currentEmail,
      blocks: newBlocks,
    };

    setCurrentEmail(updatedEmail);
    setEmails(emails.map((e) => (e.id === currentEmail.id ? updatedEmail : e)));
  };

  return (
    <div className="space-y-4">
      {!currentEmail ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Empty State */}
          <div className="md:col-span-2">
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-dashed border-blue-200">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Email Campaign Created</h3>
              <p className="text-gray-600 mb-6">Create your first email campaign to get started</p>
              <Button onClick={createNewEmail} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Campaign
              </Button>
            </div>
          </div>

          {/* Existing Emails List */}
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setCurrentEmail(email)}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-1">{email.templateName}</h4>
              <p className="text-sm text-gray-600 mb-3">{email.subject}</p>
              <p className="text-xs text-gray-500">Blocks: {email.blocks.length}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
          {/* Left Sidebar - Email Settings */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setCurrentEmail(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Email Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <Input
                  value={currentEmail.templateName}
                  onChange={(e) => {
                    const updated = { ...currentEmail, templateName: e.target.value };
                    setCurrentEmail(updated);
                    setEmails(emails.map((em) => (em.id === currentEmail.id ? updated : em)));
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <Input
                  value={currentEmail.subject}
                  onChange={(e) => {
                    const updated = { ...currentEmail, subject: e.target.value };
                    setCurrentEmail(updated);
                    setEmails(emails.map((em) => (em.id === currentEmail.id ? updated : em)));
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview Text</label>
                <Input
                  value={currentEmail.previewText}
                  onChange={(e) => {
                    const updated = { ...currentEmail, previewText: e.target.value };
                    setCurrentEmail(updated);
                    setEmails(emails.map((em) => (em.id === currentEmail.id ? updated : em)));
                  }}
                  className="w-full"
                  placeholder="Text shown in inbox preview"
                />
              </div>
            </div>

            {/* Color Picker */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">Brand Color</label>
              <div className="flex gap-2">
                {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#000000'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Add Blocks */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Add Block</p>
              <div className="grid grid-cols-2 gap-2">
                <BlockButton icon="📝" label="Text" onClick={() => addBlock('text')} />
                <BlockButton icon="📦" label="Products" onClick={() => addBlock('products')} />
                <BlockButton icon="🖼️" label="Banner" onClick={() => addBlock('banner')} />
                <BlockButton icon="🔘" label="CTA" onClick={() => addBlock('cta')} />
                <BlockButton icon="📐" label="Spacer" onClick={() => addBlock('spacer')} />
                <BlockButton icon="━" label="Divider" onClick={() => addBlock('divider')} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={async () => {
                  if (!currentEmail) {
                    alert('No email selected');
                    return;
                  }
                  
                  const recipient = prompt('Enter recipient email address:');
                  if (!recipient) return;
                  
                  try {
                    const response = await fetch('/api/marketing/send-email', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        type: 'single',
                        recipients: [recipient],
                        subject: currentEmail.subject || 'Marketing Email',
                        htmlContent: currentEmail.blocks.map((block) => {
                          if (block.type === 'header') return `<h1>${block.content}</h1>`;
                          if (block.type === 'text') return `<p>${block.content}</p>`;
                          if (block.type === 'spacer') return '<br />';
                          if (block.type === 'divider') return '<hr />';
                          return '';
                        }).join('\n'),
                      }),
                    });
                    
                    const data = await response.json();
                    if (response.ok) {
                      alert(`✅ Email sent successfully to ${recipient}`);
                    } else {
                      alert(`❌ Error: ${data.error}`);
                    }
                  } catch (error) {
                    alert(`❌ Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Campaign
              </Button>
              <Button variant="outline" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="font-semibold text-gray-900">{currentEmail.templateName}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Email Canvas / Preview */}
            <div className={`bg-white rounded-lg border border-gray-200 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-300px)]`}>
              {previewMode ? (
                <EmailPreview blocks={currentEmail.blocks} ref={previewRef} />
              ) : (
                <div className="space-y-3 max-w-2xl mx-auto">
                  {currentEmail.blocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="mb-2">No blocks added yet</p>
                      <p className="text-sm">Add blocks from the sidebar to build your email</p>
                    </div>
                  ) : (
                    currentEmail.blocks.map((block) => (
                      <BlockEditor
                        key={block.id}
                        block={block}
                        onUpdate={(content) => updateBlock(block.id, content)}
                        onDelete={() => deleteBlock(block.id)}
                        onReorder={(direction) => reorderBlocks(block.id, direction)}
                        canMoveUp={currentEmail.blocks[0].id !== block.id}
                        canMoveDown={currentEmail.blocks[currentEmail.blocks.length - 1].id !== block.id}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Block Button Component
function BlockButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
    >
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </button>
  );
}

// Block Editor Component
function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onReorder,
  canMoveUp,
  canMoveDown,
}: {
  block: EmailBlock;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onReorder: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 group hover:border-blue-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-gray-600 uppercase">{block.type}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onReorder('up')}
            disabled={!canMoveUp}
            className="p-1 hover:bg-white rounded disabled:opacity-50"
            title="Move up"
          >
            <ChevronDown className="w-4 h-4 transform rotate-180" />
          </button>
          <button
            onClick={() => onReorder('down')}
            disabled={!canMoveDown}
            className="p-1 hover:bg-white rounded disabled:opacity-50"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-50 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Block specific editors */}
      {block.type === 'text' && (
        <textarea
          value={block.content.text}
          onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
          className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      )}

      {block.type === 'header' && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content.text}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {block.type === 'cta' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={block.content.text}
              onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Button text"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Link URL</label>
            <input
              type="url"
              value={block.content.link || ''}
              onChange={(e) => onUpdate({ ...block.content, link: e.target.value })}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-site.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Color</label>
            <div className="flex gap-2">
              {['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'].map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdate({ ...block.content, bgColor: color })}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    block.content.bgColor === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {block.type === 'banner' && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content.imageUrl}
            onChange={(e) => onUpdate({ ...block.content, imageUrl: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Image URL"
          />
          <input
            type="text"
            value={block.content.link}
            onChange={(e) => onUpdate({ ...block.content, link: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Link URL"
          />
        </div>
      )}

      {block.type === 'products' && (
        <ProductBlockEditor 
          block={block} 
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

// Email Preview Component
const EmailPreview = React.forwardRef(function Preview(
  { blocks }: { blocks: EmailBlock[] },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div ref={ref} className="max-w-2xl mx-auto">
      {blocks.map((block) => (
        <div key={block.id}>
          {block.type === 'header' && (
            <div
              className="p-4 text-white text-center font-bold text-2xl"
              style={{ backgroundColor: block.content.bgColor }}
            >
              {block.content.text}
            </div>
          )}

          {block.type === 'text' && (
            <div className="p-4 text-gray-800">{block.content.text}</div>
          )}

          {block.type === 'cta' && (
            <div className="p-4 text-center">
              <a
                href={block.content.link || '#'}
                className="inline-block px-8 py-3 text-white rounded font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ 
                  backgroundColor: block.content.bgColor,
                  textDecoration: 'none'
                }}
              >
                {block.content.text}
              </a>
              {block.content.link && (
                <p className="text-xs text-gray-500 mt-2 break-all">{block.content.link}</p>
              )}
            </div>
          )}

          {block.type === 'banner' && block.content.imageUrl && (
            <div className="p-4">
              <img
                src={block.content.imageUrl}
                alt={block.content.alt}
                className="w-full rounded"
              />
            </div>
          )}

          {block.type === 'spacer' && <div style={{ height: `${block.content.height}px` }} />}

          {block.type === 'divider' && (
            <div
              className="mx-4 my-2"
              style={{
                height: `${block.content.height}px`,
                backgroundColor: block.content.color,
              }}
            />
          )}

          {block.type === 'products' && block.content.products.length > 0 && (
            <div className="p-4">
              <div className={`grid grid-cols-1 sm:grid-cols-${block.content.columns} gap-4`}>
                {block.content.products.map((product: Product) => (
                  <div key={product.id} className="border border-gray-200 rounded overflow-hidden hover:shadow-md transition-shadow">
                    {/* Product Image */}
                    <div className="w-full h-40 bg-gray-200 overflow-hidden flex items-center justify-center">
                      {product.image && product.image.startsWith('http') ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-3xl">{product.image || '📦'}</div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="p-3 text-center">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-gray-500 line-through">₹{product.originalPrice}</p>
                      )}
                      <p className="text-blue-600 font-bold text-sm mt-1">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

// Product Block Editor Component
function ProductBlockEditor({
  block,
  onUpdate,
}: {
  block: EmailBlock;
  onUpdate: (content: any) => void;
}) {
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Fetch products on mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data);
        }
      } catch (error) {
        console.log('Using mock products');
      }
    };

    fetchProducts();
  }, []);

  const selectedProductIds = block.content.products.map((p: Product) => p.id);
  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleProduct = (product: Product) => {
    const isSelected = selectedProductIds.includes(product.id);
    const updatedProducts = isSelected
      ? block.content.products.filter((p: Product) => p.id !== product.id)
      : [...block.content.products, product];

    onUpdate({
      ...block.content,
      products: updatedProducts,
    });
  };

  const removeProduct = (productId: string) => {
    onUpdate({
      ...block.content,
      products: block.content.products.filter((p: Product) => p.id !== productId),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Columns: {block.content.columns}
          </label>
          <input
            type="range"
            min="1"
            max="4"
            value={block.content.columns}
            onChange={(e) =>
              onUpdate({ ...block.content, columns: parseInt(e.target.value) })
            }
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Selected Products Display */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Selected Products ({block.content.products.length})
        </label>
        {block.content.products.length > 0 ? (
          <div className={`grid grid-cols-2 sm:grid-cols-${block.content.columns} gap-2`}>
            {block.content.products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-blue-600">₹{product.price}</p>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="ml-1 text-red-600 hover:text-red-700 flex-shrink-0"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No products selected</p>
        )}
      </div>

      {/* Product Picker Button */}
      <button
        onClick={() => setShowProductPicker(!showProductPicker)}
        className="w-full p-3 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-4 h-4" />
        {showProductPicker ? 'Hide Products' : '+ Add Products'}
      </button>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {filteredProducts.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  className={`p-2 rounded border-2 text-center transition-all overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Product Image */}
                  <div className="w-full h-20 bg-gray-200 rounded mb-1 overflow-hidden flex items-center justify-center">
                    {product.image && product.image.startsWith('http') ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling) {
                            (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div style={{ display: product.image && product.image.startsWith('http') ? 'none' : 'flex' }} className="text-3xl">
                      {typeof product.image === 'string' && product.image.startsWith('http') ? '📦' : product.image || '📦'}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-600 font-bold">₹{product.price}</p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-xs text-red-600 line-through">₹{product.originalPrice}</p>
                  )}
                  {isSelected && (
                    <div className="text-xs text-blue-600 font-bold mt-1">✓ Added</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

