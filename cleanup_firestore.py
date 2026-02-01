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

# Find and delete orphan items
print("Cleaning orphan products from Firestore...\n")

docs = db.collection('product_details').stream()
deleted_count = 0

for doc in docs:
    product = doc.to_dict()
    category = product.get('category', 'Unknown')
    subcategory = product.get('sub_category', 'Unknown')
    
    # Delete items that don't fit the new structure
    if category == 'Books' or (category not in ['Housekeeping', 'Stationery']):
        print(f"Deleting: {product.get('title', 'Unknown')} ({category})")
        db.collection('product_details').document(doc.id).delete()
        deleted_count += 1

print(f"\nDeleted {deleted_count} orphan products")

# Verify final count
print("\nFinal Firestore verification:\n")
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

print(f"\nCleanup complete! Firestore is now clean.")
