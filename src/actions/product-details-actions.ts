'use server';

import { getFirestore, getStorageBucket } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/auth';
import { 
  ProductDetailsDocument, 
  validateProductDocument, 
  calculateOverallAvailability,
  ProductSKU 
} from '@/lib/types/product-details-sku';

// ============================================
// TYPES
// ============================================

interface ActionResult {
  success: boolean;
  message: string;
  productId?: string;
  errors?: string[];
}

interface BulkUploadResult {
  success: boolean;
  message: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  results: Array<{
    productId: string;
    success: boolean;
    message: string;
  }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert ProductDetailsDocument to Firestore-safe format
 */
function toFirestoreDocument(product: ProductDetailsDocument): Record<string, any> {
  return {
    product_id: product.product_id,
    title: product.title,
    subtitle: product.subtitle,
    brand: product.brand,
    category: product.category,
    category_id: product.category_id,
    sub_category: product.sub_category,
    sub_category_id: product.sub_category_id,
    created_at: product.created_at,
    updated_at: product.updated_at,
    media: product.media,
    variant_attributes: product.variant_attributes,
    product_skus: product.product_skus,
    overall_availability: product.overall_availability,
    content_cards: product.content_cards,
    delivery_info: product.delivery_info,
    rating: product.rating,
    purchase_limits: product.purchase_limits,
    is_active: product.is_active !== undefined ? product.is_active : true,
  };
}

/**
 * Convert Firestore document to ProductDetailsDocument
 */
function fromFirestoreDocument(data: any): ProductDetailsDocument {
  return {
    product_id: data.product_id || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    brand: data.brand || '',
    category: data.category || '',
    category_id: data.category_id,
    sub_category: data.sub_category || '',
    sub_category_id: data.sub_category_id,
    created_at: "__SERVER_TIMESTAMP__",
    updated_at: "__SERVER_TIMESTAMP__",
    media: data.media || { main_image: { url: '', alt_text: '' } },
    variant_attributes: data.variant_attributes || {},
    product_skus: data.product_skus || [],
    overall_availability: data.overall_availability || 'out_of_stock',
    content_cards: data.content_cards || [],
    delivery_info: data.delivery_info || {
      cod_available: true,
      return_policy: '',
      estimated_delivery: '',
    },
    rating: {
      average: data.rating?.average || 0,
      count: data.rating?.count || 0,
    },
    purchase_limits: data.purchase_limits || {
      max_per_order: 1,
      max_per_user_per_day: 1,
    },
    is_active: data.is_active !== undefined ? data.is_active : true,
  };
}

/**
 * Resolve category and subcategory IDs from their names
 * If IDs are already present, return as is
 * If only names are present, fetch IDs from database
 */
async function resolveCategoryIds(
  categoryName: string,
  subCategoryName: string,
  categoryId?: string,
  subCategoryId?: string
): Promise<{ categoryId?: string; subCategoryId?: string }> {
  try {
    // If IDs are already provided, return them
    if (categoryId && subCategoryId) {
      return { categoryId, subCategoryId };
    }

    const db = getFirestore();

    // Fetch category ID by name if not provided
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && categoryName) {
      const catSnapshot = await db.collection('categories')
        .where('name', '==', categoryName)
        .limit(1)
        .get();
      if (!catSnapshot.empty) {
        resolvedCategoryId = catSnapshot.docs[0].id;
      }
    }

    // Fetch subcategory ID by name and category ID if not provided
    let resolvedSubCategoryId = subCategoryId;
    if (!resolvedSubCategoryId && subCategoryName && resolvedCategoryId) {
      const subCatSnapshot = await db.collection('subcategories')
        .where('name', '==', subCategoryName)
        .where('categoryId', '==', resolvedCategoryId)
        .limit(1)
        .get();
      if (!subCatSnapshot.empty) {
        resolvedSubCategoryId = subCatSnapshot.docs[0].id;
      }
    }

    return { categoryId: resolvedCategoryId, subCategoryId: resolvedSubCategoryId };
  } catch (error) {
    console.error('Error resolving category IDs:', error);
    return { categoryId, subCategoryId };
  }
}

// ============================================
// IMAGE UPLOAD
// ============================================

/**
 * Upload a product image to Firebase Storage and return the URL
 */
export async function uploadProductImageAction(
  file: File,
  productId: string,
  imageType: 'main' | 'gallery' | 'sku' = 'main'
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `products/${productId}/${imageType}_${Date.now()}.${fileExtension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    revalidatePath('/products');
    return { success: true, message: 'Image uploaded successfully', imageUrl };
  } catch (error) {
    console.error('Error uploading product image:', error);
    return { success: false, message: 'Failed to upload image' };
  }
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new SKU-based product document
 */
export const createSkuProductAction = withAuth(async (
  user,
  product: ProductDetailsDocument
): Promise<ActionResult> => {
  try {
    // Validate product document
    const validationErrors = validateProductDocument(product);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return {
        success: false,
        message: `Validation failed: ${validationErrors.join(', ')}`,
        errors: validationErrors,
      };
    }

    const db = getFirestore();

    // Resolve category and subcategory IDs from names
    const { categoryId, subCategoryId } = await resolveCategoryIds(
      product.category,
      product.sub_category,
      product.category_id,
      product.sub_category_id
    );

    // Prepare document with timestamps and resolved IDs
    const productToSave: ProductDetailsDocument = {
      ...product,
      category_id: categoryId,
      sub_category_id: subCategoryId,
      created_at: "__SERVER_TIMESTAMP__",
      updated_at: "__SERVER_TIMESTAMP__",
      overall_availability: calculateOverallAvailability(product.product_skus),
    };

    // Use product_id as document ID for easy lookups
    await db.collection('product_details').doc(product.product_id).set(
      toFirestoreDocument(productToSave)
    );

    revalidatePath('/products');
    return {
      success: true,
      message: 'Product created successfully',
      productId: product.product_id,
    };
  } catch (error) {
    console.error('Error creating SKU product:', error);
    return {
      success: false,
      message: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Get a single SKU-based product by ID
 */
export async function getSkuProductAction(productId: string): Promise<ProductDetailsDocument | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('product_details').doc(productId).get();

    if (!doc.exists) {
      return null;
    }

    return fromFirestoreDocument(doc.data());
  } catch (error) {
    console.error('Error fetching SKU product:', error);
    return null;
  }
}

/**
 * Get all SKU-based products
 */
export async function getAllSkuProductsAction(): Promise<ProductDetailsDocument[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('product_details')
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map(doc => fromFirestoreDocument(doc.data()));
  } catch (error) {
    console.error('Error fetching SKU products:', error);
    return [];
  }
}

/**
 * Get SKU products by category
 */
export async function getSkuProductsByCategoryAction(category: string): Promise<ProductDetailsDocument[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('product_details')
      .where('category', '==', category)
      .where('is_active', '==', true)
      .get();

    return snapshot.docs.map(doc => fromFirestoreDocument(doc.data()));
  } catch (error) {
    console.error('Error fetching SKU products by category:', error);
    return [];
  }
}

/**
 * Update a SKU-based product
 */
export const updateSkuProductAction = withAuth(async (
  user,
  productId: string,
  updates: Partial<ProductDetailsDocument>
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    // Check if product exists
    const existingDoc = await db.collection('product_details').doc(productId).get();
    if (!existingDoc.exists) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    // Resolve category and subcategory IDs from names (for backward compatibility)
    let resolvedCategory = updates.category;
    let resolvedSubCategory = updates.sub_category;
    let resolvedCategoryId = updates.category_id;
    let resolvedSubCategoryId = updates.sub_category_id;

    if (updates.category || updates.sub_category) {
      const existing = existingDoc.data() as any;
      const categoryName = updates.category || existing.category;
      const subCategoryName = updates.sub_category || existing.sub_category;
      const categoryId = updates.category_id || existing.category_id;
      const subCategoryId = updates.sub_category_id || existing.sub_category_id;

      const resolved = await resolveCategoryIds(categoryName, subCategoryName, categoryId, subCategoryId);
      resolvedCategoryId = resolved.categoryId;
      resolvedSubCategoryId = resolved.subCategoryId;
    }

    // Prepare updates
    const updateData: any = {
      ...updates,
      category_id: resolvedCategoryId,
      sub_category_id: resolvedSubCategoryId,
      updated_at: Math.floor(Date.now() / 1000),
    };

    // Recalculate overall availability if SKUs are updated
    if (updates.product_skus) {
      updateData.overall_availability = calculateOverallAvailability(updates.product_skus);
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db.collection('product_details').doc(productId).update(updateData);

    revalidatePath('/products');
    return {
      success: true,
      message: 'Product updated successfully',
      productId,
    };
  } catch (error) {
    console.error('Error updating SKU product:', error);
    return {
      success: false,
      message: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Delete a SKU-based product
 */
export const deleteSkuProductAction = withAuth(async (
  user,
  productId: string
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    // Check if product exists
    const existingDoc = await db.collection('product_details').doc(productId).get();
    if (!existingDoc.exists) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    await db.collection('product_details').doc(productId).delete();

    revalidatePath('/products');
    return {
      success: true,
      message: 'Product deleted successfully',
      productId,
    };
  } catch (error) {
    console.error('Error deleting SKU product:', error);
    return {
      success: false,
      message: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

// ============================================
// SKU-SPECIFIC OPERATIONS
// ============================================

/**
 * Update SKU inventory
 */
export const updateSkuInventoryAction = withAuth(async (
  user,
  productId: string,
  skuId: string,
  newQuantity: number
): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    
    // Get product
    const doc = await db.collection('product_details').doc(productId).get();
    if (!doc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const product = fromFirestoreDocument(doc.data());
    
    // Find and update SKU
    const skuIndex = product.product_skus.findIndex(sku => sku.sku_id === skuId);
    if (skuIndex === -1) {
      return { success: false, message: 'SKU not found' };
    }

    // Update quantity and availability
    product.product_skus[skuIndex].available_quantity = newQuantity;
    product.product_skus[skuIndex].availability = 
      newQuantity <= 0 ? 'out_of_stock' : 
      newQuantity <= 10 ? 'limited' : 'in_stock';

    // Recalculate overall availability
    const overallAvailability = calculateOverallAvailability(product.product_skus);

    await db.collection('product_details').doc(productId).update({
      product_skus: product.product_skus,
      overall_availability: overallAvailability,
      updated_at: Math.floor(Date.now() / 1000),
    });

    revalidatePath('/products');
    return {
      success: true,
      message: 'SKU inventory updated successfully',
      productId,
    };
  } catch (error) {
    console.error('Error updating SKU inventory:', error);
    return {
      success: false,
      message: `Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Update SKU pricing
 */
export const updateSkuPricingAction = withAuth(async (
  user,
  productId: string,
  skuId: string,
  mrp: number,
  price: number
): Promise<ActionResult> => {
  try {
    // Validate pricing
    if (price > mrp) {
      return { success: false, message: 'Price cannot exceed MRP' };
    }
    if (mrp < 0 || price < 0) {
      return { success: false, message: 'Prices must be non-negative' };
    }

    const db = getFirestore();
    
    // Get product
    const doc = await db.collection('product_details').doc(productId).get();
    if (!doc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const product = fromFirestoreDocument(doc.data());
    
    // Find and update SKU
    const skuIndex = product.product_skus.findIndex(sku => sku.sku_id === skuId);
    if (skuIndex === -1) {
      return { success: false, message: 'SKU not found' };
    }

    product.product_skus[skuIndex].mrp = mrp;
    product.product_skus[skuIndex].price = price;

    await db.collection('product_details').doc(productId).update({
      product_skus: product.product_skus,
      updated_at: Math.floor(Date.now() / 1000),
    });

    revalidatePath('/products');
    return {
      success: true,
      message: 'SKU pricing updated successfully',
      productId,
    };
  } catch (error) {
    console.error('Error updating SKU pricing:', error);
    return {
      success: false,
      message: `Failed to update pricing: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Add a new SKU to a product
 */
export const addSkuToProductAction = withAuth(async (
  user,
  productId: string,
  newSku: ProductSKU
): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    
    // Get product
    const doc = await db.collection('product_details').doc(productId).get();
    if (!doc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const product = fromFirestoreDocument(doc.data());
    
    // Check if SKU ID already exists
    if (product.product_skus.some(sku => sku.sku_id === newSku.sku_id)) {
      return { success: false, message: 'SKU ID already exists' };
    }

    // Add new SKU
    product.product_skus.push(newSku);

    // Recalculate overall availability
    const overallAvailability = calculateOverallAvailability(product.product_skus);

    await db.collection('product_details').doc(productId).update({
      product_skus: product.product_skus,
      overall_availability: overallAvailability,
      updated_at: Math.floor(Date.now() / 1000),
    });

    revalidatePath('/products');
    return {
      success: true,
      message: 'SKU added successfully',
      productId,
    };
  } catch (error) {
    console.error('Error adding SKU:', error);
    return {
      success: false,
      message: `Failed to add SKU: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Remove a SKU from a product
 */
export const removeSkuFromProductAction = withAuth(async (
  user,
  productId: string,
  skuId: string
): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    
    // Get product
    const doc = await db.collection('product_details').doc(productId).get();
    if (!doc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const product = fromFirestoreDocument(doc.data());
    
    // Check if SKU exists
    const skuIndex = product.product_skus.findIndex(sku => sku.sku_id === skuId);
    if (skuIndex === -1) {
      return { success: false, message: 'SKU not found' };
    }

    // Ensure at least one SKU remains
    if (product.product_skus.length <= 1) {
      return { success: false, message: 'Cannot remove last SKU. Product must have at least one SKU.' };
    }

    // Remove SKU
    product.product_skus.splice(skuIndex, 1);

    // Recalculate overall availability
    const overallAvailability = calculateOverallAvailability(product.product_skus);

    await db.collection('product_details').doc(productId).update({
      product_skus: product.product_skus,
      overall_availability: overallAvailability,
      updated_at: Math.floor(Date.now() / 1000),
    });

    revalidatePath('/products');
    return {
      success: true,
      message: 'SKU removed successfully',
      productId,
    };
  } catch (error) {
    console.error('Error removing SKU:', error);
    return {
      success: false,
      message: `Failed to remove SKU: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk upload multiple products
 */
export const bulkUploadSkuProductsAction = withAuth(async (
  user,
  products: ProductDetailsDocument[]
): Promise<BulkUploadResult> => {
  const results: Array<{ productId: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    const db = getFirestore();
    const batch = db.batch();

    for (const product of products) {
      // Validate each product
      const validationErrors = validateProductDocument(product);
      if (validationErrors.length > 0) {
        results.push({
          productId: product.product_id,
          success: false,
          message: `Validation failed: ${validationErrors.join(', ')}`,
        });
        failedCount++;
        continue;
      }

      // Prepare document
      const productToSave: ProductDetailsDocument = {
        ...product,
        created_at: "__SERVER_TIMESTAMP__",
        updated_at: "__SERVER_TIMESTAMP__",
        overall_availability: calculateOverallAvailability(product.product_skus),
      };

      const docRef = db.collection('product_details').doc(product.product_id);
      batch.set(docRef, toFirestoreDocument(productToSave));
      
      results.push({
        productId: product.product_id,
        success: true,
        message: 'Added to batch',
      });
      successCount++;
    }

    // Commit batch if there are successful products
    if (successCount > 0) {
      await batch.commit();
      
      // Update success messages
      results.forEach(r => {
        if (r.success) {
          r.message = 'Uploaded successfully';
        }
      });
    }

    revalidatePath('/products');
    return {
      success: true,
      message: `Bulk upload completed: ${successCount} succeeded, ${failedCount} failed`,
      totalProcessed: products.length,
      successCount,
      failedCount,
      results,
    };
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return {
      success: false,
      message: `Bulk upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      totalProcessed: products.length,
      successCount: 0,
      failedCount: products.length,
      results: products.map(p => ({
        productId: p.product_id,
        success: false,
        message: 'Batch commit failed',
      })),
    };
  }
});

/**
 * Internal bulk upload implementation (without auth wrapper)
 */
async function bulkUploadSkuProductsInternal(
  products: ProductDetailsDocument[]
): Promise<BulkUploadResult> {
  const results: Array<{ productId: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    const db = getFirestore();
    const batch = db.batch();

    for (const product of products) {
      // Validate each product
      const validationErrors = validateProductDocument(product);
      if (validationErrors.length > 0) {
        results.push({
          productId: product.product_id,
          success: false,
          message: `Validation failed: ${validationErrors.join(', ')}`,
        });
        failedCount++;
        continue;
      }

      // Prepare document
      const productToSave: ProductDetailsDocument = {
        ...product,
        created_at: "__SERVER_TIMESTAMP__",
        updated_at: "__SERVER_TIMESTAMP__",
        overall_availability: calculateOverallAvailability(product.product_skus),
      };

      const docRef = db.collection('product_details').doc(product.product_id);
      batch.set(docRef, toFirestoreDocument(productToSave));
      
      results.push({
        productId: product.product_id,
        success: true,
        message: 'Added to batch',
      });
      successCount++;
    }

    // Commit batch if there are successful products
    if (successCount > 0) {
      await batch.commit();
      
      // Update success messages
      results.forEach(r => {
        if (r.success) {
          r.message = 'Uploaded successfully';
        }
      });
    }

    revalidatePath('/products');
    return {
      success: true,
      message: `Bulk upload completed: ${successCount} succeeded, ${failedCount} failed`,
      totalProcessed: products.length,
      successCount,
      failedCount,
      results,
    };
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return {
      success: false,
      message: `Bulk upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      totalProcessed: products.length,
      successCount: 0,
      failedCount: products.length,
      results: products.map(p => ({
        productId: p.product_id,
        success: false,
        message: 'Batch commit failed',
      })),
    };
  }
}

/**
 * Delete all SKU-based products (use with caution!)
 */
export const deleteAllSkuProductsAction = withAuth(async (user): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('product_details').get();

    if (snapshot.empty) {
      return {
        success: true,
        message: 'No products to delete',
      };
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    revalidatePath('/products');
    return {
      success: true,
      message: `Successfully deleted ${snapshot.size} products`,
    };
  } catch (error) {
    console.error('Error deleting all products:', error);
    return {
      success: false,
      message: `Failed to delete products: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

// ============================================
// CONTENT CARD OPERATIONS
// ============================================

/**
 * Add a content card to a product
 */
export const addContentCardAction = withAuth(async (
  user,
  productId: string,
  card: { card_id: string; title: string; type: string; data: any }
): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    
    const doc = await db.collection('product_details').doc(productId).get();
    if (!doc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const product = fromFirestoreDocument(doc.data());
    
    // Check if card_id already exists
    if (product.content_cards.some(c => c.card_id === card.card_id)) {
      return { success: false, message: 'Card ID already exists' };
    }

    product.content_cards.push(card as any);

    await db.collection('product_details').doc(productId).update({
      content_cards: product.content_cards,
      updated_at: Math.floor(Date.now() / 1000),
    });

    revalidatePath('/products');
    return {
      success: true,
      message: 'Content card added successfully',
      productId,
    };
  } catch (error) {
    console.error('Error adding content card:', error);
    return {
      success: false,
      message: `Failed to add content card: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Remove a content card from a product
 */
export const removeContentCardAction = withAuth(async (
  user,
  productId: string,
  cardId: string
): Promise<ActionResult> => {
  try {
    const db = getFirestore();
    
    const doc = await db.collection('product_details').doc(productId).get();
    if (!doc.exists) {
      return { success: false, message: 'Product not found' };
    }

    const product = fromFirestoreDocument(doc.data());
    
    const cardIndex = product.content_cards.findIndex(c => c.card_id === cardId);
    if (cardIndex === -1) {
      return { success: false, message: 'Content card not found' };
    }

    product.content_cards.splice(cardIndex, 1);

    await db.collection('product_details').doc(productId).update({
      content_cards: product.content_cards,
      updated_at: Math.floor(Date.now() / 1000),
    });

    revalidatePath('/products');
    return {
      success: true,
      message: 'Content card removed successfully',
      productId,
    };
  } catch (error) {
    console.error('Error removing content card:', error);
    return {
      success: false,
      message: `Failed to remove content card: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

// ============================================
// HOME SECTION OPERATIONS FOR SKU PRODUCTS
// ============================================

/**
 * Add a SKU product to home section
 * This stores a reference to the product_details document
 */
export const addSkuProductToHomeSectionAction = withAuth(async (
  _user,
  categoryId: string,
  sectionId: string,
  productId: string,
  rank: number,
  priceOverride?: number
): Promise<ActionResult> => {
  try {
    const db = getFirestore();

    // Check if product exists in product_details
    const productDoc = await db.collection('product_details').doc(productId).get();
    if (!productDoc.exists) {
      return { success: false, message: 'Product not found in product_details' };
    }

    // Check if product is already in the section
    const existingItem = await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .get();
      
    if (existingItem.exists) {
      return { success: false, message: 'Product is already in this section' };
    }
    
    // Ensure category document exists
    const categorySectionRef = db.collection('home_sections').doc(categoryId);
    const categorySectionDoc = await categorySectionRef.get();
    
    if (!categorySectionDoc.exists) {
      // Create category document
      await categorySectionRef.set({
        categoryId,
        title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Add the product to the section subcollection
    // Mark it as SKU product so we know to fetch from product_details
    const newItem: Record<string, any> = {
      productId,
      rank,
      isSkuProduct: true, // Flag to identify SKU-based products
      addedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (sectionId === 'flashSale' && priceOverride !== undefined) {
      newItem.priceOverride = priceOverride;
    }
    
    await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .set(newItem);
    
    // Update category document to include this section if not already there
    const categoryData: any = categorySectionDoc.exists ? categorySectionDoc.data() : null;
    const existingSections = categoryData?.sections || [];
    const sectionExists = existingSections.some((s: any) => s.sectionId === sectionId);
    
    if (!sectionExists) {
      let sectionTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      sectionTitle = sectionTitle.replace(/([A-Z])/g, ' $1').trim();
      
      const updatedSections = [
        ...existingSections,
        {
          sectionId,
          title: sectionTitle,
          type: sectionId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await categorySectionRef.update({
        sections: updatedSections,
        updatedAt: new Date()
      });
    }
    
    revalidatePath('/home-sections');
    return { success: true, message: 'Product added to home section successfully' };
  } catch (error) {
    console.error('Error adding SKU product to home section:', error);
    return {
      success: false,
      message: `Failed to add product to section: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
});

/**
 * Bulk add SKU products to home sections based on their categories
 * Creates featured sections for each category and adds products
 */
export const addSkuProductsToHomeSectionsAction = withAuth(async (
  _user,
  products: Array<{ product_id: string; category: string }>
): Promise<BulkUploadResult> => {
  const results: Array<{ productId: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    const db = getFirestore();

    // Group products by category
    const productsByCategory: Record<string, string[]> = {};
    for (const product of products) {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push(product.product_id);
    }

    // Process each category
    for (const [category, productIds] of Object.entries(productsByCategory)) {
      // Ensure category document exists
      const categorySectionRef = db.collection('home_sections').doc(category);
      const categorySectionDoc = await categorySectionRef.get();
      
      if (!categorySectionDoc.exists) {
        await categorySectionRef.set({
          categoryId: category,
          title: category.charAt(0).toUpperCase() + category.slice(1),
          sections: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Check/create featured section
      const categoryData: any = categorySectionDoc.exists ? categorySectionDoc.data() : { sections: [] };
      const existingSections = categoryData?.sections || [];
      const featuredExists = existingSections.some((s: any) => s.sectionId === 'featured');
      
      if (!featuredExists) {
        const updatedSections = [
          ...existingSections,
          {
            sectionId: 'featured',
            title: 'Featured Products',
            type: 'featured',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        await categorySectionRef.update({
          sections: updatedSections,
          updatedAt: new Date()
        });
      }

      // Add products to featured section
      let rank = 1;
      for (const productId of productIds) {
        try {
          // Check if already exists
          const existingItem = await db.collection('home_sections')
            .doc(category)
            .collection('featured')
            .doc(productId)
            .get();
          
          if (existingItem.exists) {
            results.push({
              productId,
              success: false,
              message: 'Already in featured section',
            });
            failedCount++;
            continue;
          }

          // Fetch product details to get sub_category
          const productDoc = await db.collection('product_details').doc(productId).get();
          const productData: any = productDoc.exists ? productDoc.data() : {};
          const subCategory = productData?.sub_category || '';
          
          // Try to get category and subcategory names from collections
          // For SKU products, category is stored as a string like "stationery"
          let categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
          let subcategoryName = subCategory.charAt(0).toUpperCase() + subCategory.slice(1).replace(/_/g, ' ');
          
          // Try to find matching category document
          const categorySnapshot = await db.collection('categories').where('name', '==', categoryName).limit(1).get();
          if (!categorySnapshot.empty) {
            const catData = categorySnapshot.docs[0].data();
            categoryName = catData.name || categoryName;
          }
          
          // Try to find matching subcategory document
          if (subCategory) {
            const subcategorySnapshot = await db.collection('subcategories').where('name', '==', subcategoryName).limit(1).get();
            if (!subcategorySnapshot.empty) {
              const subCatData = subcategorySnapshot.docs[0].data();
              subcategoryName = subCatData.name || subcategoryName;
            }
          }

          // Add to section
          await db.collection('home_sections')
            .doc(category)
            .collection('featured')
            .doc(productId)
            .set({
              productId,
              categoryId: category,  // Store category ID directly in item
              categoryName,  // Store category name for easy reference
              subcategoryId: subCategory,  // Store subcategory ID directly in item
              subcategoryName,  // Store subcategory name for easy reference
              rank,
              isSkuProduct: true,
              addedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          
          results.push({
            productId,
            success: true,
            message: `Added to ${category}/featured`,
          });
          successCount++;
          rank++;
        } catch (err) {
          results.push({
            productId,
            success: false,
            message: err instanceof Error ? err.message : 'Unknown error',
          });
          failedCount++;
        }
      }
    }

    revalidatePath('/home-sections');
    return {
      success: true,
      message: `Added ${successCount} products to home sections`,
      totalProcessed: products.length,
      successCount,
      failedCount,
      results,
    };
  } catch (error) {
    console.error('Error adding SKU products to home sections:', error);
    return {
      success: false,
      message: `Failed to add products to home sections: ${error instanceof Error ? error.message : 'Unknown error'}`,
      totalProcessed: products.length,
      successCount: 0,
      failedCount: products.length,
      results: products.map(p => ({
        productId: p.product_id,
        success: false,
        message: 'Batch operation failed',
      })),
    };
  }
});

/**
 * Get home section items with SKU product details
 */
export async function getHomeSectionSkuItemsAction(
  categoryId: string,
  sectionId: string
): Promise<Array<{ productId: string; rank: number; product?: ProductDetailsDocument }>> {
  try {
    const db = getFirestore();
    
    const itemsSnapshot = await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .orderBy('rank', 'asc')
      .get();
    
    const items = await Promise.all(itemsSnapshot.docs.map(async doc => {
      const itemData: any = doc.data();
      const result: any = {
        productId: doc.id,
        rank: itemData.rank || 0,
        isSkuProduct: itemData.isSkuProduct || false,
        priceOverride: itemData.priceOverride,
      };
      
      // If it's a SKU product, fetch from product_details
      if (itemData.isSkuProduct) {
        try {
          const productDoc = await db.collection('product_details').doc(doc.id).get();
          if (productDoc.exists) {
            result.product = fromFirestoreDocument(productDoc.data());
          }
        } catch (err) {
          console.warn(`Failed to fetch SKU product ${doc.id}:`, err);
        }
      } else {
        // Legacy support removed - only SKU products are supported now
      }
      
      return result;
    }));
    
    return items;
  } catch (error) {
    console.error('Error fetching home section SKU items:', error);
    return [];
  }
}
