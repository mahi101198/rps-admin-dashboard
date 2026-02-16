import { NextRequest, NextResponse } from "next/server";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  originalPrice?: number;
}

// Mock products - replace with real database query if needed
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Notebook A4",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1507842425343-583cf155a306?w=400&h=400&fit=crop",
    category: "stationery",
    originalPrice: 499,
    description: "High-quality A4 notebook perfect for writing and sketching",
  },
  {
    id: "2",
    name: "Professional Pen Set",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1577720643272-265f434a4f7f?w=400&h=400&fit=crop",
    category: "pens",
    originalPrice: 299,
    description: "Set of 5 premium ballpoint pens in different colors",
  },
  {
    id: "3",
    name: "Sketch Pencil Collection",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    category: "pencils",
    originalPrice: 399,
    description: "Professional grade sketching pencils set",
  },
  {
    id: "4",
    name: "Highlighter Set Premium",
    price: 179,
    image:
      "https://images.unsplash.com/photo-1516062423479-7f3a2d9c73d4?w=400&h=400&fit=crop",
    category: "markers",
    originalPrice: 299,
    description: "Bright highlighters in 8 vibrant colors",
  },
  {
    id: "5",
    name: "Professional Art Canvas",
    price: 499,
    image:
      "https://images.unsplash.com/photo-1561214115-6d2f1b1b6f8d?w=400&h=400&fit=crop",
    category: "art",
    originalPrice: 899,
    description: "High-quality canvas for professional artists",
  },
  {
    id: "6",
    name: "Drawing Board Studio",
    price: 599,
    image:
      "https://images.unsplash.com/photo-1565193566173-7ceb7e21d703?w=400&h=400&fit=crop",
    category: "art",
    originalPrice: 999,
    description: "Professional drawing board with stand",
  },
];

export async function GET(req: NextRequest) {
  try {
    // TODO: Replace with actual database query to fetch products from your products collection
    // For now, returning mock products
    
    return NextResponse.json(MOCK_PRODUCTS);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: String(error) },
      { status: 500 }
    );
  }
}
