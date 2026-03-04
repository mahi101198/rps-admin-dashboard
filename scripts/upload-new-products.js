const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK using environment variables
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                           path.join(process.cwd(), 'firebase-service-account.json');

console.log('📍 Service account path:', serviceAccountPath);
console.log('✓ File exists:', fs.existsSync(serviceAccountPath));

try {
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Error: Firebase service account file not found at ${serviceAccountPath}`);
    console.error('Trying to use environment variables...');
    
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        private_key_id: 'fbsvc',
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: '103640123456789',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://accounts.google.com/o/oauth2/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase initialized with environment variables');
    } else {
      throw new Error('Missing Firebase credentials in environment variables');
    }
  } else {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase initialized with service account file');
  }

  const db = admin.firestore();

  async function transformAndUploadProducts() {
    try {
      console.log('\n🚀 Starting Product Transformation and Firebase Upload...\n');

      // Read newproducts.json
      const newProductsPath = path.join(process.cwd(), 'src', 'newproducts.json');

      if (!fs.existsSync(newProductsPath)) {
        console.error(`❌ Error: newproducts.json not found at ${newProductsPath}`);
        process.exit(1);
      }

      console.log(`📖 Reading newproducts.json...`);
      const fileContent = fs.readFileSync(newProductsPath, 'utf8');
      const products = JSON.parse(fileContent);

      console.log(`✅ Found ${products.length} products to transform\n`);
      console.log(`📊 Analyzing and transforming products...`);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const transformedProducts = [];

      // Transform all products
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        try {
          // Transform SKUs to match Firebase schema
          const transformedSkus = product.product_skus.map((sku) => {
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
          const transformed = {
            ...product,
            title: product.title || product.product_id,
            subtitle: product.subtitle || '',
            rating: product.rating || { average: 0, count: 0 },
            product_skus: transformedSkus,
            created_at: product.created_at === '__SERVER_TIMESTAMP__' ? '__SERVER_TIMESTAMP__' : (product.created_at || '__SERVER_TIMESTAMP__'),
            updated_at: product.updated_at === '__SERVER_TIMESTAMP__' ? '__SERVER_TIMESTAMP__' : (product.updated_at || '__SERVER_TIMESTAMP__'),
          };

          transformedProducts.push(transformed);
          successCount++;

          if ((i + 1) % 10 === 0) {
            console.log(`   Ready: ${i + 1}/${products.length} products`);
          }
        } catch (error) {
          errorCount++;
          errors.push({
            product_id: product.product_id || 'unknown',
            error: error.message,
          });
          console.error(`   ✗ Error transforming product: ${product.product_id}`, error.message);
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
      const uploadErrors = [];

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
            const productData = {};
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
              error: error.message,
            });
            console.error(`   ✗ Error preparing product: ${product.product_id}`, error.message);
          }
        }

        // Commit batch
        try {
          await batch.commit();
          console.log(`   ✓ Batch ${batchIndex + 1}/${batches} committed (${batchProducts.length} products)`);
        } catch (error) {
          console.error(`   ✗ Error committing batch ${batchIndex + 1}:`, error.message);
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
      console.error('❌ Fatal error during transformation and upload:', error.message);
      process.exit(1);
    }
  }

  // Run transformation and upload
  transformAndUploadProducts();
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  process.exit(1);
}
