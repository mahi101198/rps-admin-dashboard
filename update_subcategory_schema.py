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

# Step 1: Fetch and analyze categories
print("="*70)
print("STEP 1: ANALYZING CURRENT COLLECTIONS")
print("="*70)

categories = {}
docs = db.collection('categories').stream()
for doc in docs:
    data = doc.to_dict()
    cat_id = data.get('id', doc.id)
    cat_name = data.get('name', 'Unknown')
    categories[cat_id] = {'name': cat_name, 'doc_id': doc.id}
    print(f"\nCategory found:")
    print(f"  Doc ID: {doc.id}")
    print(f"  Name: {cat_name}")
    print(f"  ID field: {cat_id}")

print(f"\n{'='*70}")
print("STEP 2: CHECKING CURRENT SUBCATEGORIES")
print("="*70)

subcategories = {}
docs = db.collection('subcategories').stream()
for doc in docs:
    data = doc.to_dict()
    print(f"\nSubcategory document {doc.id}:")
    print(f"  Name: {data.get('name', 'MISSING')}")
    print(f"  Category: {data.get('category', 'MISSING')}")
    print(f"  CategoryId: {data.get('categoryId', 'MISSING - REQUIRED!')}")
    print(f"  Rank: {data.get('rank', 'MISSING')}")
    print(f"  IsActive: {data.get('isActive', 'MISSING')}")
    print(f"  Image: {data.get('image', 'None')}")
    
    subcategories[doc.id] = data

print(f"\n{'='*70}")
print("ANALYSIS")
print("="*70)

print(f"\nAvailable categories (ID -> Name):")
for cat_id, cat_data in categories.items():
    print(f"  {cat_id} -> {cat_data['name']}")

print(f"\nISSUES FOUND:")
missing_categoryId = 0
for doc_id, subcat_data in subcategories.items():
    if 'categoryId' not in subcat_data or not subcat_data.get('categoryId'):
        print(f"  ❌ {doc_id} ({subcat_data.get('name')}): Missing categoryId")
        missing_categoryId += 1

if missing_categoryId > 0:
    print(f"\nTotal subcategories missing categoryId: {missing_categoryId}")

print(f"\n{'='*70}")
print("STEP 3: MAPPING SUBCATEGORIES TO CATEGORIES")
print("="*70)

mapping = {
    'Cleaning': 'housekeeping',
    'Power & Batteries': 'housekeeping',
    'Writing Instruments': 'stationery',
    'Notebooks & Folders': 'stationery',
    'Adhesives & Tapes': 'stationery',
    'Paper': 'stationery',
    'Office Equipment & Supplies': 'stationery',
    'Geometry & Scales': 'stationery',
    'Art & Drawing': 'stationery',
    'Gifts & Specialty': 'stationery',
    'Calculators': 'stationery'
}

print("\nUpdating subcategories with correct categoryId...\n")

for doc_id, subcat_data in subcategories.items():
    subcat_name = subcat_data.get('name', '')
    current_categoryId = subcat_data.get('categoryId', 'NONE')
    
    if subcat_name in mapping:
        target_categoryId = mapping[subcat_name]
        
        if current_categoryId != target_categoryId:
            # Update the subcategory with correct categoryId
            db.collection('subcategories').document(doc_id).update({
                'categoryId': target_categoryId
            })
            print(f"✓ Updated {subcat_name}")
            print(f"  Old categoryId: {current_categoryId}")
            print(f"  New categoryId: {target_categoryId}\n")
        else:
            print(f"✓ {subcat_name} already correct\n")
    else:
        print(f"⚠ {subcat_name} not in mapping, skipped\n")

print(f"{'='*70}")
print("VERIFICATION")
print("="*70)

docs = db.collection('subcategories').stream()
all_valid = True
for doc in docs:
    data = doc.to_dict()
    subcat_name = data.get('name', 'Unknown')
    cat_id = data.get('categoryId', 'MISSING')
    
    if not cat_id or cat_id == 'MISSING':
        print(f"❌ {subcat_name}: categoryId is {cat_id}")
        all_valid = False
    else:
        print(f"✓ {subcat_name}: categoryId = {cat_id}")

if all_valid:
    print(f"\n✅ All subcategories now have valid categoryId!")
else:
    print(f"\n⚠ Some subcategories still missing categoryId")
