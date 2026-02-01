import json

all_products = []
for part_num in range(1, 6):
    file_path = f'firebase-products-part{part_num}.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
        all_products.extend(products)

print("Products in 'Calculators, Geometry & Drawing':\n")
for product in all_products:
    if product.get('sub_category') == 'Calculators, Geometry & Drawing':
        title = product.get('title', product.get('name', 'Unknown'))
        print(f"  - {title}")
