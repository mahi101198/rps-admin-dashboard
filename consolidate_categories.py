import json

# Load all 5 parts
all_products = []
for i in range(1, 6):
    with open(f'firebase-products-part{i}.json', 'r') as f:
        products = json.load(f)
        all_products.extend(products)

# Define consolidation mapping
consolidation_map = {
    # STATIONERY products
    'Stationery': {
        'Paper & Office': [
            'Paper Sheets',      # A3/A4 sheets, kraft paper
            'Notebooks',         # Copy books, registers, letter pads
            'Files & Folders',   # File folders, display files
            'Office Equipment',  # Staplers, punching machines
            'Office Supplies'    # Push pins
        ],
        'Writing & Drawing': [
            'Writing Instruments',  # Pens, pencils, markers
            'Calculators',         # Calculators
            'Geometry Sets',       # Scales, geometry boxes
            'Art Supplies'         # Paint brushes, poster colors
        ],
        'Adhesives & Tapes': [
            'Adhesives',       # Glue, tape, sticker pads
            'Correction Supplies'  # Correction pens/tape
        ],
        'Gifts & Specialty': [
            'Gift Sets'        # Stationery gift sets
        ]
    },
    # HOUSEKEEPING products
    'Housekeeping': {
        'Cleaning': [
            'Cleaning Essentials'  # Cleaning cloths, dusters
        ],
        'Power & Batteries': [
            'Batteries & Power'    # AA, AAA batteries
        ]
    }
}

# Handle special cases (Books and empty category go to Stationery)
special_mapping = {
    'Books': ('Stationery', 'Gifts & Specialty'),
    'Office Supplies': lambda old_cat, old_subcat: {
        'Calculators': ('Stationery', 'Writing & Drawing'),
        'Files & Folders': ('Stationery', 'Paper & Office'),
        'Notebooks': ('Stationery', 'Paper & Office')
    }.get(old_subcat, ('Stationery', 'Paper & Office')),
    'Electronics': ('Housekeeping', 'Power & Batteries'),
}

# Consolidate products
consolidated = []
for product in all_products:
    orig_cat = product.get('category', 'Unknown')
    orig_subcat = product.get('sub_category', 'Unknown')
    
    # Apply consolidation
    if orig_cat in special_mapping:
        if callable(special_mapping[orig_cat]):
            new_cat, new_subcat = special_mapping[orig_cat](orig_cat, orig_subcat)
        else:
            new_cat, new_subcat = special_mapping[orig_cat]
    else:
        # Find in consolidation map
        found = False
        for new_cat, subcats_dict in consolidation_map.items():
            for new_subcat, old_subcats in subcats_dict.items():
                if orig_subcat in old_subcats:
                    found = True
                    break
            if found:
                break
        
        if not found:
            # Default fallback
            new_cat = 'Stationery'
            new_subcat = 'Paper & Office'
    
    product['category'] = new_cat
    product['sub_category'] = new_subcat
    consolidated.append(product)

# Split into 5 parts (keeping approximate distribution)
products_per_part = len(consolidated) // 5
remainder = len(consolidated) % 5

parts = []
start = 0
for i in range(5):
    end = start + products_per_part + (1 if i < remainder else 0)
    parts.append(consolidated[start:end])
    start = end

# Save parts
for i, part in enumerate(parts, 1):
    with open(f'firebase-products-part{i}.json', 'w') as f:
        json.dump(part, f, indent=2)
    print(f"✓ firebase-products-part{i}.json: {len(part)} products")

# Print summary
print(f"\n=== CONSOLIDATION COMPLETE ===\n")
categories = {}
for product in consolidated:
    cat = product.get('category')
    subcat = product.get('sub_category')
    if cat not in categories:
        categories[cat] = {}
    if subcat not in categories[cat]:
        categories[cat][subcat] = 0
    categories[cat][subcat] += 1

for cat in sorted(categories.keys()):
    print(f"\n{cat}:")
    total_in_cat = sum(categories[cat].values())
    for subcat in sorted(categories[cat].keys()):
        count = categories[cat][subcat]
        print(f"  {subcat}: {count}")
    print(f"  TOTAL: {total_in_cat}")
