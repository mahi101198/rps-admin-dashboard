import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import json
from difflib import SequenceMatcher

# Initialize Firebase
try:
    cred = credentials.Certificate('firebase-key.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized\n")
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Read CSV pricing data
print("="*70)
print("STEP 1: READING CSV PRICING DATA")
print("="*70)

try:
    csv_data = pd.read_csv('products_pricing.csv', on_bad_lines='skip')
    print(f"\nCSV loaded: {len(csv_data)} rows")
    print(f"Columns: {csv_data.columns.tolist()}\n")
except Exception as e:
    print(f"Error reading CSV: {e}")
    exit(1)

# Fetch all products from Firestore
print("="*70)
print("STEP 2: FETCHING PRODUCTS FROM FIRESTORE")
print("="*70)

all_products = []
docs = db.collection('product_details').stream()
for doc in docs:
    product = doc.to_dict()
    product['_doc_id'] = doc.id
    all_products.append(product)

print(f"Total products: {len(all_products)}\n")

# Create matching function using similarity
def similarity(a, b):
    """Calculate similarity ratio between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_match(csv_name, products, threshold=0.6):
    """Find best matching product by name similarity"""
    best_match = None
    best_score = threshold
    
    for product in products:
        product_name = product.get('title', '')
        score = similarity(csv_name, product_name)
        
        if score > best_score:
            best_score = score
            best_match = product
    
    return best_match, best_score

# Match and prepare updates
print("="*70)
print("STEP 3: MATCHING PRODUCTS AND PREPARING UPDATES")
print("="*70)

updates = []
unmatched_count = 0

for idx, row in csv_data.iterrows():
    csv_name = str(row.get('Item', '')).strip()
    
    if not csv_name or csv_name.lower() == 'nan':
        continue
    
    # Get pricing info
    try:
        mrp = float(row.get('MRP_pack', 0)) if pd.notna(row.get('MRP_pack')) else 0
        selling = float(row.get('Selling_price', 0)) if pd.notna(row.get('Selling_price')) else 0
    except:
        continue
    
    if mrp == 0 or selling == 0:
        continue
    
    # Find matching product
    match, score = find_best_match(csv_name, all_products)
    
    if match and score > 0.6:
        updates.append({
            'csv_name': csv_name,
            'db_name': match.get('title', ''),
            'doc_id': match.get('_doc_id'),
            'mrp': int(mrp),
            'selling': int(selling),
            'match_score': score,
            'product': match
        })
        print(f"✓ Matched: {csv_name} -> {match.get('title')} (Score: {score:.2f})")
    else:
        unmatched_count += 1
        if unmatched_count <= 10:
            print(f"✗ No match: {csv_name}")

print(f"\n{'='*70}")
print(f"Total matches found: {len(updates)}")
print(f"Unmatched: {unmatched_count}")
print(f"{'='*70}")

# Show preview
print(f"\nPreview of updates (first 10):\n")
for i, update in enumerate(updates[:10], 1):
    print(f"{i}. {update['db_name']}")
    if 'product_skus' in update['product'] and update['product']['product_skus']:
        old_price = update['product']['product_skus'][0].get('price', 0)
        old_mrp = update['product']['product_skus'][0].get('mrp', 0)
    else:
        old_price = 'N/A'
        old_mrp = 'N/A'
    
    print(f"   Price: {old_price} -> {update['selling']}")
    print(f"   MRP: {old_mrp} -> {update['mrp']}\n")

if len(updates) > 10:
    print(f"... and {len(updates) - 10} more products")

# Update JSON files
print(f"\n{'='*70}")
print("STEP 4: UPDATING JSON FILES WITH NEW PRICES")
print("="*70)

# Load all products from JSON files
json_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
            json_products.extend(products)
    except:
        pass

# Apply updates to JSON products
updated_in_json = 0
for update in updates:
    doc_id = update['doc_id']
    
    # Find in JSON
    for json_product in json_products:
        if json_product.get('id') == doc_id or json_product.get('product_id') == doc_id:
            # Update SKU prices
            if 'product_skus' in json_product and len(json_product['product_skus']) > 0:
                json_product['product_skus'][0]['price'] = update['selling']
                json_product['product_skus'][0]['mrp'] = update['mrp']
                updated_in_json += 1
                print(f"✓ Updated in JSON: {update['db_name']}")
            break

# Save updated JSON back to files
print(f"\n{'='*70}")
print("STEP 5: SAVING UPDATED JSON FILES")
print("="*70)

products_per_file = len(json_products) // 5
remainder = len(json_products) % 5

start_idx = 0
for i in range(1, 6):
    count = products_per_file + (1 if i <= remainder else 0)
    end_idx = start_idx + count
    
    part_products = json_products[start_idx:end_idx]
    file_path = f'firebase-products-part{i}.json'
    
    # Clean timestamps for JSON serialization
    clean_products = []
    for prod in part_products:
        clean_prod = {}
        for key, value in prod.items():
            if hasattr(value, 'isoformat'):
                clean_prod[key] = value.isoformat()
            else:
                clean_prod[key] = value
        clean_products.append(clean_prod)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(clean_products, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved firebase-products-part{i}.json ({count} products)")
    start_idx = end_idx

print(f"\n{'='*70}")
print(f"✅ STEP 4 & 5 COMPLETE!")
print(f"Updated {updated_in_json} products in JSON files")
print(f"{'='*70}")

print(f"\n{'='*70}")
print("STEP 6: UPLOADING UPDATED JSON TO FIRESTORE")
print("="*70)

# Upload all products to Firestore
uploaded = 0
batch = db.batch()
batch_count = 0

for product in json_products:
    product_id = product.get('id', product.get('product_id', ''))
    
    if not product_id:
        continue
    
    # Clean timestamps
    clean_product = {}
    for key, value in product.items():
        if hasattr(value, 'isoformat'):
            clean_product[key] = value.isoformat()
        else:
            clean_product[key] = value
    
    doc_ref = db.collection('product_details').document(product_id)
    batch.set(doc_ref, clean_product, merge=True)
    
    batch_count += 1
    uploaded += 1
    
    # Commit every 100 writes
    if batch_count >= 100:
        batch.commit()
        print(f"  Committed batch of 100 products (Total: {uploaded})")
        batch = db.batch()
        batch_count = 0

# Commit remaining
if batch_count > 0:
    batch.commit()
    print(f"  Committed final batch of {batch_count} products")

print(f"\n{'='*70}")
print(f"✅ UPLOAD COMPLETE!")
print(f"Updated {uploaded} products in Firestore")
print(f"{'='*70}")

print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")
print(f"✓ CSV products processed: {len(csv_data)}")
print(f"✓ Products matched: {len(updates)}")
print(f"✓ JSON files updated: {updated_in_json}")
print(f"✓ Firestore updated: {uploaded}")
