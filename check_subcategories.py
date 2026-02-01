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

# Step 1: Fetch all subcategories from the sub_categories collection
print("="*70)
print("CHECKING SUB_CATEGORIES COLLECTION")
print("="*70)

valid_categories = {}
docs = db.collection('sub_categories').stream()

for doc in docs:
    subcat_data = doc.to_dict()
    cat_name = subcat_data.get('category', 'Unknown')
    subcat_name = subcat_data.get('name', doc.id)
    
    if cat_name not in valid_categories:
        valid_categories[cat_name] = []
    
    valid_categories[cat_name].append(subcat_name)
    print(f"\n{cat_name} > {subcat_name}")
    print(f"  ID: {doc.id}")

print(f"\n{'='*70}")
print(f"Total Categories in sub_categories: {len(valid_categories)}")
for cat in valid_categories:
    print(f"  {cat}: {len(valid_categories[cat])} subcategories")

# Step 2: Check all products in product_details
print(f"\n{'='*70}")
print("CHECKING PRODUCT_DETAILS COLLECTION")
print("="*70)

products_docs = db.collection('product_details').stream()
invalid_products = []
total_products = 0

for doc in products_docs:
    total_products += 1
    product = doc.to_dict()
    product_id = doc.id
    product_name = product.get('title', 'Unknown')
    product_cat = product.get('category', 'Unknown')
    product_subcat = product.get('sub_category', 'Unknown')
    
    # Check if category exists
    if product_cat not in valid_categories:
        invalid_products.append({
            'id': product_id,
            'name': product_name,
            'category': product_cat,
            'sub_category': product_subcat,
            'issue': f'Invalid category: {product_cat}'
        })
    # Check if subcategory exists under category
    elif product_subcat not in valid_categories[product_cat]:
        invalid_products.append({
            'id': product_id,
            'name': product_name,
            'category': product_cat,
            'sub_category': product_subcat,
            'issue': f'Invalid subcategory: {product_subcat} under {product_cat}'
        })

print(f"\nTotal products: {total_products}")
print(f"Valid products: {total_products - len(invalid_products)}")
print(f"Invalid products: {len(invalid_products)}")

if invalid_products:
    print(f"\n{'='*70}")
    print("INVALID PRODUCTS FOUND:")
    print("="*70)
    for prod in invalid_products:
        print(f"\n{prod['name']} (ID: {prod['id']})")
        print(f"  Current: {prod['category']} > {prod['sub_category']}")
        print(f"  Issue: {prod['issue']}")
else:
    print(f"\n{'='*70}")
    print("ALL PRODUCTS ARE VALID!")
    print("="*70)

print(f"\nValid category structure in sub_categories collection:")
for cat in sorted(valid_categories.keys()):
    print(f"\n{cat}:")
    for subcat in sorted(valid_categories[cat]):
        print(f"  - {subcat}")
