'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { User, UserWithDetails, UserAddress } from '@/lib/types/all-schemas';
import { withAuth, verifyAuth, AuthError } from '@/lib/auth';

// Get all users
export async function getUsersAction(): Promise<UserWithDetails[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('users').get();
    
    const users: UserWithDetails[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Fetch user addresses
      const addressesSnapshot = await db.collection(`users/${doc.id}/addresses`).get();
      const addresses: UserAddress[] = addressesSnapshot.docs.map((addrDoc: any) => {
        const addrData = addrDoc.data();
        return {
          addressId: addrDoc.id,
          userId: doc.id,
          name: addrData.name || '',
          phone: addrData.phone || '',
          address: addrData.address || '',
          city: addrData.city || '',
          state: addrData.state || '',
          pincode: addrData.pincode || '',
          isDefault: addrData.isDefault || false,
          createdAt: addrData.createdAt instanceof Date ? addrData.createdAt : new Date(),
          updatedAt: addrData.updatedAt instanceof Date ? addrData.updatedAt : new Date(),
        };
      });
      
      users.push({
        userId: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'customer',
        isActive: data.isActive ?? true,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
        addresses,
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Get user by ID
export async function getUserAction(userId: string): Promise<UserWithDetails | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('users').doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    
    // Fetch user addresses
    const addressesSnapshot = await db.collection(`users/${userId}/addresses`).get();
    const addresses: UserAddress[] = addressesSnapshot.docs.map((addrDoc: any) => {
      const addrData = addrDoc.data();
      return {
        addressId: addrDoc.id,
        userId,
        name: addrData.name || '',
        phone: addrData.phone || '',
        address: addrData.address || '',
        city: addrData.city || '',
        state: addrData.state || '',
        pincode: addrData.pincode || '',
        isDefault: addrData.isDefault || false,
        createdAt: addrData.createdAt instanceof Date ? addrData.createdAt : new Date(),
        updatedAt: addrData.updatedAt instanceof Date ? addrData.updatedAt : new Date(),
      };
    });
    
    return {
      userId: doc.id,
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      role: data?.role || 'customer',
      isActive: data?.isActive ?? true,
      createdAt: data?.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data?.updatedAt instanceof Date ? data.updatedAt : new Date(),
      addresses,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Update user
export async function updateUserAction(
  userId: string,
  userData: Partial<User>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('users').doc(userId).update({
      ...userData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Failed to update user' };
  }
}

// Delete user
export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Delete user addresses
    const addressesSnapshot = await db.collection(`users/${userId}/addresses`).get();
    const batch = db.batch();
    addressesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Delete user
    await db.collection('users').doc(userId).delete();
    
    revalidatePath('/users');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user' };
  }
}

// Toggle user active status
export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('users').doc(userId).update({
      isActive,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { success: false, message: 'Failed to update user status' };
  }
}

// Add user address
export async function addUserAddressAction(
  userId: string,
  address: Omit<UserAddress, 'addressId' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message: string; addressId?: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    const newAddress = {
      ...address,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await db.collection(`users/${userId}/addresses`).add(newAddress);
    
    revalidatePath('/users');
    return { success: true, message: 'Address added successfully', addressId: docRef.id };
  } catch (error) {
    console.error('Error adding address:', error);
    return { success: false, message: 'Failed to add address' };
  }
}

// Update user address
export async function updateUserAddressAction(
  userId: string,
  addressId: string,
  addressData: Partial<UserAddress>
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection(`users/${userId}/addresses`).doc(addressId).update({
      ...addressData,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Address updated successfully' };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, message: 'Failed to update address' };
  }
}

// Delete user address
export async function deleteUserAddressAction(
  userId: string,
  addressId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection(`users/${userId}/addresses`).doc(addressId).delete();
    
    revalidatePath('/users');
    return { success: true, message: 'Address deleted successfully' };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, message: 'Failed to delete address' };
  }
}

// Update user role
export async function updateUserRoleAction(
  userId: string,
  role: string
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    await db.collection('users').doc(userId).update({
      role,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, message: 'Failed to update user role' };
  }
}

// Update user wallet balance
export async function updateUserWalletAction(
  userId: string,
  amount: number,
  operation: 'add' | 'subtract' | 'set' = 'set'
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAuth();
    const db = getFirestore();
    
    // Get current wallet balance if operation is add or subtract
    let newBalance = amount;
    if (operation !== 'set') {
      const userDoc = await db.collection('users').doc(userId).get();
      const currentBalance = userDoc.data()?.walletBalance || 0;
      
      if (operation === 'add') {
        newBalance = currentBalance + amount;
      } else if (operation === 'subtract') {
        newBalance = Math.max(0, currentBalance - amount);
      }
    }
    
    await db.collection('users').doc(userId).update({
      walletBalance: newBalance,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Wallet balance updated successfully' };
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return { success: false, message: 'Failed to update wallet balance' };
  }
}
