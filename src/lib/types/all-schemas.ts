// 1. 📦 Main Product (Lightweight data for listings)
export interface Product {
  productId: string;
  name: string;
  mrp: number;
  price: number;
  discount: number;
  image: string;
  stock: number;
  categoryId: string;
  subcategoryId: string;
  isActive: boolean;
  maxQuantityPerUser: number;
  createdAt: Date;
  updatedAt: Date;
}

// 2. 📄 Product Details (Heavy data for product pages)
export interface ProductDetails {
  productId: string;
  description: string;
  images: string[]; // full-size images
  miniInfo: string[];
  tags: string[];
  colors: string[];
  shippingInfo?: string;
  shippingInfoTitle?: string;
  returnTitle?: string;
  returnDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 3. 🔄 Combined Product with Details
export interface ProductWithDetails extends Product, ProductDetails {
  detailsCreatedAt?: Date;
  detailsUpdatedAt?: Date;
}

// 4. ⭐ Product Review
export interface ProductReview {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 5. 📝 Admin Product Form (For form validation)
export interface AdminProductForm extends Omit<ProductWithDetails, 'createdAt' | 'updatedAt' | 'detailsCreatedAt' | 'detailsUpdatedAt'> {
  maxQuantityPerUser: number;
  colors: string[]; // Add this line
}

// 6. 🏷️ Category
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 7. 🏷️ SubCategory
export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
