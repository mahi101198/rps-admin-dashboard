'use server';

import { getFirestore } from '@/data/firebase.admin';
import { revalidatePath } from 'next/cache';
import { User, UserWithDetails, UserAddress } from '@/lib/types/product';
import { withAuth, AuthError } from '@/lib/auth';

// Get all users
export async function getUsersAction(): Promise<UserWithDetails[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('users').get();
    
    return snapshot.docs.map(doc => {
      const data: any = doc.data();
      return {
        userId: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        addresses: data.addresses || [],
        role: data.role || 'customer',
        walletBalance: data.walletBalance || 0,
        referredBy: data.referredBy || null,
        profilePicture: data.profilePicture || undefined,
        referralCode: data.referralCode || '',
        createdAt: data.createdAt?._seconds ? 
          new Date(data.createdAt._seconds * 1000) : 
          data.createdAt instanceof Date ? data.createdAt :
          new Date(),
        updatedAt: data.updatedAt?._seconds ? 
          new Date(data.updatedAt._seconds * 1000) : 
          new Date(),
      } as UserWithDetails;
    });
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
    
    const data: any = doc.data();
    return {
      userId: doc.id,
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      addresses: data?.addresses || [],
      role: data?.role || 'customer',
      walletBalance: data?.walletBalance || 0,
      referredBy: data?.referredBy || null,
      profilePicture: data?.profilePicture || undefined,
      referralCode: data?.referralCode || '',
      createdAt: data?.createdAt?._seconds ? 
        new Date(data.createdAt._seconds * 1000) : 
        data?.createdAt instanceof Date ? data.createdAt :
        new Date(),
      updatedAt: data?.updatedAt?._seconds ? 
        new Date(data.updatedAt._seconds * 1000) : 
        new Date(),
    } as UserWithDetails;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Update user
export const updateUserAction = withAuth(async (
  user,
  userId: string,
  userData: Partial<UserWithDetails>
): Promise<{ success: boolean; message: string }> => {
  try {
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
});

// Delete user
export const deleteUserAction = withAuth(async (
  user,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    await db.collection('users').doc(userId).delete();
    
    revalidatePath('/users');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user' };
  }
});

// Update user role
export const updateUserRoleAction = withAuth(async (
  user,
  userId: string,
  role: string
): Promise<{ success: boolean; message: string }> => {
  try {
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
});

// Add user address
export const addUserAddressAction = withAuth(async (
  user,
  userId: string,
  address: Omit<UserAddress, 'addressId'>
): Promise<{ success: boolean; message: string; addressId?: string }> => {
  try {
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' };
    }

    const userData: any = userDoc.data();
    const addresses = userData?.addresses || [];
    
    const newAddress = {
      ...address,
      addressId: Date.now().toString(), // Simple ID generation
    };
    
    addresses.push(newAddress);
    
    await db.collection('users').doc(userId).update({
      addresses,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Address added successfully', addressId: newAddress.addressId };
  } catch (error) {
    console.error('Error adding user address:', error);
    return { success: false, message: 'Failed to add address' };
  }
});

// Update user address
export const updateUserAddressAction = withAuth(async (
  user,
  userId: string,
  addressId: string,
  address: Partial<UserAddress>
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' };
    }

    const userData: any = userDoc.data();
    const addresses = userData?.addresses || [];
    
    const addressIndex = addresses.findIndex((addr: UserAddress) => addr.addressId === addressId);
    if (addressIndex < 0) {
      return { success: false, message: 'Address not found' };
    }
    
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...address,
    };
    
    await db.collection('users').doc(userId).update({
      addresses,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Address updated successfully' };
  } catch (error) {
    console.error('Error updating user address:', error);
    return { success: false, message: 'Failed to update address' };
  }
});

// Delete user address
export const deleteUserAddressAction = withAuth(async (
  user,
  userId: string,
  addressId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' };
    }

    const userData: any = userDoc.data();
    const addresses = userData?.addresses || [];
    
    const updatedAddresses = addresses.filter((addr: UserAddress) => addr.addressId !== addressId);
    
    await db.collection('users').doc(userId).update({
      addresses: updatedAddresses,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Address deleted successfully' };
  } catch (error) {
    console.error('Error deleting user address:', error);
    return { success: false, message: 'Failed to delete address' };
  }
});

// Update user wallet balance
export const updateUserWalletBalanceAction = withAuth(async (
  user,
  userId: string,
  amount: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' };
    }

    const userData: any = userDoc.data();
    const currentBalance = userData?.walletBalance || 0;
    const newBalance = currentBalance + amount;
    
    await db.collection('users').doc(userId).update({
      walletBalance: newBalance,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Wallet balance updated successfully' };
  } catch (error) {
    console.error('Error updating user wallet balance:', error);
    return { success: false, message: 'Failed to update wallet balance' };
  }
});

// Update user wallet with operation support
export const updateUserWalletAction = withAuth(async (
  user,
  userId: string,
  amount: number,
  operation: 'add' | 'subtract' | 'set'
): Promise<{ success: boolean; message: string }> => {
  try {
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' };
    }

    const userData: any = userDoc.data();
    const currentBalance = userData?.walletBalance || 0;
    
    let newBalance: number;
    switch (operation) {
      case 'add':
        newBalance = currentBalance + amount;
        break;
      case 'subtract':
        newBalance = Math.max(0, currentBalance - amount);
        break;
      case 'set':
        newBalance = amount;
        break;
      default:
        return { success: false, message: 'Invalid operation' };
    }
    
    await db.collection('users').doc(userId).update({
      walletBalance: newBalance,
      updatedAt: new Date(),
    });
    
    revalidatePath('/users');
    return { success: true, message: 'Wallet balance updated successfully' };
  } catch (error) {
    console.error('Error updating user wallet:', error);
    return { success: false, message: 'Failed to update wallet balance' };
  }
});
