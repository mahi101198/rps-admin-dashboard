'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Plus, Edit, Eye, Copy, Download } from 'lucide-react';

interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  dimensions: { width: number; height: number };
  category: string;
  createdAt: Date;
  useCount: number;
}

const BANNER_DIMENSIONS = [
  { id: 'wide', name: 'Wide Banner', width: 600, height: 200 },
  { id: 'tall', name: 'Tall Banner', width: 300, height: 600 },
  { id: 'square', name: 'Square Banner', width: 300, height: 300 },
  { id: 'mobile', name: 'Mobile Banner', width: 300, height: 500 },
];

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      name: 'Summer Sale 2024',
      imageUrl: 'https://via.placeholder.com/600x200?text=Summer+Sale',
      altText: 'Summer Sale Banner',
      linkUrl: 'https://yourstore.com/summer-sale',
      dimensions: { width: 600, height: 200 },
      category: 'promotional',
      createdAt: new Date(),
      useCount: 5,
    },
  ]);

  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Banner>>({});
  const [selectedDimension, setSelectedDimension] = useState(BANNER_DIMENSIONS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = ['promotional', 'seasonal', 'product', 'flash-sale', 'newsletter'];

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImagePreview(preview);
    };
    reader.readAsDataURL(file);
  };

  // Create new banner
  const createBanner = () => {
    if (!imagePreview || !editForm.name || !editForm.linkUrl) {
      alert('Please fill all fields');
      return;
    }

    const newBanner: Banner = {
      id: Date.now().toString(),
      name: editForm.name || '',
      imageUrl: imagePreview,
      altText: editForm.altText || '',
      linkUrl: editForm.linkUrl || '',
      dimensions: { ...selectedDimension },
      category: editForm.category || 'promotional',
      createdAt: new Date(),
      useCount: 0,
    };

    setBanners([...banners, newBanner]);
    setImagePreview('');
    setEditForm({});
    setShowUploadModal(false);
  };

  // Update banner
  const updateBanner = () => {
    if (!selectedBanner) return;

    const updated = {
      ...selectedBanner,
      ...editForm,
    };

    setBanners(banners.map((b) => (b.id === selectedBanner.id ? updated : b)));
    setShowEditModal(false);
    setSelectedBanner(updated);
    setEditForm({});
  };

  // Delete banner
  const deleteBanner = (id: string) => {
    if (confirm('Delete this banner?')) {
      setBanners(banners.filter((b) => b.id !== id));
      if (selectedBanner?.id === id) {
        setSelectedBanner(null);
      }
    }
  };

  // Duplicate banner
  const duplicateBanner = (banner: Banner) => {
    const duplicate: Banner = {
      ...banner,
      id: Date.now().toString(),
      name: `${banner.name} (Copy)`,
      useCount: 0,
    };
    setBanners([...banners, duplicate]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banner Manager</h2>
          <p className="text-gray-600 text-sm mt-1">Manage banners for email campaigns</p>
        </div>
        <Button
          onClick={() => {
            setEditForm({});
            setImagePreview('');
            setShowUploadModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banners Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                onClick={() => setSelectedBanner(banner)}
                className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-all group ${
                  selectedBanner?.id === banner.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Image Preview */}
                <div className="relative bg-gray-100 overflow-hidden h-40">
                  <img
                    src={banner.imageUrl}
                    alt={banner.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBanner(banner);
                        setEditForm(banner);
                        setShowEditModal(true);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateBanner(banner);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{banner.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {banner.dimensions.width}×{banner.dimensions.height}px
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Used {banner.useCount}x
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {banners.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">No banners uploaded yet</p>
              <Button
                onClick={() => setShowUploadModal(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload First Banner
              </Button>
            </div>
          )}
        </div>

        {/* Banner Details / Preview */}
        {selectedBanner && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Banner Details</h3>

            {/* Full Preview */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={selectedBanner.imageUrl}
                alt={selectedBanner.altText}
                className="w-full h-auto"
              />
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 font-medium">Name</p>
                <p className="text-sm font-semibold text-gray-900">{selectedBanner.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Dimensions</p>
                <p className="text-sm text-gray-900">
                  {selectedBanner.dimensions.width}×{selectedBanner.dimensions.height}px
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Category</p>
                <p className="text-sm text-gray-900 capitalize">{selectedBanner.category}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Link URL</p>
                <p className="text-xs text-blue-600 break-all">{selectedBanner.linkUrl}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Alt Text</p>
                <p className="text-sm text-gray-900">{selectedBanner.altText}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Uses</p>
                <p className="text-sm text-gray-900">{selectedBanner.useCount} times</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Created</p>
                <p className="text-sm text-gray-900">
                  {selectedBanner.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Copy Markdown */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">
                Markdown for Email
              </label>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 break-all">
                ![{selectedBanner.altText}]({selectedBanner.imageUrl})
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <Button
                onClick={() => {
                  setEditForm(selectedBanner);
                  setShowEditModal(true);
                }}
                variant="outline"
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => duplicateBanner(selectedBanner)}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                onClick={() => deleteBanner(selectedBanner.id)}
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          title="Upload New Banner"
          onClose={() => {
            setShowUploadModal(false);
            setImagePreview('');
            setEditForm({});
          }}
        >
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Dimension Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BANNER_DIMENSIONS.map((dim) => (
                  <button
                    key={dim.id}
                    onClick={() => setSelectedDimension(dim)}
                    className={`p-3 rounded border-2 transition-all text-center ${
                      selectedDimension.id === dim.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{dim.name}</p>
                    <p className="text-xs text-gray-500">
                      {dim.width}×{dim.height}px
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Name
              </label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <Input
                value={editForm.altText || ''}
                onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                placeholder="Describe the banner image"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <Input
                value={editForm.linkUrl || ''}
                onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
                placeholder="https://yourstore.com/campaign"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editForm.category || 'promotional'}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setImagePreview('');
                  setEditForm({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createBanner}
                disabled={!imagePreview || !editForm.name}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Upload Banner
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBanner && (
        <Modal
          title="Edit Banner"
          onClose={() => {
            setShowEditModal(false);
            setEditForm({});
          }}
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Name
              </label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <Input
                value={editForm.altText || ''}
                onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <Input
                value={editForm.linkUrl || ''}
                onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm({});
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={updateBanner}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
