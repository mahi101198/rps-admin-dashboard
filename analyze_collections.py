import firebase_admin
from firebase_admin import credentials, firestore
import json

# Initialize Firebase
try:
    cred = credentials.Certificate('firebase-key.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized\n")
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Step 1: Fetch categories collection
print("="*70)
print("CHECKING 'categories' COLLECTION")
print("="*70)

categories_data = {}
try:
    docs = db.collection('categories').stream()
    for doc in docs:
        data = doc.to_dict()
        categories_data[doc.id] = data
        print(f"\nDoc ID: {doc.id}")
        print(f"Data: {json.dumps(data, indent=2)}")
    print(f"\nTotal categories documents: {len(categories_data)}")
except Exception as e:
    print(f"Error fetching categories: {e}")

# Step 2: Fetch subcategories collection
print("\n" + "="*70)
print("CHECKING 'subcategories' COLLECTION")
print("="*70)

subcategories_data = {}
try:
    docs = db.collection('subcategories').stream()
    for doc in docs:
        data = doc.to_dict()
        subcategories_data[doc.id] = data
        print(f"\nDoc ID: {doc.id}")
        print(f"Data: {json.dumps(data, indent=2)}")
    print(f"\nTotal subcategories documents: {len(subcategories_data)}")
except Exception as e:
    print(f"Error fetching subcategories: {e}")

# Step 3: Check products for category references
print("\n" + "="*70)
print("CHECKING PRODUCT_DETAILS COLLECTION")
print("="*70)

products_analysis = {
    'total': 0,
    'categories_used': {},
    'subcategories_used': {}
}

try:
    docs = db.collection('product_details').stream()
    for doc in docs:
        product = doc.to_dict()
        products_analysis['total'] += 1
        
        # Track category references
        cat = product.get('category')
        if cat:
            if cat not in products_analysis['categories_used']:
                products_analysis['categories_used'][cat] = 0
            products_analysis['categories_used'][cat] += 1
        
        # Track subcategory references
        subcat = product.get('sub_category')
        if subcat:
            if subcat not in products_analysis['subcategories_used']:
                products_analysis['subcategories_used'][subcat] = 0
            products_analysis['subcategories_used'][subcat] += 1
    
    print(f"\nTotal products: {products_analysis['total']}")
    print(f"\nCategories referenced in products:")
    for cat, count in sorted(products_analysis['categories_used'].items()):
        print(f"  {cat}: {count} products")
    
    print(f"\nSubcategories referenced in products:")
    for subcat, count in sorted(products_analysis['subcategories_used'].items()):
        print(f"  {subcat}: {count} products")
    
except Exception as e:
    print(f"Error analyzing products: {e}")

# Step 4: Analyze consistency
print("\n" + "="*70)
print("CONSISTENCY ANALYSIS")
print("="*70)

# Check if category names match
print("\nCategories mismatch analysis:")
product_cats = set(products_analysis['categories_used'].keys())
collection_cats = set(categories_data.keys())

print(f"Categories in products: {product_cats}")
print(f"Categories in collection: {collection_cats}")

missing_in_collection = product_cats - collection_cats
extra_in_collection = collection_cats - product_cats

if missing_in_collection:
    print(f"\nMissing in categories collection: {missing_in_collection}")
if extra_in_collection:
    print(f"\nExtra in categories collection: {extra_in_collection}")
if not missing_in_collection and not extra_in_collection:
    print(f"\n✓ Categories match perfectly!")

# Check if subcategory names/IDs match
print(f"\nSubcategories mismatch analysis:")
product_subcats = set(products_analysis['subcategories_used'].keys())
collection_subcats = set(subcategories_data.keys())

print(f"\nSubcategories in products (by name): {sorted(product_subcats)}")
print(f"\nSubcategories in collection (by doc ID): {sorted(collection_subcats)}")

# Also check the 'name' field in subcategories
subcats_names = set()
for doc_id, data in subcategories_data.items():
    if 'name' in data:
        subcats_names.add(data['name'])

print(f"\nSubcategories in collection (by 'name' field): {sorted(subcats_names)}")

missing_subcats = product_subcats - subcats_names
extra_subcats = subcats_names - product_subcats

if missing_subcats:
    print(f"\nSubcategories in products but NOT in collection: {missing_subcats}")
if extra_subcats:
    print(f"\nSubcategories in collection but NOT in products: {extra_subcats}")
if not missing_subcats and not extra_subcats:
    print(f"\n✓ Subcategories match perfectly!")

# Summary
print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(f"Categories collection: {len(categories_data)} docs")
print(f"Subcategories collection: {len(subcategories_data)} docs")
print(f"Products: {products_analysis['total']}")
