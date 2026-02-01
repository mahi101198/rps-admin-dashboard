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

# Define the final category structure
categories_structure = {
    'Housekeeping': [
        'Cleaning',
        'Power & Batteries'
    ],
    'Stationery': [
        'Writing Instruments',
        'Notebooks & Folders',
        'Adhesives & Tapes',
        'Paper',
        'Office Equipment & Supplies',
        'Geometry & Scales',
        'Art & Drawing',
        'Gifts & Specialty',
        'Calculators'
    ]
}

print("Creating sub_categories collection...\n")

# Delete existing sub_categories if any
print("Clearing existing sub_categories...")
docs = db.collection('sub_categories').stream()
for doc in docs:
    db.collection('sub_categories').document(doc.id).delete()

# Create new subcategories
created_count = 0
for category, subcategories in categories_structure.items():
    for subcat in subcategories:
        doc_id = subcat.lower().replace(' ', '-').replace('&', 'and')
        
        subcat_data = {
            'category': category,
            'name': subcat,
            'display_name': subcat,
            'is_active': True
        }
        
        db.collection('sub_categories').document(doc_id).set(subcat_data)
        print(f"✓ Created: {category} > {subcat}")
        created_count += 1

print(f"\n{'='*70}")
print(f"Successfully created {created_count} subcategories")
print("="*70)

# Verify the structure
print("\nVerifying sub_categories collection:\n")

docs = db.collection('sub_categories').stream()
verified_cats = {}

for doc in docs:
    data = doc.to_dict()
    cat = data.get('category')
    subcat = data.get('name')
    
    if cat not in verified_cats:
        verified_cats[cat] = []
    verified_cats[cat].append(subcat)

for cat in sorted(verified_cats.keys()):
    print(f"{cat}:")
    for subcat in sorted(verified_cats[cat]):
        print(f"  - {subcat}")

print(f"\nSub_categories collection is now ready!")
