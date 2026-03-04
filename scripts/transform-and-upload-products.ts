import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(process.cwd(), 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Firebase service account file not found at ${serviceAccountPath}`);
  console.error('Please set FIREBASE_SERVICE_ACCOUNT_PATH environment variable or place firebase-service-account.json in project root');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

interface ProductSKU {
  sku_id: string;
  price?: number;
  mrp?: number;
  availability?: string;
  available_quantity?: number;
  currency?: string;
  attributes?: Record<string, any>;
  pricing?: {
    mrp: number;
    selling_price: number;
    currency: string;
  };
  inventory?: {
    stock_qty: number;
  };
}

interface NewProduct {
  product_id: string;
  title?: string;
  subtitle?: string;
  category: string;
  sub_category: string;
  brand: string;
  purchase_limits?: {
    max_per_order: number;
    max_per_user_per_day: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
  media: {
    main_image: {
      url: string;
      alt_text: string;
    };
    gallery: Array<{
      url: string;
      alt_text: string;
    }>;
  };
  product_skus: ProductSKU[];
  content_cards: Array<any>;
  delivery_info?: any;
  overall_availability?: string;
  uploaded_at?: string;
  last_updated?: string;
  variant_attributes?: Record<string, any>;
  id?: string;
}

interface TransformedProduct extends NewProduct {
  title: string;
  subtitle: string;
  rating: {
    average: number;
    count: number;
  };
  product_skus: Array<{
    sku_id: string;
    attributes: Record<string, any>;
    pricing: {
      mrp: number;
      selling_price: number;
      currency: string;
    };
    inventory: {
      stock_qty: number;
    };
  }>;
}

function transformProduct(product: NewProduct): TransformedProduct {
  try {
    // Ensure all required fields exist
    if (!product.product_id) {
      throw new Error('Missing product_id');
    }

    // Transform SKUs to match Firebase schema
    const transformedSkus = product.product_skus.map((sku: ProductSKU) => {
      const price = sku.price || sku.mrp || 0;
      const mrp = sku.mrp || sku.price || 0;
      const sellingPrice = sku.price || mrp;

      return {
        sku_id: sku.sku_id,
        attributes: sku.attributes || {},
        pricing: {
          mrp: mrp,
          selling_price: sellingPrice,
          currency: sku.currency || 'INR',
        },
        inventory: {
          stock_qty: sku.available_quantity || 0,
        },
      };
    });

    // Transform the product
    const transformed: TransformedProduct = {
      ...product,
      title: product.title || product.product_id,
      subtitle: product.subtitle || '',
      rating: product.rating || { average: 0, count: 0 },
      product_skus: transformedSkus,
      created_at: product.created_at === '__SERVER_TIMESTAMP__' ? '__SERVER_TIMESTAMP__' : (product.created_at || '__SERVER_TIMESTAMP__'),
      updated_at: product.updated_at === '__SERVER_TIMESTAMP__' ? '__SERVER_TIMESTAMP__' : (product.updated_at || '__SERVER_TIMESTAMP__'),
    };

    return transformed;
  } catch (error) {
    throw new Error(`Failed to transform product ${product.product_id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function transformAndUploadProducts() {
  try {
    console.log('🚀 Starting Product Transformation and Firebase Upload...\n');

    // Read newproducts.json
    const newProductsPath = path.join(process.cwd(), 'src', 'newproducts.json');

    if (!fs.existsSync(newProductsPath)) {
      console.error(`❌ Error: newproducts.json not found at ${newProductsPath}`);
      process.exit(1);
    }

    console.log(`📖 Reading newproducts.json...`);
    const fileContent = fs.readFileSync(newProductsPath, 'utf8');
    const products: NewProduct[] = JSON.parse(fileContent);

    console.log(`✅ Found ${products.length} products to transform\n`);
    console.log(`📊 Analyzing and transforming products...`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ product_id: string; error: string }> = [];
    const transformedProducts: TransformedProduct[] = [];

    // Transform all products
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        const transformed = transformProduct(product);
        transformedProducts.push(transformed);
        successCount++;

        if ((i + 1) % 50 === 0) {
          console.log(`   Ready: ${i + 1}/${products.length} products`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          product_id: product.product_id || 'unknown',
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`   ✗ Error transforming product: ${product.product_id}`, error);
      }
    }

    if (errorCount > 0) {
      console.log(`\n⚠️  Transformation completed with ${errorCount} errors`);
      errors.forEach((err) => {
        console.log(`   - ${err.product_id}: ${err.error}`);
      });
      process.exit(1);
    }

    // Save transformed products to a temporary file for verification
    const transformedPath = path.join(process.cwd(), 'src', 'newproducts-transformed.json');
    fs.writeFileSync(transformedPath, JSON.stringify(transformedProducts, null, 2), 'utf8');
    console.log(`\n💾 Saved transformed products to newproducts-transformed.json`);

    // Upload to Firebase
    console.log(`\n📤 Uploading ${transformedProducts.length} products to Firebase...`);

    let uploadSuccess = 0;
    let uploadError = 0;
    const uploadErrors: Array<{ product_id: string; error: string }> = [];

    const batchSize = 100; // Firestore batch limit
    const batches = Math.ceil(transformedProducts.length / batchSize);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, transformedProducts.length);
      const batchProducts = transformedProducts.slice(start, end);

      const batch = db.batch();

      for (const product of batchProducts) {
        try {
          // Validate required fields
          if (!product.product_id || !product.title) {
            throw new Error('Missing required fields: product_id or title');
          }

          const productRef = db.collection('product_details').doc(product.product_id);

          // Prepare product data - handle server timestamps
          const productData: any = {};
          for (const [key, value] of Object.entries(product)) {
            if (value === '__SERVER_TIMESTAMP__') {
              productData[key] = admin.firestore.FieldValue.serverTimestamp();
            } else {
              productData[key] = value;
            }
          }

          batch.set(productRef, productData, { merge: true });
          uploadSuccess++;
        } catch (error) {
          uploadError++;
          uploadErrors.push({
            product_id: product.product_id || 'unknown',
            error: error instanceof Error ? error.message : String(error),
          });
          console.error(`   ✗ Error preparing product: ${product.product_id}`, error);
        }
      }

      // Commit batch
      try {
        await batch.commit();
        console.log(`   ✓ Batch ${batchIndex + 1}/${batches} committed (${batchProducts.length} products)`);
      } catch (error) {
        console.error(`   ✗ Error committing batch ${batchIndex + 1}:`, error);
        uploadError += batchProducts.length;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TRANSFORMATION & UPLOAD SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Products Processed: ${products.length}`);
    console.log(`✅ Successfully Transformed: ${successCount}`);
    console.log(`❌ Transformation Errors: ${errorCount}`);
    console.log(`✅ Successfully Uploaded: ${uploadSuccess}`);
    console.log(`❌ Upload Errors: ${uploadError}`);
    console.log('='.repeat(70));

    if (uploadErrors.length > 0) {
      console.log('\n⚠️  UPLOAD ERRORS:');
      uploadErrors.forEach((err) => {
        console.log(`   - ${err.product_id}: ${err.error}`);
      });
    }

    if (errorCount === 0 && uploadError === 0) {
      console.log('\n✨ All products successfully uploaded to Firebase!');
      console.log(`📍 Collection: product_details`);
      console.log(`📊 Total Uploaded: ${uploadSuccess}`);
    }

    process.exit(errorCount === 0 && uploadError === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error during transformation and upload:', error);
    process.exit(1);
  }
}

// Run transformation and upload
transformAndUploadProducts();
