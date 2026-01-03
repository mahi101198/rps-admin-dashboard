'use client';

import { useState, useEffect } from 'react';
import { getCouponsAction, createCouponAction, updateCouponAction, deleteCouponAction, toggleCouponStatusAction } from '@/actions/coupon-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MoreHorizontal, Edit, Trash2, Power, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the Coupon type based on the usage in coupon-actions.ts
interface Coupon {
  couponId: string;
  code: string;
  title: string;
  description: string;
  type: 'flat' | 'percentage';
  value: number;
  maxDiscount: number | null;
  minOrderValue: number;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define CouponStatus type
type CouponStatus = 'active' | 'expired' | 'draft';

// Helper function to safely convert timestamps to Date objects
function convertTimestampToDate(timestamp: any): Date {
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Fallback
  return new Date();
}

function getStatusBadgeVariant(status: CouponStatus) {
  switch (status) {
    case 'active':
      return 'default';
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getCouponStats(coupons: Coupon[]) {
  const now = new Date();
  return {
    total: coupons.length,
    active: coupons.filter(c => c.isActive && convertTimestampToDate(c.validUntil) > now).length,
    expired: coupons.filter(c => !c.isActive || convertTimestampToDate(c.validUntil) <= now).length,
    flatDiscount: coupons.filter(c => c.type === 'flat').length,
    percentageDiscount: coupons.filter(c => c.type === 'percentage').length,
    totalDiscountValue: coupons
      .filter(c => c.type === 'flat')
      .reduce((sum, coupon) => sum + (coupon?.value || 0), 0),
    highValueCoupons: coupons.filter(c => 
      (c.type === 'flat' && (c.value || 0) >= 100) ||
      (c.type === 'percentage' && (c.value || 0) >= 20)
    ).length,
    avgMinOrder: coupons.length > 0 ? 
      coupons.reduce((sum, c) => sum + (c?.minOrderValue || 0), 0) / coupons.length : 0
  };
}

function isExpiringSoon(validUntil: Date): boolean {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  return validUntil <= sevenDaysFromNow && validUntil > now;
}

function getDiscountTypeBadgeVariant(type: 'flat' | 'percent') {
  switch (type) {
    case 'percent':
      return 'secondary';
    case 'flat':
      return 'outline';
    default:
      return 'outline';
  }
}

function CouponForm({ 
  coupon, 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  coupon?: Coupon | undefined; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    title: coupon?.title || '',
    description: coupon?.description || '',
    type: coupon?.type || 'flat',
    value: coupon?.value || 0,
    maxDiscount: coupon?.maxDiscount || null,
    minOrderValue: coupon?.minOrderValue || 0,
    validUntil: coupon?.validUntil ? convertTimestampToDate(coupon.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    validFrom: coupon?.validFrom ? convertTimestampToDate(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isActive: coupon?.isActive ?? true,
    usageLimit: coupon?.usageLimit || 0,
    applicableCategories: coupon?.applicableCategories?.join(',') || '',
    applicableProducts: coupon?.applicableProducts?.join(',') || ''
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        title: coupon.title || '',
        description: coupon.description || '',
        type: coupon.type || 'flat',
        value: coupon.value || 0,
        maxDiscount: coupon.maxDiscount || null,
        minOrderValue: coupon.minOrderValue || 0,
        validUntil: convertTimestampToDate(coupon.validUntil).toISOString().split('T')[0],
        validFrom: convertTimestampToDate(coupon.validFrom).toISOString().split('T')[0],
        isActive: coupon.isActive ?? true,
        usageLimit: coupon.usageLimit || 0,
        applicableCategories: coupon.applicableCategories?.join(',') || '',
        applicableProducts: coupon.applicableProducts?.join(',') || ''
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        type: 'flat',
        value: 0,
        maxDiscount: null,
        minOrderValue: 0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validFrom: new Date().toISOString().split('T')[0],
        isActive: true,
        usageLimit: 0,
        applicableCategories: '',
        applicableProducts: ''
      });
    }
  }, [coupon, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description,
        type: formData.type as 'flat' | 'percentage',
        value: formData.value,
        maxDiscount: formData.maxDiscount,
        minOrderValue: formData.minOrderValue,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        isActive: formData.isActive,
        usageLimit: formData.usageLimit,
        applicableCategories: formData.applicableCategories.split(',').filter(Boolean),
        applicableProducts: formData.applicableProducts.split(',').filter(Boolean)
      };

      let result;
      if (coupon) {
        result = await updateCouponAction(coupon.couponId, data);
      } else {
        result = await createCouponAction(data);
      }

      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
          <DialogDescription>
            {coupon ? 'Update coupon details' : 'Add a new discount coupon'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="SUMMER20"
              required
              disabled={!!coupon}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summer Sale"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Get 20% off on your summer purchases"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Discount Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'flat' | 'percentage' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Discount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="20"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {formData.type === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Max Discount (Optional)</Label>
              <Input
                id="maxDiscount"
                type="number"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="100"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Maximum discount amount for percentage coupons
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="minOrderValue">Minimum Order Value</Label>
            <Input
              id="minOrderValue"
              type="number"
              value={formData.minOrderValue}
              onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: parseFloat(e.target.value) || 0 }))}
              placeholder="500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From *</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until *</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit (0 = unlimited)</Label>
            <Input
              id="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
              placeholder="100"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicableCategories">Applicable Categories (comma separated)</Label>
            <Input
              id="applicableCategories"
              value={formData.applicableCategories}
              onChange={(e) => setFormData(prev => ({ ...prev, applicableCategories: e.target.value }))}
              placeholder="electronics,books"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicableProducts">Applicable Products (comma separated)</Label>
            <Input
              id="applicableProducts"
              value={formData.applicableProducts}
              onChange={(e) => setFormData(prev => ({ ...prev, applicableProducts: e.target.value }))}
              placeholder="product1,product2"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CouponActions({ coupon, onEdit, onDelete, onToggleStatus }: { 
  coupon: Coupon; 
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
  onToggleStatus: (couponId: string, isActive: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(coupon)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(coupon.couponId, !coupon.isActive)}>
          <Power className="h-4 w-4 mr-2" />
          {coupon.isActive ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => {
            if (confirm('Are you sure you want to delete this coupon?')) {
              onDelete(coupon.couponId);
            }
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    flatDiscount: 0,
    percentageDiscount: 0,
    totalDiscountValue: 0,
    highValueCoupons: 0,
    avgMinOrder: 0
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const result = await getCouponsAction();
      setCoupons(result || []);
      setStats(getCouponStats(result || []));
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = () => {
    setEditingCoupon(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleDelete = async (couponId: string) => {
    try {
      const result = await deleteCouponAction(couponId);
      if (result.success) {
        toast.success(result.message);
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (couponId: string, isActive: boolean) => {
    try {
      const result = await toggleCouponStatusAction(couponId, isActive);
      if (result.success) {
        toast.success(result.message);
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coupon.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎫 Coupon Management</h1>
            <p className="text-muted-foreground">Create and manage discount coupons</p>
          </div>
          <Button disabled>+ Create Coupon</Button>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="font-semibold mb-2">Loading Coupons...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎫 Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={handleCreate}>+ Create Coupon</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <span className="text-2xl">🎫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All created coupons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently valid coupons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flat Discounts</CardTitle>
            <span className="text-2xl">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.flatDiscount}</div>
            <p className="text-xs text-muted-foreground">Fixed amount discounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Value</CardTitle>
            <span className="text-2xl">💎</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.highValueCoupons}</div>
            <p className="text-xs text-muted-foreground">Valuable discounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Search Coupons</CardTitle>
          <CardDescription>Find coupons by code, title, or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Active Coupons</CardTitle>
          <CardDescription>Manage your discount coupons</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCoupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Coupon</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Details</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Expires</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.couponId} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium font-mono">{coupon.code}</div>
                        <div className="text-sm text-muted-foreground">{coupon.title}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">
                            {coupon.type === 'percentage' 
                              ? `${coupon.value}% ${coupon.maxDiscount ? `(Max ₹${coupon.maxDiscount})` : ''}`
                              : `₹${coupon.value}`}
                          </div>
                          <div className="text-muted-foreground">
                            Min order: ₹{coupon.minOrderValue}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusBadgeVariant(
                          coupon.isActive && convertTimestampToDate(coupon.validUntil) > new Date() 
                            ? 'active' 
                            : 'expired'
                        )}>
                          {coupon.isActive && convertTimestampToDate(coupon.validUntil) > new Date() 
                            ? 'Active' 
                            : 'Expired'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className={
                            convertTimestampToDate(coupon.validUntil) <= new Date() ? 'text-red-600 font-medium' :
                            isExpiringSoon(convertTimestampToDate(coupon.validUntil)) ? 'text-orange-600 font-medium' :
                            'text-muted-foreground'
                          }>
                            {convertTimestampToDate(coupon.validUntil).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {convertTimestampToDate(coupon.validUntil) <= new Date() ? 'Expired' :
                             isExpiringSoon(convertTimestampToDate(coupon.validUntil)) ? 'Expiring Soon' :
                             'Valid'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <CouponActions 
                          coupon={coupon} 
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="font-semibold mb-2">No Coupons Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No coupons match your search criteria' : 'Create your first discount coupon to start offering deals'}
              </p>
              <Button onClick={handleCreate}>
                + Create First Coupon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring Soon Alert */}
      {filteredCoupons.filter(c => isExpiringSoon(convertTimestampToDate(c.validUntil))).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">⚠️ Coupons Expiring Soon</CardTitle>
            <CardDescription className="text-orange-600">
              These coupons will expire within 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCoupons
                .filter(c => isExpiringSoon(convertTimestampToDate(c.validUntil)))
                .map((coupon) => (
                  <div key={coupon.couponId} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {coupon.code}
                      </Badge>
                      <span className="text-sm">
                        {coupon.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-orange-600 font-medium">
                        Expires {convertTimestampToDate(coupon.validUntil).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        Extend
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupon Performance */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Coupon Analytics</CardTitle>
          <CardDescription>Key metrics and performance insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Active Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ₹{stats.avgMinOrder.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Min Order</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.highValueCoupons}
              </div>
              <div className="text-sm text-muted-foreground">High Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.total > 0 ? ((stats.percentageDiscount / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Percentage Based</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CouponForm 
        coupon={editingCoupon}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchCoupons}
      />
    </div>
  );
}