import json

all_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
        all_products.extend(products)

# Get unique subcategories
subcats = {}
for product in all_products:
    cat = product.get('category', 'Unknown')
    subcat = product.get('sub_category', 'Unknown')
    if subcat not in subcats:
        subcats[subcat] = 0
    subcats[subcat] += 1

print("CURRENT SUBCATEGORIES IN JSON:\n")
for subcat in sorted(subcats.keys()):
    print(f"  - {subcat}: {subcats[subcat]} products")
