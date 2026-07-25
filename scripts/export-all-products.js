const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Locate service account file
const serviceAccountPath = path.join(__dirname, '..', 'rps-statationary-jaipur-firebase-adminsdk-fbsvc-278d9f1c12.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Error: Firebase service account file not found at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportAllProducts() {
  try {
    console.log('📦 Fetching all products from Firestore database (collection: product_details)...');

    const collectionRef = db.collection('product_details');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log('⚠️ No products found in collection "product_details".');
      process.exit(0);
    }

    console.log(`Found ${snapshot.docs.length} products in Firestore.`);

    const products = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Convert Firestore Timestamps to ISO strings for clean JSON
      if (data.created_at && typeof data.created_at.toDate === 'function') {
        data.created_at = data.created_at.toDate().toISOString();
      }
      if (data.updated_at && typeof data.updated_at.toDate === 'function') {
        data.updated_at = data.updated_at.toDate().toISOString();
      }
      if (data.uploaded_at && typeof data.uploaded_at.toDate === 'function') {
        data.uploaded_at = data.uploaded_at.toDate().toISOString();
      }

      products.push(data);
    });

    // Save to all-products.json
    const outputPath = path.join(__dirname, '..', 'all-products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');

    const stats = fs.statSync(outputPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n==================================================');
    console.log(`✅ Successfully exported ${products.length} products!`);
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`📊 File Size: ${fileSizeInMB} MB (${stats.size.toLocaleString()} bytes)`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting products:', error);
    process.exit(1);
  }
}

exportAllProducts();
