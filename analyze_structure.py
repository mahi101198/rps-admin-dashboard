import json
import os

# Load and analyze all 5 product files
all_products = []
file_count = 0

print("Loading products from all 5 files...\n")

for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
            all_products.extend(products)
            file_count += 1
            print(f"✓ Loaded {len(products)} products from {file_path}")
    except Exception as e:
        print(f"✗ Error loading {file_path}: {e}")

print(f"\n" + "="*60)
print(f"TOTAL PRODUCTS LOADED: {len(all_products)}")
print("="*60)

# Count categories and subcategories
categories = {}
subcategories = set()

for product in all_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    
    if cat not in categories:
        categories[cat] = {}
    
    if subcat not in categories[cat]:
        categories[cat][subcat] = 0
    
    categories[cat][subcat] += 1
    subcategories.add(subcat)

# Display summary
print(f"\n📊 CATEGORIES SUMMARY:\n")
print(f"Total Main Categories: {len(categories)}")
print(f"Total Subcategories: {len(subcategories)}")

# Display detailed breakdown
print(f"\n" + "="*60)
print("DETAILED BREAKDOWN:")
print("="*60)

grand_total = 0
for category in sorted(categories.keys()):
    cat_total = sum(categories[category].values())
    print(f"\n📦 {category} ({cat_total} products)")
    print("-" * 60)
    
    for subcat in sorted(categories[category].keys()):
        count = categories[category][subcat]
        percentage = (count / len(all_products)) * 100
        print(f"  └─ {subcat}: {count} products ({percentage:.1f}%)")
    
    grand_total += cat_total

print(f"\n" + "="*60)
print(f"✓ TOTAL: {grand_total} products across {len(categories)} categories and {len(subcategories)} subcategories")
print("="*60)

# List all subcategories
print(f"\n📋 ALL SUBCATEGORIES:")
for i, subcat in enumerate(sorted(subcategories), 1):
    print(f"  {i}. {subcat}")
