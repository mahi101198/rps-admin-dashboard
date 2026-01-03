import { z } from 'zod';

// 2. 📄 Product Details (Heavy data for product pages)
export const ProductDetailsSchema = z.object({
    productId: z.string(),
    description: z.string().min(1, 'Description is required'),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
    miniInfo: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    colors: z.array(z.string()).default([]),
    shippingInfo: z.string().optional(),
    shippingInfoTitle: z.string().optional(),
    returnTitle: z.string().optional(),
    returnDescription: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});