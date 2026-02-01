import json
import os

# Load all 5 parts
all_products = []
for i in range(1, 6):
    with open(f'firebase-products-part{i}.json', 'r') as f:
        products = json.load(f)
        all_products.extend(products)

# Extract unique categories and subcategories
categories = {}
for product in all_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if cat not in categories:
        categories[cat] = set()
    categories[cat].add(subcat)

# Print summary
print(f"Total Products: {len(all_products)}\n")
for cat in sorted(categories.keys()):
    subcats = sorted(categories[cat])
    print(f"\n{cat}:")
    for subcat in subcats:
        count = sum(1 for p in all_products if p.get('category') == cat and p.get('sub_category') == subcat)
        print(f"  - {subcat}: {count} products")

# Now create mapping to consolidate to 2 main categories
print("\n\n=== CONSOLIDATION PLAN ===\n")
consolidation_map = {
    # STATIONERY - Paper, writing, office supplies
    'Stationery': {
        'Paper & Office': ['Paper Sheets', 'Notebooks', 'Art Supplies', 'Files & Folders', 'Correction Supplies'],
        'Writing & Drawing': ['Writing Instruments', 'Calculators', 'Geometry Sets'],
        'Office Essentials': ['Office Supplies', 'Office Equipment', 'Adhesives'],
        'Gifts & Specialty': ['Gift Sets']
    },
    # HOUSEKEEPING - Cleaning, batteries, maintenance
    'Housekeeping': {
        'Cleaning': ['Cleaning Essentials'],
        'Power & Batteries': ['Batteries & Power']
    }
}

print("STATIONERY:")
print("  - Paper & Office")
print("  - Writing & Drawing")
print("  - Office Essentials")
print("  - Gifts & Specialty")
print("\nHOUSEKEEPING:")
print("  - Cleaning")
print("  - Power & Batteries")

# Show which products map where
print("\n\n=== PRODUCT MAPPING ===\n")
for product in sorted(all_products, key=lambda x: (x['category'], x['sub_category'])):
    print(f"{product['title'][:40]:40} | {product['category']:20} | {product['sub_category']}")
