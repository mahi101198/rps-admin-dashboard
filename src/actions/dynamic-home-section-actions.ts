'use server';

import { getFirestore } from '@/data/firebase.admin';
import { verifyAuth, withAuth, AuthError } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Safe timestamp conversion
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  return new Date();
};

// Deep convert all timestamps in an object
const deepConvertTimestamps = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle Firestore timestamps
  if (obj._seconds !== undefined || (obj.toDate && typeof obj.toDate === 'function')) {
    return convertTimestamp(obj);
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepConvertTimestamps(item));
  }
  
  // Handle regular objects
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = deepConvertTimestamps(value);
  }
  return converted;
};

// Get all subcollections for a category document
export async function getCategorySubcollectionsAction(categoryId: string) {
  try {
    const db = getFirestore();
    const categoryDoc = db.collection('home_sections').doc(categoryId);
    const docSnapshot = await categoryDoc.get();
    
    if (!docSnapshot.exists) {
      return [];
    }
    
    // In Firestore, we can't directly list subcollections, so we'll check for common ones
    // and also check what's in the sections metadata
    const categoryData: any = docSnapshot.data();
    const definedSections = categoryData?.sections || [];
    
    // Get section IDs from metadata
    const sectionIds = definedSections.map((section: any) => section.sectionId);
    
    return sectionIds;
  } catch (error) {
    console.error('Error fetching category subcollections:', error);
    return [];
  }
}

export async function createDynamicHomeSectionAction(
  categoryId: string,
  sectionId: string,
  title: string,
  type?: string
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    const trimmedCategoryId = categoryId.trim();
    const trimmedSectionId = sectionId.trim();
    const trimmedTitle = title.trim();

    if (!trimmedCategoryId || !trimmedSectionId || !trimmedTitle) {
      return { success: false, message: 'Missing required fields to create section' };
    }

    const now = new Date();
    const sectionEntry = {
      sectionId: trimmedSectionId,
      title: trimmedTitle,
      type: (type?.trim() || trimmedSectionId),
      createdAt: now,
      updatedAt: now,
    };

    const categoryRef = db.collection('home_sections').doc(trimmedCategoryId);
    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      await categoryRef.set({
        categoryId: trimmedCategoryId,
        title: trimmedCategoryId.charAt(0).toUpperCase() + trimmedCategoryId.slice(1),
        sections: [sectionEntry],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const categoryData: any = categorySnapshot.data() || {};
      const sections = categoryData.sections || [];

      const alreadyExists = sections.some(
        (section: any) => section.sectionId === trimmedSectionId,
      );

      if (alreadyExists) {
        return { success: false, message: 'Section already exists for this category' };
      }

      await categoryRef.update({
        sections: [...sections, sectionEntry],
        updatedAt: now,
      });
    }

    revalidatePath('/dynamic-home-sections');
    revalidatePath('/home-sections');
    return { success: true, message: 'Section created successfully' };
  } catch (error) {
    console.error('Error creating dynamic home section:', error);
    return { success: false, message: 'Failed to create section' };
  }
}

// Get home section items with product details for a specific category and section
export async function getDynamicHomeSectionItemsAction(
  categoryId: string,
  sectionId: string
) {
  try {
    const db = getFirestore();
    // Get the category-based section document
    const sectionDoc = await db.collection('home_sections').doc(categoryId).get();
    
    if (!sectionDoc.exists) {
      return [];
    }
    
    // Get items from the subcollection
    const itemsSnapshot = await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .orderBy('rank', 'asc')
      .get();
    
    // Process items
    const itemsWithProducts = itemsSnapshot.docs.map(doc => {
      const itemData: any = doc.data();
      
      // Convert timestamps
      const convertedItem: any = {
        productId: doc.id,
        ...itemData,
        addedAt: convertTimestamp(itemData.addedAt),
        createdAt: convertTimestamp(itemData.createdAt),
        updatedAt: convertTimestamp(itemData.updatedAt)
      };
      
      // If product info is already stored, use it
      if (itemData.product) {
        convertedItem.product = deepConvertTimestamps(itemData.product);
      }
      
      return convertedItem;
    });
    
    return itemsWithProducts;
  } catch (error) {
    console.error('Error fetching home section items:', error);
    return [];
  }
}

export async function getAllDynamicHomeSectionsAction() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('home_sections').get();

    return snapshot.docs.map(doc => {
      const data: any = doc.data() || {};
      
      // Convert timestamps in sections array if it exists
      if (data.sections && Array.isArray(data.sections)) {
        data.sections = data.sections.map((section: any) => ({
          ...section,
          createdAt: convertTimestamp(section.createdAt),
          updatedAt: convertTimestamp(section.updatedAt)
        }));
      }
      
      return {
        categoryId: doc.id,
        ...data,
      };
    });
  } catch (error) {
    console.error('Error fetching all dynamic home sections:', error);
    return [];
  }
}

export async function getDynamicHomeSectionsForCategoryAction(categoryId: string) {
  try {
    const db = getFirestore();
    const categoryDoc = await db.collection('home_sections').doc(categoryId).get();

    if (!categoryDoc.exists) {
      return {
        categoryId,
        sections: [],
      };
    }

    const data: any = categoryDoc.data() || {};
    
    // Convert timestamps in sections array if it exists
    if (data.sections && Array.isArray(data.sections)) {
      data.sections = data.sections.map((section: any) => ({
        ...section,
        createdAt: convertTimestamp(section.createdAt),
        updatedAt: convertTimestamp(section.updatedAt)
      }));
    }

    return {
      categoryId,
      ...data,
    };
  } catch (error) {
    console.error('Error fetching dynamic home sections for category:', error);
    return {
      categoryId,
      sections: [],
    };
  }
}

// Add product to home section in category-based structure
export async function addProductToDynamicHomeSectionAction(
  categoryId: string,
  sectionId: string,
  productId: string,
  rank: number,
  priceOverride?: number
) {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Check if product is already in the section
    const existingItem = await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .get();
      
    if (existingItem.exists) {
      return { success: false, message: 'Product is already in this section' };
    }
    
    // Get full product information (except product details)
    const productDoc = await db.collection('products').doc(productId).get();
    let productInfo = {};
    if (productDoc.exists) {
      const productData: any = productDoc.data();
      // Include all product fields except product details
      productInfo = {
        productId: productDoc.id,
        name: productData?.name || '',
        price: productData?.price || 0,
        discountPrice: productData?.discountPrice || 0,
        image: productData?.image || '',
        stock: productData?.stock || 0,
        categoryId: productData?.categoryId || '',
        subcategoryId: productData?.subcategoryId || '',
        isActive: productData?.isActive ?? true,
        createdAt: convertTimestamp(productData?.createdAt),
        updatedAt: convertTimestamp(productData?.updatedAt)
      };
    }
    
    // Ensure category document exists
    const categorySectionRef = db.collection('home_sections').doc(categoryId);
    const categorySectionDoc = await categorySectionRef.get();
    
    if (!categorySectionDoc.exists) {
      // Create category document
      await categorySectionRef.set({
        categoryId,
        title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1), // Capitalize first letter
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Add the product to the section subcollection
    const newItem = {
      productId,
      rank,
      product: productInfo, // Add full product information
      addedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(sectionId === 'flashSale' && priceOverride !== undefined && { priceOverride })
    };
    
    await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .set(newItem);
    
    // Update category document to include this section if not already there
    const categoryData: any = categorySectionDoc.exists ? categorySectionDoc.data() : null;
    const existingSections = categoryData?.sections || [];
    const sectionExists = existingSections.some((s: any) => s.sectionId === sectionId);
    
    // Create a default title if section doesn't exist
    let sectionTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    sectionTitle = sectionTitle.replace(/([A-Z])/g, ' $1').trim(); // Add spaces between camelCase words
    
    if (!sectionExists) {
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
    return { success: true, message: 'Product added to section successfully' };
  } catch (error) {
    console.error('Error adding product to home section:', error);
    return { success: false, message: 'Failed to add product to section' };
  }
}

// Remove product from home section
export async function removeProductFromDynamicHomeSectionAction(
  categoryId: string,
  sectionId: string,
  productId: string
) {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .delete();
    
    revalidatePath('/home-sections');
    return { success: true, message: 'Product removed from section successfully' };
  } catch (error) {
    console.error('Error removing product from home section:', error);
    return { success: false, message: 'Failed to remove product from section' };
  }
}

// Update product rank in home section
export async function updateDynamicHomeSectionItemRankAction(
  categoryId: string,
  sectionId: string,
  productId: string,
  rank: number
) {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .update({
        rank,
        updatedAt: new Date()
      });
    
    revalidatePath('/home-sections');
    return { success: true, message: 'Product rank updated successfully' };
  } catch (error) {
    console.error('Error updating product rank:', error);
    return { success: false, message: 'Failed to update product rank' };
  }
}

// Update home section item (including price override for flash sale)
export async function updateDynamicHomeSectionItemAction(
  categoryId: string,
  sectionId: string,
  productId: string,
  updates: { rank?: number; priceOverride?: number }
) {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (updates.rank !== undefined) {
      updateData.rank = updates.rank;
    }
    
    // Only allow priceOverride for flashSale section
    if (sectionId === 'flashSale' && updates.priceOverride !== undefined) {
      updateData.priceOverride = updates.priceOverride;
    }
    
    await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .doc(productId)
      .update(updateData);
    
    revalidatePath('/home-sections');
    return { success: true, message: 'Section item updated successfully' };
  } catch (error) {
    console.error('Error updating home section item:', error);
    return { success: false, message: 'Failed to update section item' };
  }
}

// Get all home sections for a category
export async function getDynamicHomeSectionsAction(categoryId: string) {
  try {
    const db = getFirestore();
    const sectionDoc = await db.collection('home_sections').doc(categoryId).get();
    
    if (!sectionDoc.exists) {
      return [];
    }
    
    const data: any = sectionDoc.data();
    
    // Convert timestamps in sections array if it exists
    if (data?.sections && Array.isArray(data.sections)) {
      return data.sections.map((section: any) => ({
        ...section,
        createdAt: convertTimestamp(section.createdAt),
        updatedAt: convertTimestamp(section.updatedAt)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return [];
  }
}

// Update home section metadata
export async function updateDynamicHomeSectionAction(
  categoryId: string,
  sectionId: string,
  updates: { title?: string; type?: string }
) {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Get current category document
    const categoryDoc = await db.collection('home_sections').doc(categoryId).get();
    
    if (!categoryDoc.exists) {
      return { success: false, message: 'Category section not found' };
    }
    
    const categoryData: any = categoryDoc.data();
    const sections = categoryData?.sections || [];
    
    // Find and update the section
    const updatedSections = sections.map((section: any) => {
      if (section.sectionId === sectionId) {
        return {
          ...section,
          ...updates,
          updatedAt: new Date()
        };
      }
      return section;
    });
    
    // Update the category document
    await db.collection('home_sections').doc(categoryId).update({
      sections: updatedSections,
      updatedAt: new Date()
    });
    
    revalidatePath('/home-sections');
    return { success: true, message: 'Section updated successfully' };
  } catch (error) {
    console.error('Error updating home section:', error);
    return { success: false, message: 'Failed to update section' };
  }
}

// Delete home section
export async function deleteDynamicHomeSectionAction(
  categoryId: string,
  sectionId: string
) {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Get current category document
    const categoryDoc = await db.collection('home_sections').doc(categoryId).get();
    
    if (!categoryDoc.exists) {
      return { success: false, message: 'Category section not found' };
    }
    
    const categoryData: any = categoryDoc.data();
    const sections = categoryData?.sections || [];
    
    // Remove the section from the sections array
    const updatedSections = sections.filter((section: any) => section.sectionId !== sectionId);
    
    // Update the category document
    await db.collection('home_sections').doc(categoryId).update({
      sections: updatedSections,
      updatedAt: new Date()
    });
    
    // Delete all items in the section subcollection
    const itemsSnapshot = await db.collection('home_sections')
      .doc(categoryId)
      .collection(sectionId)
      .get();
    
    const batch = db.batch();
    itemsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    revalidatePath('/home-sections');
    return { success: true, message: 'Section deleted successfully' };
  } catch (error) {
    console.error('Error deleting home section:', error);
    return { success: false, message: 'Failed to delete section' };
  }
}