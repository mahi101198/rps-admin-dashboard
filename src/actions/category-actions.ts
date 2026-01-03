'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { Category, SubCategory } from '@/lib/types/product';
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
        id: doc.id,
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
      id: doc.id,
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

    const newCategory = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('categories').add(newCategory);
    
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
        id: doc.id,
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
        id: doc.id,
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
      id: doc.id,
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

    const newSubCategory = {
      ...subCategoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('subcategories').add(newSubCategory);
    
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