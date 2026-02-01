const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(process.cwd(), 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Firebase service account file not found at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function inspectFirebaseDatabase() {
  try {
    console.log('🔍 Firebase Database Inspector\n');

    // Get collection reference
    const collectionRef = db.collection('product_details');

    // Count total documents
    const snapshot = await collectionRef.count().get();
    const totalProducts = snapshot.data().count;

    console.log('📊 Collection: product_details');
    console.log(`📈 Total Documents: ${totalProducts}\n`);

    // Get first 5 products
    console.log('📋 Sample Products (First 5):\n');
    const sampleDocs = await collectionRef.limit(5).get();

    sampleDocs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Product ID: ${data.product_id}`);
      console.log(`   Title: ${data.title}`);
      console.log(`   Category: ${data.category} / ${data.sub_category}`);
      console.log(`   Brand: ${data.brand}`);
      console.log(`   SKUs: ${data.product_skus?.length || 0}`);
      console.log(`   Rating: ${data.rating?.average} (${data.rating?.count} reviews)`);
      console.log(`   Uploaded: ${data.uploaded_at?.toDate?.() || 'N/A'}\n`);
    });

    // Get categories
    console.log('\n📂 Categories Breakdown:\n');
    const allDocs = await collectionRef.get();
    const categories = {};
    const brands = {};

    allDocs.forEach((doc) => {
      const data = doc.data();
      const key = `${data.category}/${data.sub_category}`;
      categories[key] = (categories[key] || 0) + 1;
      brands[data.brand] = (brands[data.brand] || 0) + 1;
    });

    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} products`);
    });

    // Get top brands
    console.log('\n🏷️  Top Brands:\n');
    Object.entries(brands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} products`);
      });

    // Get product ID samples
    console.log('\n🆔 All Product IDs:\n');
    const productIds = allDocs.docs.map((doc) => doc.data().product_id);
    const sortedIds = productIds.sort();

    // Group by first letter for better readability
    const groupedIds = {};
    sortedIds.forEach((id) => {
      const letter = id.charAt(0).toUpperCase();
      if (!groupedIds[letter]) {
        groupedIds[letter] = [];
      }
      groupedIds[letter].push(id);
    });

    Object.entries(groupedIds).forEach(([letter, ids]) => {
      console.log(`${letter}: ${ids.join(', ')}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database inspection completed successfully!');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inspecting database:', error);
    process.exit(1);
  }
}

// Run inspector
inspectFirebaseDatabase();
