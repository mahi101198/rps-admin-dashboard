'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/auth';
import {
  HomeSection,
  HomeSectionItem,
  HomeSectionWithItems,
  CreateSectionInput,
  AddSectionItemInput,
  HOME_SECTIONS_COLLECTION,
  generateSectionId,
  calculateDiscountPercent,
  validateSectionInput,
  validateSectionItemInput,
  isSectionActive,
} from '@/lib/types/home-section-types';

// ============================================
// TYPES
// ============================================

interface ActionResult {
  success: boolean;
  message: string;
  sectionId?: string;
  errors?: string[];
}

interface BulkResult {
  success: boolean;
  message: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  results: Array<{ id: string; success: boolean; message: string }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Firestore timestamp to Unix timestamp (number)
 */
function convertFirestoreTimestamp(timestamp: any): number {
  if (timestamp && typeof timestamp === 'object') {
    // Check if it's a Firestore Timestamp object
    if (typeof timestamp.toDate === 'function') {
      return Math.floor(timestamp.toDate().getTime() / 1000);
    }
    // Check if it has _seconds property
    if (typeof timestamp._seconds === 'number') {
      return timestamp._seconds;
    }
    // If it's already a number (Unix timestamp)
    if (typeof timestamp === 'number') {
      return timestamp;
    }
  }
  // If it's already a number, return as-is
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  // Default to current time if invalid
  return Math.floor(Date.now() / 1000);
}

function toFirestoreSection(section: HomeSection): Record<string, any> {
  return {
    section_id: section.section_id,
    title: section.title,
    subtitle: section.subtitle || null,
    type: section.type,
    rank: section.rank,
    icon_url: section.icon_url || null,
    background_color: section.background_color || null,
    status: section.status,
    start_time: section.start_time || null,
    end_time: section.end_time || null,
    max_items: section.max_items || null,
    show_view_all: section.show_view_all ?? true,
    view_all_link: section.view_all_link || null,
    created_at: section.created_at,
    updated_at: section.updated_at,
  };
}

function fromFirestoreSection(data: any): HomeSection {
  return {
    section_id: data.section_id || '',
    title: data.title || '',
    subtitle: data.subtitle || undefined,
    type: data.type || 'custom',
    rank: data.rank ?? 0,
    icon_url: data.icon_url || undefined,
    background_color: data.background_color || undefined,
    status: data.status || 'inactive',
    start_time: data.start_time ? convertFirestoreTimestamp(data.start_time) : undefined,
    end_time: data.end_time ? convertFirestoreTimestamp(data.end_time) : undefined,
    max_items: data.max_items || undefined,
    show_view_all: data.show_view_all ?? true,
    view_all_link: data.view_all_link || undefined,
    created_at: data.created_at ? convertFirestoreTimestamp(data.created_at) : Math.floor(Date.now() / 1000),
    updated_at: data.updated_at ? convertFirestoreTimestamp(data.updated_at) : Math.floor(Date.now() / 1000),
  };
}

function toFirestoreSectionItem(item: HomeSectionItem): Record<string, any> {
  return {
    sku_id: item.sku_id,
    product_id: item.product_id,
    rank: item.rank,
    name: item.name,
    image_url: item.image_url,
    mrp: item.mrp,
    price: item.price,
    discount_percent: item.discount_percent,
    category_id: item.category_id,
    subcategory_id: item.subcategory_id,
    currency_code: item.currency_code || 'INR',
    price_override: item.price_override ?? null,
    discount_label: item.discount_label || null,
    badge_text: item.badge_text || null,
    badge_color: item.badge_color || null,
    added_at: item.added_at,
    updated_at: item.updated_at,
    is_active: item.is_active ?? true,
  };
}

function fromFirestoreSectionItem(data: any): HomeSectionItem {
  return {
    sku_id: data.sku_id || '',
    product_id: data.product_id || '',
    rank: data.rank ?? 0,
    name: data.name || '',
    image_url: data.image_url || '',
    mrp: data.mrp ?? 0,
    price: data.price ?? 0,
    discount_percent: data.discount_percent ?? 0,
    category_id: data.category_id || '',
    subcategory_id: data.subcategory_id || '',
    currency_code: data.currency_code || 'INR',
    price_override: data.price_override || undefined,
    discount_label: data.discount_label || undefined,
    badge_text: data.badge_text || undefined,
    badge_color: data.badge_color || undefined,
    added_at: data.added_at ? convertFirestoreTimestamp(data.added_at) : Math.floor(Date.now() / 1000),
    updated_at: data.updated_at ? convertFirestoreTimestamp(data.updated_at) : Math.floor(Date.now() / 1000),
    is_active: data.is_active ?? true,
  };
}

// ============================================
// SECTION CRUD OPERATIONS
// ============================================

/**
 * Create a new home section
 */
export const createHomeSectionAction = withAuth(async (
  _user,
  input: CreateSectionInput
): Promise<ActionResult> => {
  try {
    // Validate input
    const errors = validateSectionInput(input);
    if (errors.length > 0) {
      return { success: false, message: 'Validation failed', errors };
    }

    const db = getFirestore();
    const now = Math.floor(Date.now() / 1000);
    const sectionId = generateSectionId(input.title);

    // Check if section already exists
    const existingDoc = await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).get();
    if (existingDoc.exists) {
      return { success: false, message: `Section "${input.title}" already exists` };
    }

    const section: HomeSection = {
      section_id: sectionId,
      title: input.title,
      subtitle: input.subtitle,
      type: input.type,
      rank: input.rank,
      icon_url: input.icon_url,
      background_color: input.background_color,
      status: input.status || 'active',
      start_time: input.start_time,
      end_time: input.end_time,
      max_items: input.max_items,
      show_view_all: input.show_view_all ?? true,
      view_all_link: input.view_all_link,
      created_at: now,
      updated_at: now,
    };

    await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).set(toFirestoreSection(section));

    revalidatePath('/home-sections');
    return { success: true, message: 'Section created successfully', sectionId };
  } catch (error) {
    console.error('Error creating home section:', error);
    return {
      success: false,
      message: `Failed to create section: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Get all home sections (metadata only)
 */
export async function getAllHomeSectionsAction(): Promise<HomeSection[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(HOME_SECTIONS_COLLECTION)
      .orderBy('rank', 'asc')
      .get();

    return snapshot.docs.map(doc => fromFirestoreSection(doc.data()));
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return [];
  }
}

/**
 * Get active home sections (for frontend)
 */
export async function getActiveHomeSectionsAction(): Promise<HomeSection[]> {
  try {
    const sections = await getAllHomeSectionsAction();
    return sections.filter(isSectionActive);
  } catch (error) {
    console.error('Error fetching active home sections:', error);
    return [];
  }
}

/**
 * Get a single section by ID
 */
export async function getHomeSectionAction(sectionId: string): Promise<HomeSection | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).get();

    if (!doc.exists) {
      return null;
    }

    return fromFirestoreSection(doc.data());
  } catch (error) {
    console.error('Error fetching home section:', error);
    return null;
  }
}

/**
 * Update a home section
 */
export const updateHomeSectionAction = withAuth(async (
  _user,
  sectionId: string,
  updates: Partial<CreateSectionInput>
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    const existingDoc = await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).get();
    if (!existingDoc.exists) {
      return { success: false, message: 'Section not found' };
    }

    const updateData: any = {
      ...updates,
      updated_at: Math.floor(Date.now() / 1000),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).update(updateData);

    revalidatePath('/home-sections');
    return { success: true, message: 'Section updated successfully', sectionId };
  } catch (error) {
    console.error('Error updating home section:', error);
    return {
      success: false,
      message: `Failed to update section: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Delete a home section and all its items
 */
export const deleteHomeSectionAction = withAuth(async (
  _user,
  sectionId: string
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    // Delete all items in the section first
    const itemsSnapshot = await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .get();

    const batch = db.batch();
    itemsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the section document
    batch.delete(db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId));

    await batch.commit();

    revalidatePath('/home-sections');
    return { success: true, message: 'Section deleted successfully', sectionId };
  } catch (error) {
    console.error('Error deleting home section:', error);
    return {
      success: false,
      message: `Failed to delete section: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

// ============================================
// SECTION ITEM OPERATIONS
// ============================================

/**
 * Add an item (product) to a section
 */
export const addItemToSectionAction = withAuth(async (
  _user,
  sectionId: string,
  input: AddSectionItemInput
): Promise<ActionResult> => {
  try {
    console.log('addItemToSectionAction called with:', { sectionId, input });
    
    // Validate input
    const errors = validateSectionItemInput(input);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return { success: false, message: 'Validation failed', errors };
    }

    const db = getFirestore();
    const now = Math.floor(Date.now() / 1000);

    // Check if section exists
    const sectionDoc = await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).get();
    if (!sectionDoc.exists) {
      console.error('Section not found:', sectionId);
      return { success: false, message: 'Section not found' };
    }

    console.log('Section found:', sectionDoc.data());

    // Check if item already exists in section
    const existingItem = await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .doc(input.sku_id)
      .get();

    if (existingItem.exists) {
      console.warn('Item already exists:', input.sku_id);
      return { success: false, message: 'Item already exists in this section' };
    }

    const item: HomeSectionItem = {
      sku_id: input.sku_id,
      product_id: input.product_id,
      rank: input.rank,
      name: input.name,
      image_url: input.image_url,
      mrp: input.mrp,
      price: input.price,
      discount_percent: input.discount_percent || calculateDiscountPercent(input.mrp, input.price),
      category_id: input.category_id,
      subcategory_id: input.subcategory_id,
      currency_code: (input.currency_code as 'INR' | 'USD' | 'EUR') || 'INR',
      price_override: input.price_override,
      discount_label: input.discount_label,
      badge_text: input.badge_text,
      badge_color: input.badge_color,
      added_at: now,
      updated_at: now,
      is_active: true,
    };

    console.log('Saving item to section:', item);

    await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .doc(input.sku_id)
      .set(toFirestoreSectionItem(item));

    console.log('Item saved successfully');

    revalidatePath('/home-sections');
    return { success: true, message: 'Item added to section successfully' };
  } catch (error) {
    console.error('Error adding item to section:', error);
    return {
      success: false,
      message: `Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Get all items in a section
 */
export async function getSectionItemsAction(sectionId: string): Promise<HomeSectionItem[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .orderBy('rank', 'asc')
      .get();

    return snapshot.docs.map(doc => fromFirestoreSectionItem(doc.data()));
  } catch (error) {
    console.error('Error fetching section items:', error);
    return [];
  }
}

/**
 * Get section with items
 */
export async function getSectionWithItemsAction(sectionId: string): Promise<HomeSectionWithItems | null> {
  try {
    const section = await getHomeSectionAction(sectionId);
    if (!section) {
      return null;
    }

    const items = await getSectionItemsAction(sectionId);

    return {
      ...section,
      items,
    };
  } catch (error) {
    console.error('Error fetching section with items:', error);
    return null;
  }
}

/**
 * Get all sections with their items (for frontend)
 */
export async function getAllSectionsWithItemsAction(): Promise<HomeSectionWithItems[]> {
  try {
    const sections = await getActiveHomeSectionsAction();
    
    const sectionsWithItems = await Promise.all(
      sections.map(async section => {
        const items = await getSectionItemsAction(section.section_id);
        const activeItems = items.filter(item => item.is_active);
        const limitedItems = section.max_items 
          ? activeItems.slice(0, section.max_items) 
          : activeItems;
        
        return {
          ...section,
          items: limitedItems,
        };
      })
    );

    return sectionsWithItems;
  } catch (error) {
    console.error('Error fetching all sections with items:', error);
    return [];
  }
}

/**
 * Update a section item
 */
export const updateSectionItemAction = withAuth(async (
  _user,
  sectionId: string,
  skuId: string,
  updates: Partial<AddSectionItemInput>
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    const itemRef = db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .doc(skuId);

    const existingDoc = await itemRef.get();
    if (!existingDoc.exists) {
      return { success: false, message: 'Item not found in section' };
    }

    const updateData: any = {
      ...updates,
      updated_at: Math.floor(Date.now() / 1000),
    };

    // Recalculate discount if prices changed
    if (updates.mrp !== undefined || updates.price !== undefined) {
      const existingData = existingDoc.data();
      const mrp = updates.mrp ?? existingData?.mrp ?? 0;
      const price = updates.price ?? existingData?.price ?? 0;
      updateData.discount_percent = calculateDiscountPercent(mrp, price);
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await itemRef.update(updateData);

    revalidatePath('/home-sections');
    return { success: true, message: 'Item updated successfully' };
  } catch (error) {
    console.error('Error updating section item:', error);
    return {
      success: false,
      message: `Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Remove an item from a section
 */
export const removeItemFromSectionAction = withAuth(async (
  _user,
  sectionId: string,
  skuId: string
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .doc(skuId)
      .delete();

    revalidatePath('/home-sections');
    return { success: true, message: 'Item removed from section successfully' };
  } catch (error) {
    console.error('Error removing item from section:', error);
    return {
      success: false,
      message: `Failed to remove item: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Update item rank in section
 */
export const updateItemRankAction = withAuth(async (
  _user,
  sectionId: string,
  skuId: string,
  newRank: number
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .doc(skuId)
      .update({
        rank: newRank,
        updated_at: Math.floor(Date.now() / 1000),
      });

    revalidatePath('/home-sections');
    return { success: true, message: 'Item rank updated successfully' };
  } catch (error) {
    console.error('Error updating item rank:', error);
    return {
      success: false,
      message: `Failed to update rank: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Add multiple items to a section from product_details
 */
export const bulkAddItemsToSectionAction = withAuth(async (
  _user,
  sectionId: string,
  productIds: string[],
  options?: {
    priceOverride?: number;
    discountLabel?: string;
    badgeText?: string;
  }
): Promise<BulkResult> => {
  const results: Array<{ id: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    const db = getFirestore();

    // Check if section exists
    const sectionDoc = await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).get();
    if (!sectionDoc.exists) {
      return {
        success: false,
        message: 'Section not found',
        totalProcessed: productIds.length,
        successCount: 0,
        failedCount: productIds.length,
        results: productIds.map(id => ({ id, success: false, message: 'Section not found' })),
      };
    }

    // Get existing item count for ranking
    const existingItems = await db.collection(HOME_SECTIONS_COLLECTION)
      .doc(sectionId)
      .collection('items')
      .get();
    let nextRank = existingItems.size + 1;

    const now = Math.floor(Date.now() / 1000);
    const batch = db.batch();

    for (const productId of productIds) {
      try {
        // Fetch product details
        const productDoc = await db.collection('product_details').doc(productId).get();
        
        if (!productDoc.exists) {
          results.push({ id: productId, success: false, message: 'Product not found' });
          failedCount++;
          continue;
        }

        const productData = productDoc.data();
        if (!productData) {
          results.push({ id: productId, success: false, message: 'Product data empty' });
          failedCount++;
          continue;
        }

        // Get first SKU for pricing
        const skus = productData.product_skus || [];
        if (skus.length === 0) {
          results.push({ id: productId, success: false, message: 'No SKUs found' });
          failedCount++;
          continue;
        }

        const firstSku = skus[0];
        const skuId = firstSku.sku_id || `${productId}-default`;

        // Check if already in section
        const existingItem = await db.collection(HOME_SECTIONS_COLLECTION)
          .doc(sectionId)
          .collection('items')
          .doc(skuId)
          .get();

        if (existingItem.exists) {
          results.push({ id: productId, success: false, message: 'Already in section' });
          failedCount++;
          continue;
        }

        const item: HomeSectionItem = {
          sku_id: skuId,
          product_id: productId,
          rank: nextRank++,
          name: productData.title || '',
          image_url: productData.media?.main_image?.url || '',
          mrp: firstSku.mrp || 0,
          price: firstSku.price || 0,
          discount_percent: calculateDiscountPercent(firstSku.mrp || 0, firstSku.price || 0),
          category_id: productData.category || '',
          subcategory_id: productData.sub_category || '',
          currency_code: 'INR',
          price_override: options?.priceOverride,
          discount_label: options?.discountLabel,
          badge_text: options?.badgeText,
          added_at: now,
          updated_at: now,
          is_active: true,
        };

        const itemRef = db.collection(HOME_SECTIONS_COLLECTION)
          .doc(sectionId)
          .collection('items')
          .doc(skuId);

        batch.set(itemRef, toFirestoreSectionItem(item));
        results.push({ id: productId, success: true, message: 'Added' });
        successCount++;
      } catch (err) {
        results.push({ 
          id: productId, 
          success: false, 
          message: err instanceof Error ? err.message : 'Unknown error' 
        });
        failedCount++;
      }
    }

    if (successCount > 0) {
      await batch.commit();
    }

    revalidatePath('/home-sections');
    return {
      success: true,
      message: `Added ${successCount} items to section`,
      totalProcessed: productIds.length,
      successCount,
      failedCount,
      results,
    };
  } catch (error) {
    console.error('Error in bulk add:', error);
    return {
      success: false,
      message: `Bulk add failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      totalProcessed: productIds.length,
      successCount: 0,
      failedCount: productIds.length,
      results: productIds.map(id => ({ id, success: false, message: 'Batch failed' })),
    };
  }
});

/**
 * Create default sections with sample products
 */
export const createDefaultSectionsWithProductsAction = withAuth(async (_user): Promise<BulkResult> => {
  const results: Array<{ id: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    const db = getFirestore();
    const now = Math.floor(Date.now() / 1000);

    // Define default sections
    const defaultSections: CreateSectionInput[] = [
      { title: 'Popular Items', type: 'popular', rank: 1, show_view_all: true, max_items: 10 },
      { title: 'Flash Sale', type: 'flash_sale', rank: 2, show_view_all: true, max_items: 8 },
      { title: 'Best in Stationery', type: 'category_spotlight', rank: 3, show_view_all: true, max_items: 8 },
      { title: 'New Arrivals', type: 'new_arrivals', rank: 4, show_view_all: true, max_items: 10 },
      { title: 'Only for You', type: 'recommended', rank: 5, show_view_all: false, max_items: 6 },
    ];

    // Create sections
    for (const sectionInput of defaultSections) {
      const sectionId = generateSectionId(sectionInput.title);
      
      const existingDoc = await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).get();
      if (existingDoc.exists) {
        results.push({ id: sectionId, success: false, message: 'Already exists' });
        failedCount++;
        continue;
      }

      const section: HomeSection = {
        section_id: sectionId,
        title: sectionInput.title,
        type: sectionInput.type,
        rank: sectionInput.rank,
        status: 'active',
        show_view_all: sectionInput.show_view_all,
        max_items: sectionInput.max_items,
        created_at: now,
        updated_at: now,
      };

      await db.collection(HOME_SECTIONS_COLLECTION).doc(sectionId).set(toFirestoreSection(section));
      results.push({ id: sectionId, success: true, message: 'Created' });
      successCount++;
    }

    // Get all products from product_details
    const productsSnapshot = await db.collection('product_details').get();
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));

    if (products.length > 0) {
      // Add products to Popular Items section
      const popularSectionId = generateSectionId('Popular Items');
      let rank = 1;

      for (const product of products.slice(0, 10)) {
        const productData = product.data;
        const skus = productData.product_skus || [];
        if (skus.length === 0) continue;

        const firstSku = skus[0];
        const skuId = firstSku.sku_id || `${product.id}-default`;

        const item: HomeSectionItem = {
          sku_id: skuId,
          product_id: product.id,
          rank: rank++,
          name: productData.title || '',
          image_url: productData.media?.main_image?.url || '',
          mrp: firstSku.mrp || 0,
          price: firstSku.price || 0,
          discount_percent: calculateDiscountPercent(firstSku.mrp || 0, firstSku.price || 0),
          category_id: productData.category || '',
          subcategory_id: productData.sub_category || '',
          currency_code: 'INR',
          added_at: now,
          updated_at: now,
          is_active: true,
        };

        await db.collection(HOME_SECTIONS_COLLECTION)
          .doc(popularSectionId)
          .collection('items')
          .doc(skuId)
          .set(toFirestoreSectionItem(item));
      }

      // Add some products to Flash Sale with price override
      const flashSectionId = generateSectionId('Flash Sale');
      rank = 1;

      for (const product of products.slice(0, 6)) {
        const productData = product.data;
        const skus = productData.product_skus || [];
        if (skus.length === 0) continue;

        const firstSku = skus[0];
        const skuId = firstSku.sku_id || `${product.id}-default`;
        const flashPrice = Math.round((firstSku.price || 0) * 0.8); // 20% off for flash sale

        const item: HomeSectionItem = {
          sku_id: skuId,
          product_id: product.id,
          rank: rank++,
          name: productData.title || '',
          image_url: productData.media?.main_image?.url || '',
          mrp: firstSku.mrp || 0,
          price: firstSku.price || 0,
          discount_percent: calculateDiscountPercent(firstSku.mrp || 0, flashPrice),
          category_id: productData.category || '',
          subcategory_id: productData.sub_category || '',
          currency_code: 'INR',
          price_override: flashPrice,
          discount_label: 'FLASH DEAL',
          badge_text: 'Limited Time',
          badge_color: '#FF5722',
          added_at: now,
          updated_at: now,
          is_active: true,
        };

        await db.collection(HOME_SECTIONS_COLLECTION)
          .doc(flashSectionId)
          .collection('items')
          .doc(skuId)
          .set(toFirestoreSectionItem(item));
      }

      // Add stationery products to "Best in Stationery"
      const stationerySectionId = generateSectionId('Best in Stationery');
      rank = 1;

      const stationeryProducts = products.filter(p => p.data.category === 'stationery');
      for (const product of stationeryProducts) {
        const productData = product.data;
        const skus = productData.product_skus || [];
        if (skus.length === 0) continue;

        const firstSku = skus[0];
        const skuId = firstSku.sku_id || `${product.id}-default`;

        const item: HomeSectionItem = {
          sku_id: skuId,
          product_id: product.id,
          rank: rank++,
          name: productData.title || '',
          image_url: productData.media?.main_image?.url || '',
          mrp: firstSku.mrp || 0,
          price: firstSku.price || 0,
          discount_percent: calculateDiscountPercent(firstSku.mrp || 0, firstSku.price || 0),
          category_id: productData.category || '',
          subcategory_id: productData.sub_category || '',
          currency_code: 'INR',
          added_at: now,
          updated_at: now,
          is_active: true,
        };

        await db.collection(HOME_SECTIONS_COLLECTION)
          .doc(stationerySectionId)
          .collection('items')
          .doc(skuId)
          .set(toFirestoreSectionItem(item));
      }
    }

    revalidatePath('/home-sections');
    return {
      success: true,
      message: `Created ${successCount} sections with products`,
      totalProcessed: defaultSections.length,
      successCount,
      failedCount,
      results,
    };
  } catch (error) {
    console.error('Error creating default sections:', error);
    return {
      success: false,
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      results,
    };
  }
});

/**
 * Delete all home sections
 */
export const deleteAllHomeSectionsAction = withAuth(async (_user): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    const sectionsSnapshot = await db.collection(HOME_SECTIONS_COLLECTION).get();

    if (sectionsSnapshot.empty) {
      return { success: true, message: 'No sections to delete' };
    }

    for (const sectionDoc of sectionsSnapshot.docs) {
      // Delete items subcollection
      const itemsSnapshot = await sectionDoc.ref.collection('items').get();
      const batch = db.batch();
      itemsSnapshot.docs.forEach(itemDoc => {
        batch.delete(itemDoc.ref);
      });
      batch.delete(sectionDoc.ref);
      await batch.commit();
    }

    revalidatePath('/home-sections');
    return { success: true, message: `Deleted ${sectionsSnapshot.size} sections` };
  } catch (error) {
    console.error('Error deleting all sections:', error);
    return {
      success: false,
      message: `Failed to delete sections: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});
