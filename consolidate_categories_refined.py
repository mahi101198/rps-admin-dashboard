import json
import os

# Updated consolidation mapping - mapping from CURRENT state to NEW state
consolidation_map = {
    'Stationery': {
        'Writing Instruments': ['Writing Instruments'],
        'Paper': ['Paper Sheets', 'Paper & Office'],  # Only paper items
        'Notebooks & Folders': ['Notebooks', 'Files & Folders'],
        'Calculators, Geometry & Drawing': ['Calculators', 'Geometry Sets', 'Art Supplies'],
        'Gifts & Specialty': ['Gift Sets', 'Books', 'Gifts & Specialty'],
        'Adhesives & Tapes': ['Adhesives', 'Correction Supplies', 'Adhesives & Tapes']
    },
    'Housekeeping': {
        'Power & Batteries': ['Batteries & Power', 'Power & Batteries'],
        'Air Freshening': ['Air Freshening'],
        'Cleaning': ['Cleaning Essentials', 'Cleaning']
    }
}

# Load all products from the 5 parts
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

# Apply consolidation
consolidated_products = []
unmatched_products = []
category_counts = {}

for product in all_products:
    old_subcat = product.get('sub_category', '')
    
    mapped = False
    
    # Try to find a match in consolidation map
    for new_category, subcats_dict in consolidation_map.items():
        for new_subcat, old_subcats_list in subcats_dict.items():
            if old_subcat in old_subcats_list:
                product['category'] = new_category
                product['sub_category'] = new_subcat
                
                if new_category not in category_counts:
                    category_counts[new_category] = {}
                if new_subcat not in category_counts[new_category]:
                    category_counts[new_category][new_subcat] = 0
                category_counts[new_category][new_subcat] += 1
                
                consolidated_products.append(product)
                mapped = True
                break
        if mapped:
            break
    
    if not mapped:
        # Keep as is if no mapping found
        unmatched_products.append({
            'product': product.get('name', 'Unknown'),
            'old_category': product.get('category', ''),
            'old_subcat': old_subcat
        })
        consolidated_products.append(product)

print(f"Products consolidated: {len(consolidated_products)}")
if unmatched_products:
    print(f"⚠ Products without mapping ({len(unmatched_products)}):")
    for item in unmatched_products[:5]:  # Show first 5
        print(f"  - {item['product']} ({item['old_subcat']})")

# Redistribute products across 5 files (try to balance)
products_per_file = len(consolidated_products) // 5
remainder = len(consolidated_products) % 5

file_distributions = []
start_idx = 0
for i in range(5):
    count = products_per_file + (1 if i < remainder else 0)
    file_distributions.append((i + 1, start_idx, start_idx + count, count))
    start_idx += count

# Write back to files
for part_num, start, end, count in file_distributions:
    file_path = f'firebase-products-part{part_num}.json'
    products_to_write = consolidated_products[start:end]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(products_to_write, f, indent=2, ensure_ascii=False)
    
    print(f"✓ firebase-products-part{part_num}.json: {count} products")

# Print consolidation summary
print("\n" + "="*50)
print("=== CONSOLIDATION COMPLETE ===\n")

for category in sorted(category_counts.keys()):
    print(f"\n{category}:")
    total = 0
    for subcat in sorted(category_counts[category].keys()):
        count = category_counts[category][subcat]
        print(f"  {subcat}: {count}")
        total += count
    print(f"  TOTAL: {total}")

print(f"\nGrand Total: {len(consolidated_products)} products")
