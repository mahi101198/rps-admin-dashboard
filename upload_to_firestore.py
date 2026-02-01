import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime

# Initialize Firebase Admin
try:
    cred = credentials.Certificate('firebase-key.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully\n")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    exit(1)

# Load all products from JSON files
all_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
            all_products.extend(products)
            print(f"Loaded {len(products)} products from {file_path}")
    except Exception as e:
        print(f"Error loading {file_path}: {e}")

print(f"\nTotal products to upload: {len(all_products)}\n")

# Upload products using batch writes
print("Uploading products to Firestore...\n")
batch = db.batch()
batch_count = 0
total_updated = 0

for product in all_products:
    product_id = product.get('id', product.get('product_id', ''))
    
    if not product_id:
        print(f"Warning: Skipping product without ID")
        continue
    
    # Prepare product data
    product_data = product.copy()
    
    # Handle timestamp fields
    if 'created_at' in product_data and product_data['created_at'] == '__SERVER_TIMESTAMP__':
        product_data['created_at'] = firestore.SERVER_TIMESTAMP
    
    if 'updated_at' in product_data and product_data['updated_at'] == '__SERVER_TIMESTAMP__':
        product_data['updated_at'] = firestore.SERVER_TIMESTAMP
    
    # Add last_sync timestamp
    product_data['last_sync'] = datetime.now().isoformat()
    
    # Add to batch
    doc_ref = db.collection('product_details').document(product_id)
    batch.set(doc_ref, product_data, merge=True)
    
    batch_count += 1
    total_updated += 1
    
    # Commit batch every 100 writes (Firestore limit)
    if batch_count >= 100:
        batch.commit()
        print(f"  Committed batch of 100 products (Total: {total_updated})")
        batch = db.batch()
        batch_count = 0

# Commit remaining products
if batch_count > 0:
    batch.commit()
    print(f"  Committed final batch of {batch_count} products (Total: {total_updated})")

print(f"\n{'='*60}")
print(f"SUCCESS! Updated {total_updated} products in Firestore")
print(f"{'='*60}")

# Verify by fetching and displaying summary
print("\nVerifying uploaded data...\n")
try:
    docs = db.collection('product_details').stream()
    
    cats = {}
    count = 0
    for doc in docs:
        count += 1
        product = doc.to_dict()
        cat = product.get('category', 'Unknown')
        subcat = product.get('sub_category', 'Unknown')
        
        if cat not in cats:
            cats[cat] = {}
        if subcat not in cats[cat]:
            cats[cat][subcat] = 0
        cats[cat][subcat] += 1
    
    print(f"Total products in Firestore: {count}\n")
    
    for category in sorted(cats.keys()):
        cat_total = sum(cats[category].values())
        print(f"{category} ({cat_total} products):")
        for subcat in sorted(cats[category].keys()):
            print(f"  - {subcat}: {cats[category][subcat]}")
    
except Exception as e:
    print(f"Error verifying data: {e}")

print(f"\nFirestore update complete!")
