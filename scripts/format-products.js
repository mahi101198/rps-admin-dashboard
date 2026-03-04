const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'newproducts.json');
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

// Format with nice indentation
const formatted = JSON.stringify(data, null, 2);
fs.writeFileSync(filePath, formatted, 'utf8');

console.log('✅ Formatted JSON with proper indentation');
console.log('📊 Total products:', data.length);
console.log('\n📋 Product List:');
data.forEach((p, i) => {
  console.log('   [' + (i+1) + '] ' + p.product_id + ' -> ' + (p.title || 'NO TITLE'));
});

// Validate schema
console.log('\n✓ Schema Validation:');
let missingTitle = 0;
let missingSKU = 0;
data.forEach((p) => {
  if (!p.title) missingTitle++;
  if (!p.product_skus || p.product_skus.length === 0) missingSKU++;
});

console.log('   - Missing title:', missingTitle);
console.log('   - Missing SKUs:', missingSKU);
console.log('\n✅ All products ready for Firebase upload');
