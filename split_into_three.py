import json

# Products to be in Calculators subcategory
calculator_items = {
    'Casio MJ-12D Calculator'
}

# Products to be in Geometry & Scales subcategory
geometry_items = {
    'Domes Geometry Box X1',
    'Infinity Small Scale - 4.8 inches',
    'Metal Scale - 12 inches',
    'Domes Plastic Scale - 12 inches'
}

# Products to be in Art & Drawing subcategory
art_items = {
    'Magic Paint Brush Set - Flat 0.7G',
    'Magic Paint Brush Set - Pointed 0.7G',
    'Domes Poster Color Set - Medium'
}

# Load all products
all_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
        all_products.extend(products)

print("Splitting 'Calculators, Geometry & Drawing' into 3 subcategories...\n")

# Update products
for product in all_products:
    if product.get('sub_category') == 'Calculators, Geometry & Drawing':
        title = product.get('title', product.get('name', ''))
        
        if title in calculator_items:
            product['sub_category'] = 'Calculators'
            print(f"  > {title} -> Calculators")
        elif title in geometry_items:
            product['sub_category'] = 'Geometry & Scales'
            print(f"  > {title} -> Geometry & Scales")
        elif title in art_items:
            product['sub_category'] = 'Art & Drawing'
            print(f"  > {title} -> Art & Drawing")

# Count new structure
new_cats = {}
for product in all_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if cat not in new_cats:
        new_cats[cat] = {}
    if subcat not in new_cats[cat]:
        new_cats[cat][subcat] = 0
    new_cats[cat][subcat] += 1

print("\n" + "="*60)
print("NEW STRUCTURE (After Splitting Calculators)")
print("="*60)

for cat in sorted(new_cats.keys()):
    total = 0
    print(f"\n{cat}:")
    for subcat in sorted(new_cats[cat].keys()):
        count = new_cats[cat][subcat]
        print(f"  {subcat}: {count}")
        total += count
    print(f"  TOTAL: {total}")

# Redistribute across 5 files
products_per_file = len(all_products) // 5
remainder = len(all_products) % 5

start_idx = 0
for i in range(1, 6):
    count = products_per_file + (1 if i <= remainder else 0)
    end_idx = start_idx + count
    
    part_products = all_products[start_idx:end_idx]
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
    
    print(f"\nSaved firebase-products-part{i}.json: {count} products")
    start_idx = end_idx

print(f"\nDone! Updated all 69 products")
