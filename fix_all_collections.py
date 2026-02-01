import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
try:
    cred = credentials.Certificate('firebase-key.json')
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized\n")
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Step 1: Fix categories collection - update to match product references
print("="*70)
print("STEP 1: FIXING CATEGORIES COLLECTION")
print("="*70)

# Delete old lowercase documents
print("\nDeleting old category documents...")
db.collection('categories').document('housekeeping').delete()
db.collection('categories').document('stationery').delete()
print("✓ Deleted housekeeping and stationery")

# Create new ones with correct case
categories_to_create = {
    'Housekeeping': {
        'name': 'Housekeeping',
        'id': 'housekeeping',
        'rank': 2,
        'isActive': True,
        'image': 'https://firebasestorage.googleapis.com/v0/b/rps-statationary-jaipur.firebasestorage.app/o/category%2Fhousekeeping.webp?alt=media&token=906be86f-df11-431d-9665-c50fa197bf2b'
    },
    'Stationery': {
        'name': 'Stationery',
        'id': 'stationery',
        'rank': 1,
        'isActive': True,
        'image': 'https://firebasestorage.googleapis.com/v0/b/rps-statationary-jaipur.firebasestorage.app/o/category%2Fstationery.webp?alt=media&token=ffcbe469-01a7-43a2-bedf-08681aef5bbc'
    }
}

print("\nCreating new category documents...")
for cat_name, cat_data in categories_to_create.items():
    doc_id = cat_data['id']  # Use lowercase as doc ID
    db.collection('categories').document(doc_id).set(cat_data)
    print(f"✓ Created: {cat_name} (doc ID: {doc_id})")

# Step 2: Create all required subcategories
print("\n" + "="*70)
print("STEP 2: CREATING COMPLETE SUBCATEGORIES COLLECTION")
print("="*70)

# Delete old subcategories
print("\nCleaning old subcategories...")
docs = db.collection('subcategories').stream()
for doc in docs:
    db.collection('subcategories').document(doc.id).delete()
    print(f"✓ Deleted old: {doc.id}")

# Define complete structure matching products
subcategories_to_create = {
    'Housekeeping': [
        {'name': 'Cleaning', 'rank': 1},
        {'name': 'Power & Batteries', 'rank': 2}
    ],
    'Stationery': [
        {'name': 'Writing Instruments', 'rank': 1},
        {'name': 'Notebooks & Folders', 'rank': 2},
        {'name': 'Adhesives & Tapes', 'rank': 3},
        {'name': 'Paper', 'rank': 4},
        {'name': 'Office Equipment & Supplies', 'rank': 5},
        {'name': 'Geometry & Scales', 'rank': 6},
        {'name': 'Art & Drawing', 'rank': 7},
        {'name': 'Gifts & Specialty', 'rank': 8},
        {'name': 'Calculators', 'rank': 9}
    ]
}

print("\nCreating new subcategories...")
created = 0
for category, subcats in subcategories_to_create.items():
    for subcat_info in subcats:
        subcat_name = subcat_info['name']
        doc_id = subcat_name.lower().replace(' ', '-').replace('&', 'and')
        
        subcat_data = {
            'name': subcat_name,
            'category': category,
            'id': doc_id,
            'rank': subcat_info['rank'],
            'isActive': True
        }
        
        db.collection('subcategories').document(doc_id).set(subcat_data)
        print(f"✓ Created: {category} > {subcat_name} (doc ID: {doc_id})")
        created += 1

print(f"\n✓ Total subcategories created: {created}")

# Step 3: Verify all products are consistent
print("\n" + "="*70)
print("STEP 3: VERIFYING PRODUCTS")
print("="*70)

docs = db.collection('product_details').stream()
product_cats = {}
product_subcats = {}
total = 0

for doc in docs:
    total += 1
    product = doc.to_dict()
    cat = product.get('category')
    subcat = product.get('sub_category')
    
    if cat not in product_cats:
        product_cats[cat] = 0
    product_cats[cat] += 1
    
    if subcat not in product_subcats:
        product_subcats[subcat] = 0
    product_subcats[subcat] += 1

print(f"\nTotal products: {total}")
print(f"\nProducts by category:")
for cat in sorted(product_cats.keys()):
    print(f"  {cat}: {product_cats[cat]}")

print(f"\nProducts by subcategory:")
for subcat in sorted(product_subcats.keys()):
    print(f"  {subcat}: {product_subcats[subcat]}")

# Step 4: Final summary
print("\n" + "="*70)
print("FINAL SUMMARY")
print("="*70)

categories = db.collection('categories').stream()
cat_count = sum(1 for _ in categories)

subcategories = db.collection('subcategories').stream()
subcat_count = sum(1 for _ in subcategories)

print(f"\nCategories collection: {cat_count} documents")
print(f"Subcategories collection: {subcat_count} documents")
print(f"Products: {total}")
print(f"\n✓ All collections are now consistent and ready!")
