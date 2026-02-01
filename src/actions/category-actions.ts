'use server';

import { getFirestore, getStorageBucket } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Category, SubCategory } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all categories
export async function getCategoriesAction(): Promise<Category[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('categories')
      .orderBy('rank', 'asc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: (data && data.id) || doc.id,  // Use id from data if available, otherwise use doc.id
        name: data.name || '',
        image: data.image || '',
        rank: data.rank || 0,
        isActive: data.isActive ?? true,
      } as Category;
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get category by ID
export async function getCategoryAction(id: string): Promise<Category | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('categories').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      id: (data && data.id) || doc.id,  // Use id from data if available, otherwise use doc.id
      name: data?.name || '',
      image: data?.image || '',
      rank: data?.rank || 0,
      isActive: data?.isActive ?? true,
    } as Category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

// Create category
export async function createCategoryAction(
  categoryData: Omit<Category, 'id'>
): Promise<{ success: boolean; message: string; categoryId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    // First, add the document to get the auto-generated ID
    const newCategoryWithoutId = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('categories').add(newCategoryWithoutId);
    
    // Then update the document to include its own ID
    await db.collection('categories').doc(docRef.id).update({
      id: docRef.id,
    });
    
    revalidatePath('/categories');
    return { success: true, message: 'Category created successfully', categoryId: docRef.id };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, message: 'Failed to create category' };
  }
}

// Update category
export async function updateCategoryAction(
  id: string,
  categoryData: Partial<Category>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('categories').doc(id).update({
      ...categoryData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/categories');
    return { success: true, message: 'Category updated successfully' };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, message: 'Failed to update category' };
  }
}

// Delete category
export async function deleteCategoryAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('categories').doc(id).delete();
    
    revalidatePath('/categories');
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, message: 'Failed to delete category' };
  }
}

// Get all subcategories
export async function getSubCategoriesAction(): Promise<SubCategory[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('subcategories')
      .orderBy('rank', 'asc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: (data && data.id) || doc.id,  // Use id from data if available, otherwise use doc.id
        categoryId: data.categoryId || '',
        name: data.name || '',
        image: data.image || '',
        rank: data.rank || 0,
        isActive: data.isActive ?? true,
      } as SubCategory;
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
}

// Get subcategories by category ID
export async function getSubCategoriesByCategoryAction(categoryId: string): Promise<SubCategory[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('subcategories')
      .where('categoryId', '==', categoryId)
      .orderBy('rank', 'asc')
      .get();
    
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: (data && data.id) || doc.id,  // Use id from data if available, otherwise use doc.id
        categoryId: data.categoryId || '',
        name: data.name || '',
        image: data.image || '',
        rank: data.rank || 0,
        isActive: data.isActive ?? true,
      } as SubCategory;
    });
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    return [];
  }
}

// Get subcategory by ID
export async function getSubCategoryAction(id: string): Promise<SubCategory | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('subcategories').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      id: (data && data.id) || doc.id,  // Use id from data if available, otherwise use doc.id
      categoryId: data?.categoryId || '',
      name: data?.name || '',
      image: data?.image || '',
      rank: data?.rank || 0,
      isActive: data?.isActive ?? true,
    } as SubCategory;
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return null;
  }
}

// Create subcategory
export async function createSubCategoryAction(
  subCategoryData: Omit<SubCategory, 'id'>
): Promise<{ success: boolean; message: string; subCategoryId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    // First, add the document to get the auto-generated ID
    const newSubCategoryWithoutId = {
      ...subCategoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('subcategories').add(newSubCategoryWithoutId);
    
    // Then update the document to include its own ID
    await db.collection('subcategories').doc(docRef.id).update({
      id: docRef.id,
    });
    
    revalidatePath('/categories');
    return { success: true, message: 'Subcategory created successfully', subCategoryId: docRef.id };
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return { success: false, message: 'Failed to create subcategory' };
  }
}

// Update subcategory
export async function updateSubCategoryAction(
  id: string,
  subCategoryData: Partial<SubCategory>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('subcategories').doc(id).update({
      ...subCategoryData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/categories');
    return { success: true, message: 'Subcategory updated successfully' };
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return { success: false, message: 'Failed to update subcategory' };
  }
}

// Delete subcategory
export async function deleteSubCategoryAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();

    await db.collection('subcategories').doc(id).delete();
    
    revalidatePath('/categories');
    return { success: true, message: 'Subcategory deleted successfully' };
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return { success: false, message: 'Failed to delete subcategory' };
  }
}

// Upload category image
export async function uploadCategoryImageAction(
  file: File,
  categoryId: string
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const fileName = `categories/${categoryId}_${Date.now()}.${file.name.split('.').pop()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    revalidatePath('/categories');
    return { success: true, message: 'Category image uploaded successfully', imageUrl };
  } catch (error) {
    console.error('Error uploading category image:', error);
    return { success: false, message: 'Failed to upload category image' };
  }
}

// Upload subcategory image
export async function uploadSubCategoryImageAction(
  file: File,
  subcategoryId: string
): Promise<{ success: boolean; message: string; imageUrl?: string }> {
  try {
    await verifyAuth();
    
    const bucket = getStorageBucket();
    if (!bucket) {
      return { success: false, message: 'Storage not configured' };
    }

    const fileName = `subcategories/${subcategoryId}_${Date.now()}.${file.name.split('.').pop()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    revalidatePath('/categories');
    return { success: true, message: 'Subcategory image uploaded successfully', imageUrl };
  } catch (error) {
    console.error('Error uploading subcategory image:', error);
    return { success: false, message: 'Failed to upload subcategory image' };
  }
}