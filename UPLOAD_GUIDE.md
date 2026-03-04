# Product Upload to Firebase - Complete Guide

## ✅ What's Been Done

1. **Fixed JSON Structure**: Merged split arrays into one valid JSON array
2. **Formatted**: Applied proper indentation (2 spaces)
3. **Created Transformation Script**: `scripts/transform-and-upload-products.ts`
4. **Created Upload Script**: `scripts/upload-products-to-firebase.ts` (existing)

## 📊 File Details

- **Source File**: `src/newproducts.json` - 34 products
- **Format**: Single JSON array with product objects
- **Status**: ✅ Valid JSON, properly formatted

## 🔑 Required Setup

### Firebase Service Account

You need a Firebase service account JSON file to authenticate with Firebase.

**Steps:**

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select Your Project**: Choose the project for this dashboard
3. **Navigate to Settings**: 
   - Click ⚙️ (Settings icon) → Project Settings
   - Go to "Service Accounts" tab
4. **Generate Key**:
   - Click "Generate New Private Key"
   - A JSON file will download
5. **Place File**: Save it as `firebase-service-account.json` in the project root:
   ```
   c:\Users\pyada\Downloads\rps-dashboard-main\firebase-service-account.json
   ```

### Alternative: Set Environment Variable

If you prefer not to store the service account in the project:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\path\to\your\firebase-service-account.json"
```

## 📦 Installation & Dependencies

Ensure TypeScript and dependencies are installed:

```powershell
cd c:\Users\pyada\Downloads\rps-dashboard-main

# Install dependencies if needed
npm install
# or
yarn install
```

## 🚀 Upload Process

### Option 1: Using Transformation Script (Recommended)

This script transforms products to Firebase schema and uploads:

```powershell
cd c:\Users\pyada\Downloads\rps-dashboard-main

# Using npx (if TypeScript installed globally)
npx ts-node scripts/transform-and-upload-products.ts

# Or compile TypeScript first
npx tsc scripts/transform-and-upload-products.ts
node scripts/transform-and-upload-products.js
```

**This script will:**
- ✅ Read `src/newproducts.json`
- ✅ Transform products to Firebase schema
- ✅ Validate all required fields
- ✅ Handle `__SERVER_TIMESTAMP__` placeholders
- ✅ Upload in batches (100 products per batch)
- ✅ Create transformed products backup: `src/newproducts-transformed.json`
- ✅ Display detailed upload summary

### Option 2: Using Existing Upload Script

If products are already in correct format:

```powershell
npx ts-node scripts/upload-products-to-firebase.ts
```

This uploads from the pre-formatted Firebase product files.

## 📋 Product Schema

Each product has:

```json
{
  "product_id": "unique-id",
  "title": "Product Name",
  "subtitle": "Short description",
  "category": "Category Name",
  "sub_category": "Subcategory",
  "brand": "Brand Name",
  "is_active": true,
  "rating": { "average": 0, "count": 0 },
  "purchase_limits": {
    "max_per_order": 50,
    "max_per_user_per_day": 20
  },
  "media": {
    "main_image": {
      "url": "https://...",
      "alt_text": "Description"
    },
    "gallery": []
  },
  "product_skus": [
    {
      "sku_id": "sku-id",
      "attributes": { "size": "...", "color": "..." },
      "pricing": {
        "mrp": 100,
        "selling_price": 100,
        "currency": "INR"
      },
      "inventory": {
        "stock_qty": 100
      }
    }
  ],
  "content_cards": [...],
  "delivery_info": {...},
  "created_at": "__SERVER_TIMESTAMP__",
  "updated_at": "__SERVER_TIMESTAMP__"
}
```

## 🔍 Schema Validation

The transformation script validates:

- ✅ All products have `product_id`
- ✅ All products have `title`
- ✅ All products have required fields
- ✅ SKU structure is correct
- ✅ Pricing information is present
- ✅ Timestamps are properly handled

## 📲 Expected Output

```
🚀 Starting Product Transformation and Firebase Upload...

📖 Reading newproducts.json...
✅ Found 34 products to transform

📊 Analyzing and transforming products...
   Ready: 34/34 products

💾 Saved transformed products to newproducts-transformed.json

📤 Uploading 34 products to Firebase...
   ✓ Batch 1/1 committed (34 products)

============================================================
📊 TRANSFORMATION & UPLOAD SUMMARY
============================================================
Total Products Processed: 34
✅ Successfully Transformed: 34
❌ Transformation Errors: 0
✅ Successfully Uploaded: 34
❌ Upload Errors: 0
============================================================

✨ All products successfully uploaded to Firebase!
📍 Collection: product_details
📊 Total Uploaded: 34
```

## ⚠️ Troubleshooting

### Firebase Authentication Error
- Verify service account file path is correct
- Check environment variable is set: `$env:FIREBASE_SERVICE_ACCOUNT_PATH`
- Ensure service account has Firestore permissions

### JSON Parse Error
- Verify `newproducts.json` is valid JSON
- Check for special characters in text fields
- Ensure all quotes are properly escaped

### Missing Fields Error
- Add defaults in transformation script
- Verify product structure matches schema
- Check for missing `product_id` or `title`

### Upload Failures
- Try with fewer products first (edit script batchSize)
- Check Firebase project quotas
- Verify Firestore is enabled in project

## 📝 Files Reference

| File | Purpose |
|------|---------|
| `src/newproducts.json` | Source products (formatted) |
| `scripts/transform-and-upload-products.ts` | Main transformation & upload script |
| `scripts/upload-products-to-firebase.ts` | Existing upload script |
| `firebase-service-account.json` | Authentication (not in repo - create it) |
| `src/newproducts-transformed.json` | Backup of transformed products |

## 🎯 Next Steps

1. **Obtain Firebase Service Account** (see above)
2. **Place it in project root** as `firebase-service-account.json`
3. **Run transformation script**: `npx ts-node scripts/transform-and-upload-products.ts`
4. **Verify in Firebase Console**: Check Firestore `product_details` collection
5. **Monitor upload progress**: Check output logs

## ✨ Quick Start Summary

```powershell
# 1. Navigate to project
cd c:\Users\pyada\Downloads\rps-dashboard-main

# 2. Ensure Node and TypeScript are available
npm install -g typescript

# 3. Install project dependencies
npm install

# 4. Set service account path (if not in root)
$env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\path\to\service-account.json"

# 5. Run transformation and upload
npx ts-node scripts/transform-and-upload-products.ts

# 6. Check Firebase Console for uploaded products
```

---

**Status**: ✅ Products formatted and ready to upload
**Total Products**: 34
**Firebase Collection**: `product_details`
