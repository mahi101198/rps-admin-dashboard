import json

# Updated consolidation mapping - splitting Calculators into separate subcategory
consolidation_map = {
    'Stationery': {
        'Writing Instruments': ['Writing Instruments'],
        'Paper': ['Paper Sheets', 'Paper'],
        'Notebooks & Folders': ['Notebooks', 'Files & Folders'],
        'Calculators': ['Calculators'],  # Separate now
        'Geometry & Art Drawing': ['Geometry Sets', 'Art Supplies'],  # Separate
        'Gifts & Specialty': ['Gift Sets', 'Books'],
        'Adhesives & Tapes': ['Adhesives', 'Correction Supplies'],
        'Office Equipment & Supplies': ['Office Equipment', 'Office Supplies']
    },
    'Housekeeping': {
        'Power & Batteries': ['Batteries & Power'],
        'Air Freshening': ['Air Freshening'],
        'Cleaning': ['Cleaning Essentials']
    }
}

# Load products from all 5 files
all_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
            all_products.extend(products)
            print(f"✓ Loaded {len(products)} products from {file_path}")
    except Exception as e:
        print(f"✗ Error loading {file_path}: {e}")

print(f"\nTotal products loaded: {len(all_products)}\n")

# Apply new consolidation
consolidated_products = []
for product in all_products:
    old_subcat = product.get('sub_category', '')
    mapped = False
    
    for new_category, subcats_dict in consolidation_map.items():
        for new_subcat, old_subcats_list in subcats_dict.items():
            if old_subcat in old_subcats_list:
                product['category'] = new_category
                product['sub_category'] = new_subcat
                consolidated_products.append(product)
                mapped = True
                break
        if mapped:
            break
    
    if not mapped:
        consolidated_products.append(product)

# Count new structure
new_cats = {}
for product in consolidated_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if cat not in new_cats:
        new_cats[cat] = {}
    if subcat not in new_cats[cat]:
        new_cats[cat][subcat] = 0
    new_cats[cat][subcat] += 1

print("="*50)
print("NEW STRUCTURE (Calculators Separated)")
print("="*50)

for cat in sorted(new_cats.keys()):
    total = 0
    print(f"\n{cat}:")
    for subcat in sorted(new_cats[cat].keys()):
        count = new_cats[cat][subcat]
        print(f"  {subcat}: {count}")
        total += count
    print(f"  TOTAL: {total}")

# Redistribute across 5 files
products_per_file = len(consolidated_products) // 5
remainder = len(consolidated_products) % 5

start_idx = 0
for i in range(1, 6):
    count = products_per_file + (1 if i <= remainder else 0)
    end_idx = start_idx + count
    
    part_products = consolidated_products[start_idx:end_idx]
    file_path = f'firebase-products-part{i}.json'
    
    # Convert timestamps to ISO format
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
    
    print(f"✓ firebase-products-part{i}.json: {count} products")
    start_idx = end_idx

print(f"\n✅ Updated! {len(consolidated_products)} products with new subcategories")
