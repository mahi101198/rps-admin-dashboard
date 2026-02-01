import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# Initialize Firebase Admin
try:
    cred = credentials.Certificate('firebase-key.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✓ Firebase initialized successfully")
except Exception as e:
    print(f"✗ Firebase initialization failed: {e}")
    exit(1)

# Fetch all products from Firestore
print("\nFetching products from Firestore...")
try:
    products_ref = db.collection('product_details')
    docs = products_ref.stream()
    
    all_products = []
    for doc in docs:
        product = doc.to_dict()
        product['id'] = doc.id  # Add document ID
        all_products.append(product)
    
    print(f"✓ Fetched {len(all_products)} products from Firestore")
except Exception as e:
    print(f"✗ Error fetching products: {e}")
    exit(1)

# Check current category structure
print("\nCurrent categories in Firestore:")
cats = {}
for product in all_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if cat not in cats:
        cats[cat] = {}
    if subcat not in cats[cat]:
        cats[cat][subcat] = 0
    cats[cat][subcat] += 1

for cat in sorted(cats.keys()):
    print(f"\n{cat}:")
    for subcat in sorted(cats[cat].keys()):
        print(f"  - {subcat}: {cats[cat][subcat]}")

# Apply new consolidation mapping
print("\n" + "="*50)
print("Applying new consolidation mapping...")
print("="*50)

consolidation_map = {
    'Stationery': {
        'Writing Instruments': ['Writing Instruments'],
        'Paper': ['Paper Sheets', 'Paper'],
        'Notebooks & Folders': ['Notebooks', 'Files & Folders'],
        'Calculators, Geometry & Drawing': ['Calculators', 'Geometry Sets', 'Art Supplies'],
        'Gifts & Specialty': ['Gift Sets', 'Books'],
        'Adhesives & Tapes': ['Adhesives', 'Correction Supplies'],
        'Office Equipment & Supplies': ['Office Equipment', 'Office Supplies']  # Add office items
    },
    'Housekeeping': {
        'Power & Batteries': ['Batteries & Power'],
        'Air Freshening': ['Air Freshening'],
        'Cleaning': ['Cleaning Essentials']
    }
}

consolidated_products = []
unmatched = []

for product in all_products:
    old_subcat = product.get('sub_category', '')
    mapped = False
    
    for new_category, subcats_dict in consolidation_map.items():
        for new_subcat, old_subcats_list in subcats_dict.items():
            if old_subcat in old_subcats_list:
                product['category'] = new_category
                product['sub_category'] = new_subcat
                consolidated_products.append(product)
                mapped = True
                break
        if mapped:
            break
    
    if not mapped and old_subcat:
        unmatched.append(product.get('name', 'Unknown'))
        # Keep original if no mapping found
        consolidated_products.append(product)

print(f"\n✓ Consolidated {len(consolidated_products)} products")
if unmatched:
    print(f"⚠ {len(unmatched)} products with unmapped subcategories kept as-is")

# Show new distribution
print("\n" + "="*50)
print("NEW CATEGORY STRUCTURE")
print("="*50)

new_cats = {}
for product in consolidated_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if cat not in new_cats:
        new_cats[cat] = {}
    if subcat not in new_cats[cat]:
        new_cats[cat][subcat] = 0
    new_cats[cat][subcat] += 1

for cat in sorted(new_cats.keys()):
    total = 0
    print(f"\n{cat}:")
    for subcat in sorted(new_cats[cat].keys()):
        count = new_cats[cat][subcat]
        print(f"  {subcat}: {count}")
        total += count
    print(f"  TOTAL: {total}")

# Split into 5 files
print("\n" + "="*50)
print("Saving to firebase-products-part*.json")
print("="*50)

products_per_file = len(consolidated_products) // 5
remainder = len(consolidated_products) % 5

start_idx = 0
for i in range(1, 6):
    count = products_per_file + (1 if i <= remainder else 0)
    end_idx = start_idx + count
    
    part_products = consolidated_products[start_idx:end_idx]
    file_path = f'firebase-products-part{i}.json'
    
    # Convert Firestore objects to JSON-serializable format
    clean_products = []
    for prod in part_products:
        clean_prod = {}
        for key, value in prod.items():
            # Handle Firestore timestamps
            if hasattr(value, 'isoformat'):
                clean_prod[key] = value.isoformat()
            else:
                clean_prod[key] = value
        clean_products.append(clean_prod)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(clean_products, f, indent=2, ensure_ascii=False)
    
    print(f"✓ firebase-products-part{i}.json: {count} products")
    start_idx = end_idx

print(f"\n✓ ALL DONE! Updated {len(consolidated_products)} products across 5 files")
print(f"\nNext step: Review the new structure and upload to Firestore when ready")
