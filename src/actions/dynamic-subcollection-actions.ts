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

// Get all documents from a dynamic subcollection
export async function getDynamicSubcollectionItemsAction(
  parentId: string,
  subcollectionName: string
) {
  try {
    const db = getFirestore();
    const itemsSnapshot = await db.collection('dynamic_collections')
      .doc(parentId)
      .collection(subcollectionName)
      .orderBy('rank', 'asc')
      .get();
    
    return itemsSnapshot.docs.map((doc: any) => {
      const data: any = doc.data();
      return {
        id: doc.id,
        ...data,
        addedAt: convertTimestamp(data.addedAt),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });
  } catch (error) {
    console.error('Error fetching dynamic subcollection items:', error);
    return [];
  }
}

// Add item to dynamic subcollection
export async function addToDynamicSubcollectionAction(
  parentId: string,
  subcollectionName: string,
  itemData: any
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    // Ensure parent document exists
    const parentRef = db.collection('dynamic_collections').doc(parentId);
    const parentDoc = await parentRef.get();
    
    if (!parentDoc.exists) {
      await parentRef.set({
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Add the item to the subcollection
    const newItem = {
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await parentRef.collection(subcollectionName).add(newItem);
    
    revalidatePath('/dynamic-subcollections');
    return { success: true, message: 'Item added successfully', id: docRef.id };
  } catch (error) {
    console.error('Error adding to dynamic subcollection:', error);
    return { success: false, message: 'Failed to add item' };
  }
}

// Update item in dynamic subcollection
export async function updateDynamicSubcollectionItemAction(
  parentId: string,
  subcollectionName: string,
  itemId: string,
  itemData: any
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('dynamic_collections')
      .doc(parentId)
      .collection(subcollectionName)
      .doc(itemId)
      .update({
        ...itemData,
        updatedAt: new Date(),
      });
    
    revalidatePath('/dynamic-subcollections');
    return { success: true, message: 'Item updated successfully' };
  } catch (error) {
    console.error('Error updating dynamic subcollection item:', error);
    return { success: false, message: 'Failed to update item' };
  }
}

// Delete item from dynamic subcollection
export async function deleteFromDynamicSubcollectionAction(
  parentId: string,
  subcollectionName: string,
  itemId: string
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('dynamic_collections')
      .doc(parentId)
      .collection(subcollectionName)
      .doc(itemId)
      .delete();
    
    revalidatePath('/dynamic-subcollections');
    return { success: true, message: 'Item deleted successfully' };
  } catch (error) {
    console.error('Error deleting from dynamic subcollection:', error);
    return { success: false, message: 'Failed to delete item' };
  }
}

// Get all dynamic collections metadata
export async function getDynamicCollectionsAction() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('dynamic_collections').get();
    
    return snapshot.docs.map(doc => {
      const data: any = doc.data() || {};
      
      // Convert timestamps if they exist
      if (data.createdAt) {
        data.createdAt = convertTimestamp(data.createdAt);
      }
      if (data.updatedAt) {
        data.updatedAt = convertTimestamp(data.updatedAt);
      }
      
      return {
        id: doc.id,
        ...data,
      };
    });
  } catch (error) {
    console.error('Error fetching dynamic collections:', error);
    return [];
  }
}

// Get dynamic collection by ID
export async function getDynamicCollectionAction(id: string) {
  try {
    const db = getFirestore();
    const doc = await db.collection('dynamic_collections').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data: any = doc.data() || {};
    
    // Convert timestamps if they exist
    if (data.createdAt) {
      data.createdAt = convertTimestamp(data.createdAt);
    }
    if (data.updatedAt) {
      data.updatedAt = convertTimestamp(data.updatedAt);
    }
    
    return {
      id: doc.id,
      ...data,
    };
  } catch (error) {
    console.error('Error fetching dynamic collection:', error);
    return null;
  }
}

// Create dynamic collection
export async function createDynamicCollectionAction(
  collectionData: any
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    const newCollection = {
      ...collectionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('dynamic_collections').add(newCollection);
    
    revalidatePath('/dynamic-subcollections');
    return { success: true, message: 'Collection created successfully', id: docRef.id };
  } catch (error) {
    console.error('Error creating dynamic collection:', error);
    return { success: false, message: 'Failed to create collection' };
  }
}

// Update dynamic collection
export async function updateDynamicCollectionAction(
  id: string,
  collectionData: any
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('dynamic_collections').doc(id).update({
      ...collectionData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/dynamic-subcollections');
    return { success: true, message: 'Collection updated successfully' };
  } catch (error) {
    console.error('Error updating dynamic collection:', error);
    return { success: false, message: 'Failed to update collection' };
  }
}

// Delete dynamic collection
export async function deleteDynamicCollectionAction(
  id: string
) {
  try {
    await verifyAuth();
    const db = getFirestore();

    // Delete all subcollections first
    const collectionRef = db.collection('dynamic_collections').doc(id);
    
    // Get and delete all subcollections
    const collectionDoc = await collectionRef.get();
    if (collectionDoc.exists) {
      const collectionData: any = collectionDoc.data();
      // If there are subcollections listed in the metadata, delete them
      if (collectionData?.subcollections) {
        for (const subcollectionName of collectionData.subcollections) {
          const subcollectionSnapshot = await collectionRef.collection(subcollectionName).get();
          const batch = db.batch();
          subcollectionSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
      }
    }
    
    // Delete the main document
    await collectionRef.delete();
    
    revalidatePath('/dynamic-subcollections');
    return { success: true, message: 'Collection deleted successfully' };
  } catch (error) {
    console.error('Error deleting dynamic collection:', error);
    return { success: false, message: 'Failed to delete collection' };
  }
}

// Get complete home section data for a category
export async function getCompleteHomeSectionDataAction(categoryId: string) {
  try {
    const db = getFirestore();
    
    // Get the dynamic collection document for this category
    const collectionDoc = await db.collection('dynamic_collections').doc(categoryId).get();
    
    if (!collectionDoc.exists) {
      return {
        subcollections: [],
        subcollectionData: {}
      };
    }
    
    const collectionData: any = collectionDoc.data();
    const subcollections = collectionData?.subcollections || [];
    
    // Get data for each subcollection
    const subcollectionData: any = {};
    
    for (const subcollectionName of subcollections) {
      try {
        const subcollectionSnapshot = await db.collection('dynamic_collections')
          .doc(categoryId)
          .collection(subcollectionName)
          .orderBy('rank', 'asc')
          .get();
          
        // Get product details for each item in the subcollection
        const productIds = subcollectionSnapshot.docs.map(doc => doc.data().productId).filter(Boolean);
        const productRefs = productIds.map(id => db.collection('products').doc(id));
        const productDocs = productRefs.length > 0 ? await db.getAll(...productRefs) : [];
        
        const productsMap = new Map();
        productDocs.forEach(doc => {
          if (doc.exists) {
            productsMap.set(doc.id, doc.data());
          }
        });
        
        subcollectionData[subcollectionName] = subcollectionSnapshot.docs.map(doc => {
          const data: any = doc.data();
          const product = productsMap.get(data.productId);
          
          return {
            ...data,
            product,
            addedAt: convertTimestamp(data.addedAt),
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
          };
        });
      } catch (error) {
        console.warn(`Error fetching subcollection ${subcollectionName}:`, error);
        subcollectionData[subcollectionName] = [];
      }
    }
    
    return {
      subcollections,
      subcollectionData
    };
  } catch (error) {
    console.error('Error fetching complete home section data:', error);
    return {
      subcollections: [],
      subcollectionData: {}
    };
  }
}