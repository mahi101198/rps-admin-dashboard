/**
 * Universal Home Section Schema
 * 
 * Design Principles:
 * - Sections are universal (not category-based)
 * - Minimal data duplication
 * - Store only essential display data in section items
 * - Price/discount can be overridden per section for sales
 * 
 * Collection Structure:
 * - home_sections/{sectionId} - Section metadata
 * - home_sections/{sectionId}/items/{itemId} - Section items (products)
 */

// ============================================
// SECTION TYPES
// ============================================

export type SectionType = 
  | 'popular'
  | 'flash_sale'
  | 'seasonal_sale'
  | 'category_spotlight'
  | 'new_arrivals'
  | 'recommended'
  | 'deals'
  | 'custom';

export type SectionStatus = 'active' | 'inactive' | 'scheduled';

// ============================================
// HOME SECTION DOCUMENT
// ============================================

/**
 * Home Section Document
 * Stored in: home_sections/{sectionId}
 */
export interface HomeSection {
  /** Unique section identifier (document ID) */
  section_id: string;
  
  /** Display title (e.g., "Popular Items", "Flash Sale") */
  title: string;
  
  /** Optional subtitle/description */
  subtitle?: string;
  
  /** Section type for UI rendering */
  type: SectionType;
  
  /** Display rank/order on homepage (lower = higher priority) */
  rank: number;
  
  /** Section icon URL (optional) */
  icon_url?: string;
  
  /** Background color for the section (hex) */
  background_color?: string;
  
  /** Section status */
  status: SectionStatus;
  
  /** For scheduled sections - start time (Unix timestamp) */
  start_time?: number;
  
  /** For scheduled sections - end time (Unix timestamp) */
  end_time?: number;
  
  /** Maximum items to display */
  max_items?: number;
  
  /** Whether to show "View All" link */
  show_view_all?: boolean;
  
  /** Custom link for "View All" */
  view_all_link?: string;
  
  /** Creation timestamp (Unix) */
  created_at: number;
  
  /** Last update timestamp (Unix) */
  updated_at: number;
}

// ============================================
// SECTION ITEM (PRODUCT IN SECTION)
// ============================================

/**
 * Home Section Item - Minimal product data for display
 * Stored in: home_sections/{sectionId}/items/{sku_id}
 * 
 * Only stores essential display data to avoid duplication.
 * Full product details fetched from product_details when needed.
 */
export interface HomeSectionItem {
  /** SKU ID (document ID) - links to product_details */
  sku_id: string;
  
  /** Parent product ID (for reference) */
  product_id: string;
  
  /** Display rank within section (lower = higher priority) */
  rank: number;
  
  /** Product name (for display) */
  name: string;
  
  /** Thumbnail/main image URL */
  image_url: string;
  
  /** Original MRP (can be overridden for sales) */
  mrp: number;
  
  /** Selling price (can be overridden for sales) */
  price: number;
  
  /** Discount percentage (calculated or overridden) */
  discount_percent: number;
  
  /** Category ID from product */
  category_id: string;
  
  /** Sub-category ID from product */
  subcategory_id: string;
  
  /** Currency code */
  currency_code: 'INR' | 'USD' | 'EUR';
  
  // === SECTION-SPECIFIC OVERRIDES ===
  
  /** Price override for this section (e.g., flash sale price) */
  price_override?: number;
  
  /** Custom discount label (e.g., "50% OFF", "DEAL OF THE DAY") */
  discount_label?: string;
  
  /** Custom badge text (e.g., "Bestseller", "New") */
  badge_text?: string;
  
  /** Badge color (hex) */
  badge_color?: string;
  
  // === METADATA ===
  
  /** When this item was added to the section */
  added_at: number;
  
  /** Last update timestamp */
  updated_at: number;
  
  /** Whether this item is active in the section */
  is_active: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Section with items - for API responses
 */
export interface HomeSectionWithItems extends HomeSection {
  items: HomeSectionItem[];
}

/**
 * Lightweight section item for frontend display
 */
export interface DisplaySectionItem {
  sku_id: string;
  product_id: string;
  name: string;
  image_url: string;
  mrp: number;
  /** Final price (considers price_override) */
  final_price: number;
  discount_percent: number;
  discount_label?: string;
  badge_text?: string;
  badge_color?: string;
}

// ============================================
// FORM/INPUT TYPES
// ============================================

/**
 * Create section input
 */
export interface CreateSectionInput {
  title: string;
  subtitle?: string;
  type: SectionType;
  rank: number;
  icon_url?: string;
  background_color?: string;
  status?: SectionStatus;
  start_time?: number;
  end_time?: number;
  max_items?: number;
  show_view_all?: boolean;
  view_all_link?: string;
}

/**
 * Add item to section input
 */
export interface AddSectionItemInput {
  /** SKU ID from product_details */
  sku_id: string;
  /** Product ID from product_details */
  product_id: string;
  /** Rank within section */
  rank: number;
  /** Product name */
  name: string;
  /** Image URL */
  image_url: string;
  /** MRP */
  mrp: number;
  /** Selling price */
  price: number;
  /** Discount percent */
  discount_percent: number;
  /** Category ID from product */
  category_id: string;
  /** Sub-category ID from product */
  subcategory_id: string;
  /** Currency code */
  currency_code?: string;
  /** Optional price override for this section */
  price_override?: number;
  /** Optional custom discount label */
  discount_label?: string;
  /** Optional badge text */
  badge_text?: string;
  /** Optional badge color */
  badge_color?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate section ID from title
 */
export function generateSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Get final display price (considering override)
 */
export function getFinalPrice(item: HomeSectionItem): number {
  return item.price_override ?? item.price;
}

/**
 * Check if section is currently active
 */
export function isSectionActive(section: HomeSection): boolean {
  if (section.status !== 'active' && section.status !== 'scheduled') {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  
  if (section.start_time && now < section.start_time) {
    return false;
  }
  
  if (section.end_time && now > section.end_time) {
    return false;
  }
  
  return true;
}

/**
 * Convert HomeSectionItem to DisplaySectionItem
 */
export function toDisplayItem(item: HomeSectionItem): DisplaySectionItem {
  return {
    sku_id: item.sku_id,
    product_id: item.product_id,
    name: item.name,
    image_url: item.image_url,
    mrp: item.mrp,
    final_price: getFinalPrice(item),
    discount_percent: item.price_override 
      ? calculateDiscountPercent(item.mrp, item.price_override)
      : item.discount_percent,
    discount_label: item.discount_label,
    badge_text: item.badge_text,
    badge_color: item.badge_color,
  };
}

/**
 * Validate section input
 */
export function validateSectionInput(input: CreateSectionInput): string[] {
  const errors: string[] = [];
  
  if (!input.title || input.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (input.rank === undefined || input.rank < 0) {
    errors.push('Rank must be a non-negative number');
  }
  
  if (input.start_time && input.end_time && input.start_time >= input.end_time) {
    errors.push('End time must be after start time');
  }
  
  return errors;
}

/**
 * Validate section item input
 */
export function validateSectionItemInput(input: AddSectionItemInput): string[] {
  const errors: string[] = [];
  
  if (!input.sku_id) errors.push('SKU ID is required');
  if (!input.product_id) errors.push('Product ID is required');
  if (!input.name) errors.push('Name is required');
  if (!input.image_url) errors.push('Image URL is required');
  if (input.mrp === undefined || input.mrp < 0) errors.push('MRP must be non-negative');
  if (input.price === undefined || input.price < 0) errors.push('Price must be non-negative');
  if (input.price > input.mrp) errors.push('Price cannot exceed MRP');
  if (!input.category_id) errors.push('Category ID is required');
  if (!input.subcategory_id) errors.push('Sub-category ID is required');
  
  return errors;
}

// ============================================
// PREDEFINED SECTION TEMPLATES
// ============================================

export const SECTION_TEMPLATES: Record<string, Partial<CreateSectionInput>> = {
  popular: {
    title: 'Popular Items',
    type: 'popular',
    show_view_all: true,
    max_items: 10,
  },
  flash_sale: {
    title: 'Flash Sale',
    type: 'flash_sale',
    show_view_all: true,
    max_items: 8,
  },
  new_arrivals: {
    title: 'New Arrivals',
    type: 'new_arrivals',
    show_view_all: true,
    max_items: 10,
  },
  deals: {
    title: 'Best Deals',
    type: 'deals',
    show_view_all: true,
    max_items: 12,
  },
  recommended: {
    title: 'Recommended for You',
    type: 'recommended',
    show_view_all: false,
    max_items: 6,
  },
};

// ============================================
// COLLECTION NAME CONSTANT
// ============================================

/** 
 * Collection name for universal home sections 
 */
export const HOME_SECTIONS_COLLECTION = 'home_sections';
