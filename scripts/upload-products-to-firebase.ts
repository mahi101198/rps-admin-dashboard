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

interface Product {
  product_id: string;
  title: string;
  subtitle: string;
  category: string;
  sub_category: string;
  brand: string;
  purchase_limits?: {
    max_per_order: number;
    max_per_user_per_day: number;
  };
  rating: {
    average: number;
    count: number;
  };
  created_at: string;
  updated_at: string;
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
  product_skus: Array<{
    sku_id: string;
    attributes: {
      color: string;
      size: string;
      type: string;
      pack: string;
    };
    pricing: {
      mrp: number;
      selling_price: number;
      currency: string;
    };
    inventory: {
      stock_qty: number;
    };
  }>;
  content_cards: Array<{
    card_id: string;
    title: string;
    type: string;
    data: any;
  }>;
}

async function uploadProductsToFirebase() {
  try {
    console.log('🚀 Starting Firebase Products Upload...\n');

    const productFiles = [
      'firebase-products-part1.json',
      'firebase-products-part2.json',
      'firebase-products-part3.json',
      'firebase-products-part4.json',
      'firebase-products-part5.json',
    ];

    let totalProducts = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ product_id: string; error: string }> = [];

    for (const fileName of productFiles) {
      const filePath = path.join(process.cwd(), fileName);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${fileName}`);
        continue;
      }

      console.log(`\n📁 Processing ${fileName}...`);

      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const products: Product[] = JSON.parse(fileContent);

        console.log(`   Found ${products.length} products`);

        // Upload products in batches
        const batch = db.batch();
        let batchCount = 0;
        const batchSize = 100; // Firestore batch limit is 500, but we use 100 for safety

        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          totalProducts++;

          try {
            // Validate product has required fields
            if (!product.product_id || !product.title) {
              throw new Error('Missing required fields: product_id or title');
            }

// Create or update product in product_details collection
      const productRef = db.collection('product_details').doc(product.product_id);

            // Prepare product data
            const productData = {
              ...product,
              uploaded_at: admin.firestore.FieldValue.serverTimestamp(),
              last_updated: admin.firestore.FieldValue.serverTimestamp(),
            };

            batch.set(productRef, productData, { merge: true });
            batchCount++;

            // Commit batch when reaching size limit
            if (batchCount === batchSize || i === products.length - 1) {
              await batch.commit();
              console.log(`   ✓ Uploaded ${Math.min(batchCount, batchSize)} products`);
              successCount += batchCount;
              batchCount = 0;
            }
          } catch (error) {
            errorCount++;
            errors.push({
              product_id: product.product_id || 'unknown',
              error: error instanceof Error ? error.message : String(error),
            });
            console.error(`   ✗ Error uploading product: ${product.product_id}`, error);
          }
        }

        console.log(`✅ Completed ${fileName}`);
      } catch (fileError) {
        console.error(`❌ Error processing ${fileName}:`, fileError);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Products Processed: ${totalProducts}`);
    console.log(`✅ Successfully Uploaded: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach((err) => {
        console.log(`   - ${err.product_id}: ${err.error}`);
      });
    }

    console.log('\n✨ Upload process completed!');
    process.exit(errorCount === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error during upload:', error);
    process.exit(1);
  }
}

// Run upload
uploadProductsToFirebase();
