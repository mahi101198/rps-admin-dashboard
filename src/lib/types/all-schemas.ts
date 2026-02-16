// ⭐ Product Review
export interface ProductReview {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 🏷️ Category - Updated to match the actual structure used in category-actions.ts
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rank: number;
  isActive: boolean;
  createdAt?: Date;  // Optional since it's not always in the data
  updatedAt?: Date;  // Optional since it's not always in the data
}

// 7. 🏷️ SubCategory - Updated to match the actual structure used in category-actions.ts
export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  image?: string;  // Subcategory image URL
  rank: number;
  isActive: boolean;
  createdAt?: Date;  // Optional since it's not always in the data
  updatedAt?: Date;  // Optional since it's not always in the data
}

// 8. 📢 Banner
export interface Banner {
  bannerId: string;
  title: string;
  imageUrl: string;
  linkTo: string;
  rank: number;
  isActive: boolean;
  view_change_time: number; // Time in seconds to show each banner before changing
  createdAt: Date;
  updatedAt: Date;
}

// 8.1 💳 Payment Banner - For payment selection screen
export interface PaymentBanner {
  paymentPageBannerId: string;
  title: string;
  imageUrl: string;
  linkTo: string;
  rank: number;
  isActive: boolean;
  view_change_time: number; // Time in seconds to show each banner before changing
  createdAt: Date;
  updatedAt: Date;
}

// 9. 🛒 Cart Item
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

// 10. 🛒 Cart
export interface Cart {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// 11. 🎟️ Coupon Status
export type CouponStatus = 'active' | 'expired' | 'draft';

// 12. 🎟️ Coupon
export interface Coupon {
  couponId: string;
  code: string;
  title: string;
  description: string;
  type: 'flat' | 'percentage';
  value: number;
  maxDiscount: number | null;
  minOrderValue: number;
  applicableCategories: Array<{ id: string }>;
  applicableProducts: Array<{ productId: string; skuId: string }>;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 13. 📦 Order Status
export type OrderStatus = 'placed' | 'confirmed' | 'paid' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

// 13a. 📦 Order Address
export interface OrderAddress {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  email?: string;
  landmark?: string;
  isDefault?: boolean;
}

// 13b. 📦 Delivery Info
export interface DeliveryInfo {
  address: OrderAddress;
  deliveryInstructions?: string | null;
  estimatedDelivery?: Date | null;
}

// 13c. 📦 Order Item Metadata
export interface OrderItemMetadata {
  basePriceUsed: number;
  currentPriceUsed: number;
  calculatedAt: string;
  discountPerItem: number;
  itemSubtotalAtMRP: number;
  itemSubtotalAtSellingPrice: number;
  name: string;
  productBasePrice: number;
  productCurrentPrice: number;
}

// 13d. 📦 Order Item Variants
export interface OrderItemVariants {
  sku: string;
}

// 13e. 📦 Order Item
export interface OrderItem {
  productId: string;
  skuId?: string;
  name: string;
  quantity: number;
  brand?: string;
  category?: string;
  productImage?: string;
  selectedColor?: string | null;
  itemAutoDiscount?: number;
  itemMetadata?: OrderItemMetadata;
  variants?: OrderItemVariants;
}

// 13f. 📦 Order Metadata
export interface OrderMetadataInfo {
  source: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referralCode?: string | null;
}

// 13g. 📦 Pricing Summary
export interface PricingSummary {
  orderSubtotal: number;
  productDiscount: number;
  deliveryFee: number;
  couponCode?: string | null;
  couponDiscount: number;
  totalDiscount: number;
  subtotalAfterDiscount: number;
  totalBeforePayment: number;
}

// 13h. 📦 Payment Summary
export interface PaymentSummary {
  paymentMode: string;
  totalOrderValue: number;
  walletPaidAmount: number;
  onlinePaidAmount: number;
}

// 13i. 📦 Transaction Details
export interface TransactionDetailsInfo {
  amount: number;
  currency: string;
  method: string;
  razorpayPaymentId?: string;
  capturedAt?: Date;
}

// 14. 📦 Order (Main)
export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  deliveryId?: string;
  deliveryInfo: DeliveryInfo;
  deliveryAddress?: OrderAddress; // Backward compatibility
  status: OrderStatus;
  paymentStatus: string;
  paymentId: string;
  paymentMode: string;
  razorpayOrderId?: string;
  orderMetadata?: OrderMetadataInfo;
  pricingSummary: PricingSummary;
  paymentSummary: PaymentSummary;
  transactionDetails?: TransactionDetailsInfo;
  createdAt: Date;
  updatedAt: Date;
  timestamps?: {
    placedAt: Date;
    updatedAt: Date;
  };
  // Backward compatibility - computed from pricingSummary
  pricing?: {
    deliveryFee: number;
    discount: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

// 15. 💳 Payment Status
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

// 16. 💳 Payment Mode
export type PaymentMode = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';

// 17. 💳 Payment
export interface Payment {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMode;
  transactionId: string | null;
  attemptCount: number;
  gateway: string | null;
  method: string;
  timestamps: {
    completedAt: Date | null;
    initiatedAt: Date;
  };
  updatedAt: Date;
  amountBreakdown: any | null; // Breakdown of amounts
  couponInfo: any | null; // Coupon information
  gatewayPaymentId: string | null;
  paymentDetails: any | null; // Additional payment details
  transactionDetails: any | null; // Transaction details
}

// 18. 🎯 Referral Status
export type ReferralStatus = 'pending' | 'completed' | 'expired';

// 19. 🎯 Referral - Updated to match the actual structure used in referral-actions.ts
export interface Referral {
  referralId: string;
  referrerId: string;
  referredUserId: string;  // Changed from refereeId to referredUserId
  status: string;
  rewardAmount: number;    // Changed from reward to rewardAmount
  createdAt: Date;
  completedAt: Date | null;
  updatedAt?: Date;        // Added optional updatedAt
}

// 20. 👤 User Address
export interface UserAddress {
  addressId: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 21. 👤 User with Details
export interface UserWithDetails {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses: UserAddress[];
  walletBalance?: number;  // Optional wallet balance
  referredBy?: string;     // Optional referrer ID
}

// 22. 👤 User
export interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  walletBalance?: number;  // Optional wallet balance
  referredBy?: string;     // Optional referrer ID
}

// 23. ❤️ Wishlist Item
export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

// 24. ❤️ Wishlist
export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

// 25. 🏠 Home Section Item
export interface HomeSectionItem {
  id?: string;  // Optional for cases where it might not be set
  productId: string;  // Product ID for dynamic sections
  categoryId: string;  // Category ID from categories collection
  categoryName?: string;  // Category name for easy reference
  subcategoryId: string;  // Subcategory ID from subcategories collection
  subcategoryName?: string;  // Subcategory name for easy reference
  title?: string;  // Optional title
  subtitle?: string;  // Optional subtitle
  image?: string;  // Optional image
  link?: string;  // Optional link
  rank: number;  // Display order
  isActive?: boolean;  // Optional active status
  priceOverride?: number;  // Optional price override for flash sales
  addedAt?: Date;  // When item was added
  createdAt?: Date;  // Optional creation date
  updatedAt?: Date;  // Optional update date
}

// 26. ⚙️ App Settings
export interface AppSettings {
  settingsId: string;
  key: string;
  value: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}