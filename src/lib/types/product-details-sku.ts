/**
 * SKU-Based Product Schema (Updated)
 * 
 * Core Principles:
 * - SKU is the single source of truth for price, mrp, inventory, availability
 * - Each sellable variant = one SKU
 * - UI must remain universal and category-agnostic
 * - Pricing is explicit and flat (not nested)
 * - Inventory tracked per SKU with flat availability field
 * - Product details UI driven by content cards
 */

// ============================================
// AVAILABILITY TYPES
// ============================================

export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'limited';

// ============================================
// CONTENT CARD TYPES
// ============================================

export type ContentCardType = 'text' | 'list' | 'steps' | 'key_value' | 'warning' | 'info';

export interface ContentCard {
  card_id: string;
  title: string;
  type: ContentCardType;
  order: number;
  /** 
   * Data can be:
   * - string for 'text' type
   * - string[] for 'list' and 'steps' types
   * - Record<string, string> for 'key_value' type
   */
  data: string | string[] | Record<string, string>;
}

// ============================================
// MEDIA TYPES
// ============================================

export interface MediaImage {
  url: string;
  alt_text: string;
}

export interface ProductMedia {
  main_image: MediaImage;
  gallery: MediaImage[];
}

// ============================================
// DELIVERY INFO TYPES
// ============================================

export interface DeliveryInfo {
  estimated_delivery: string;
  return_policy: string;
  cod_available: boolean;
  free_delivery_threshold?: number;
}

// ============================================
// SKU TYPES
// ============================================

export interface ProductAttributes {
  size?: string;
  color?: string;
  pack?: string;
  gsm?: string;
  [key: string]: string | undefined;
}

export interface ProductSKU {
  sku_id: string;
  /** Variant attributes with standardized keys */
  attributes: ProductAttributes;
  /** Selling price */
  price: number;
  /** Maximum retail price */
  mrp: number;
  /** Currency code (INR) */
  currency: string;
  /** Stock availability status */
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  /** Available quantity in stock */
  available_quantity: number;
}

// ============================================
// MAIN PRODUCT DETAILS DOCUMENT
// ============================================

/**
 * ProductDetailsDocument - The complete product document for `product_details` collection
 * 
 * Each product = one document in `product_details` collection
 * Follows the admin panel schema for Firestore upload
 */
export interface ProductDetailsDocument {
  /** Unique product identifier */
  product_id: string;
  /** Product title/name */
  title: string;
  /** Product subtitle/tagline */
  subtitle: string;
  /** Brand name */
  brand: string;
  /** Main category */
  category: string;
  /** Sub-category */
  sub_category: string;
  
  /** Product media (images) */
  media: ProductMedia;
  
  /** Variant attributes available for this product */
  variant_attributes: Record<string, string[]>;
  
  /** Array of all purchasable SKUs */
  product_skus: ProductSKU[];
  
  /** Overall availability calculated from SKUs */
  overall_availability: 'in_stock' | 'limited' | 'out_of_stock';
  
  /** Content cards for UI display */
  content_cards: ContentCard[];
  
  /** Delivery information */
  delivery_info: DeliveryInfo;
  
  /** Rating information */
  rating: {
    average: number;
    count: number;
  };
  
  /** Purchase limits */
  purchase_limits: {
    max_per_order: number;
    max_per_user_per_day?: number;
  };
  
  /** Whether product is active/visible */
  is_active: boolean;
  
  /** Firestore server timestamp string */
  created_at: "__SERVER_TIMESTAMP__";
  /** Firestore server timestamp string */
  updated_at: "__SERVER_TIMESTAMP__";
  /** Firestore server timestamp string */
  uploaded_at?: "__SERVER_TIMESTAMP__";
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate overall availability from SKUs
 */
export function calculateOverallAvailability(skus: ProductSKU[]): 'in_stock' | 'limited' | 'out_of_stock' {
  if (!skus || skus.length === 0) {
    return 'out_of_stock';
  }

  const inStock = skus.filter(sku => sku.availability === 'in_stock').length;
  const limited = skus.filter(sku => sku.availability === 'limited').length;

  if (inStock > 0) {
    return 'in_stock';
  } else if (limited > 0) {
    return 'limited';
  } else {
    return 'out_of_stock';
  }
}

/**
 * Get price range from SKUs
 */
export function getPriceRange(skus: ProductSKU[]): { min: number; max: number } | null {
  if (!skus || skus.length === 0) {
    return null;
  }

  const prices = skus.map(sku => sku.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Get the first SKU for a product (used for default display)
 */
export function getDefaultSku(product: ProductDetailsDocument): ProductSKU | null {
  if (!product.product_skus || product.product_skus.length === 0) {
    return null;
  }
  return product.product_skus[0];
}

/**
 * Validate product document structure against schema
 */
export function validateProductDocument(doc: Partial<ProductDetailsDocument>): string[] {
  const errors: string[] = [];

  if (!doc.product_id) errors.push('product_id is required');
  if (!doc.title) errors.push('title is required');
  if (!doc.subtitle) errors.push('subtitle is required');
  if (!doc.brand) errors.push('brand is required');
  if (!doc.category) errors.push('category is required');
  if (!doc.sub_category) errors.push('sub_category is required');
  
  if (!doc.media) errors.push('media is required');
  if (doc.media && !doc.media.main_image) errors.push('media.main_image is required');
  if (doc.media && !doc.media.main_image?.url) errors.push('media.main_image.url is required');
  
  if (!doc.product_skus || doc.product_skus.length === 0) {
    errors.push('At least one SKU is required');
  }

  // Validate SKUs
  doc.product_skus?.forEach((sku, index) => {
    if (!sku.sku_id) errors.push(`SKU ${index}: sku_id is required`);
    if (sku.price === undefined || sku.price < 0) errors.push(`SKU ${index}: price must be >= 0`);
    if (sku.mrp === undefined || sku.mrp < 0) errors.push(`SKU ${index}: mrp must be >= 0`);
    if (sku.price > sku.mrp) errors.push(`SKU ${index}: price cannot exceed mrp`);
    if (!sku.currency) errors.push(`SKU ${index}: currency is required`);
    if (!sku.availability) errors.push(`SKU ${index}: availability is required`);
    if (sku.available_quantity === undefined || sku.available_quantity < 0) {
      errors.push(`SKU ${index}: available_quantity must be >= 0`);
    }
  });
  
  if (!doc.overall_availability) errors.push('overall_availability is required');
  if (!doc.content_cards || doc.content_cards.length === 0) {
    errors.push('At least one content card is required');
  }
  
  if (!doc.delivery_info) errors.push('delivery_info is required');
  if (doc.delivery_info && !doc.delivery_info.estimated_delivery) errors.push('delivery_info.estimated_delivery is required');
  if (doc.delivery_info && !doc.delivery_info.return_policy) errors.push('delivery_info.return_policy is required');
  if (doc.delivery_info && doc.delivery_info.cod_available === undefined) errors.push('delivery_info.cod_available is required');
  
  if (!doc.rating) errors.push('rating is required');
  if (doc.rating && doc.rating.average === undefined) errors.push('rating.average is required');
  if (doc.rating && doc.rating.count === undefined) errors.push('rating.count is required');
  
  if (!doc.purchase_limits) errors.push('purchase_limits is required');
  if (doc.purchase_limits && doc.purchase_limits.max_per_order === undefined) errors.push('purchase_limits.max_per_order is required');
  
  if (doc.is_active === undefined) errors.push('is_active is required');
  if (doc.created_at === undefined) errors.push('created_at is required');
  if (doc.updated_at === undefined) errors.push('updated_at is required');

  return errors;
}
