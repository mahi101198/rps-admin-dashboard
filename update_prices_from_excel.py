import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import re

# Initialize Firebase
try:
    cred = credentials.Certificate('firebase-key.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized\n")
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Read CSV file with pricing data
print("="*70)
print("READING PRICING DATA")
print("="*70)

try:
    # Read the CSV file
    csv_file = 'products_pricing.csv'
    xls = pd.read_csv(csv_file)
    
    print(f"\nPricing data loaded: {len(xls)} products found")
    print("\nColumns:", xls.columns.tolist())
    print("\nFirst few rows:")
    print(xls[['Item', 'make', 'MRP/pack', 'Selling price']].head(10))
    
except Exception as e:
    print(f"Error reading CSV: {e}")
    exit(1)

# Fetch all products from Firestore
print("\n" + "="*70)
print("FETCHING PRODUCTS FROM FIRESTORE")
print("="*70)

products_db = {}
docs = db.collection('product_details').stream()
for doc in docs:
    data = doc.to_dict()
    title = data.get('title', 'Unknown')
    products_db[doc.id] = {
        'title': title,
        'doc': doc,
        'data': data
    }

print(f"\nTotal products in Firestore: {len(products_db)}")

# Create mapping function
def normalize_name(name):
    """Normalize product names for matching"""
    if not name:
        return ""
    return name.upper().strip().replace('-', ' ').replace('_', ' ')

# Match and prepare updates
print("\n" + "="*70)
print("MATCHING PRODUCTS AND PREPARING UPDATES")
print("="*70)

updates_to_make = []
matched_count = 0
unmatched_excel = []

for idx, row in xls.iterrows():
    excel_name = row.get('Item', '')
    
    if pd.isna(excel_name) or not excel_name:
        continue
    
    excel_normalized = normalize_name(excel_name)
    
    # Try to find matching product
    found = False
    for product_id, product_info in products_db.items():
        db_normalized = normalize_name(product_info['title'])
        
        # Check if names match (exact or partial)
        if excel_normalized == db_normalized or db_normalized in excel_normalized or excel_normalized in db_normalized:
            
            # Extract price data from Excel row
            mrp = row.get('MRP/pack', row.get('MRP', 0))
            selling = row.get('Selling price', row.get('Selling', 0))
            discount = row.get('Discount %', row.get('Discount', '0%'))
            
            # Clean discount percentage
            if isinstance(discount, str):
                discount = float(discount.rstrip('%')) if '%' in discount else float(discount)
            else:
                discount = float(discount)
            
            # Update product SKU with new prices
            if 'product_skus' in product_info['data'] and len(product_info['data']['product_skus']) > 0:
                sku = product_info['data']['product_skus'][0]
                
                updates_to_make.append({
                    'product_id': product_id,
                    'title': product_info['title'],
                    'excel_name': excel_name,
                    'current_price': sku.get('price', 0),
                    'new_price': selling,
                    'current_mrp': sku.get('mrp', 0),
                    'new_mrp': mrp,
                    'discount': discount
                })
                
                matched_count += 1
                found = True
                break
    
    if not found:
        unmatched_excel.append(excel_name)

print(f"\nMatched: {matched_count} products")
print(f"Unmatched from Excel: {len(unmatched_excel)} products")

if unmatched_excel:
    print(f"\nUnmatched items from Excel:")
    for item in unmatched_excel[:10]:
        print(f"  - {item}")

# Show preview of updates
print(f"\n{'='*70}")
print("PREVIEW OF UPDATES")
print(f"{'='*70}")

for i, update in enumerate(updates_to_make[:10], 1):
    print(f"\n{i}. {update['title']}")
    print(f"   Price: {update['current_price']} → {update['new_price']}")
    print(f"   MRP: {update['current_mrp']} → {update['new_mrp']}")
    print(f"   Discount: {update['discount']}%")

if len(updates_to_make) > 10:
    print(f"\n... and {len(updates_to_make) - 10} more products")

# Apply updates directly
print(f"\n{'='*70}")
print(f"Total updates to apply: {len(updates_to_make)}")
print(f"{'='*70}")

if True:  # Auto-apply
    print(f"\nApplying updates...\n")
    
    updated_count = 0
    for update in updates_to_make:
        product_id = update['product_id']
        product_data = products_db[product_id]['data']
        
        # Update the first SKU with new prices
        if 'product_skus' in product_data and len(product_data['product_skus']) > 0:
            product_data['product_skus'][0]['price'] = int(update['new_price'])
            product_data['product_skus'][0]['mrp'] = int(update['new_mrp'])
            
            # Update in Firestore
            db.collection('product_details').document(product_id).update({
                'product_skus': product_data['product_skus']
            })
            
            updated_count += 1
            print(f"✓ Updated: {update['title']}")
    
    print(f"\n{'='*70}")
    print(f"✅ Successfully updated {updated_count} products!")
    print(f"{'='*70}")
else:
    print("\nUpdate cancelled.")
