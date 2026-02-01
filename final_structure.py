import json

all_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
        all_products.extend(products)

# Count structure
cats = {}
for product in all_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if cat not in cats:
        cats[cat] = {}
    if subcat not in cats[cat]:
        cats[cat][subcat] = 0
    cats[cat][subcat] += 1

print("\n" + "="*70)
print("FINAL CATEGORY & SUBCATEGORY STRUCTURE")
print("="*70)

print(f"\nTotal Products: {len(all_products)}")
print(f"Total Main Categories: {len(cats)}")

all_subcats = set()
for cat_dict in cats.values():
    all_subcats.update(cat_dict.keys())
print(f"Total Subcategories: {len(all_subcats)}")

print("\n" + "="*70)

grand_total = 0
for category in sorted(cats.keys()):
    cat_total = sum(cats[category].values())
    print(f"\n[{category}] - {cat_total} products")
    print("-" * 70)
    
    for i, subcat in enumerate(sorted(cats[category].keys()), 1):
        count = cats[category][subcat]
        percentage = (count / len(all_products)) * 100
        print(f"   {i}. {subcat:<40} : {count:>2} products ({percentage:>5.1f}%)")
    
    grand_total += cat_total

print("\n" + "="*70)
print(f"TOTAL: {grand_total} products")
print("="*70)
