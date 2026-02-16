# Quick Start - Multiple Image Upload

## What Changed?

You can now upload **multiple product images at once** instead of adding them one-by-one!

## Try It Now

### For New Products:
1. Go to **Products** → **Create New Product**
2. Fill in product title, category, subtitle
3. **Save Product** (creates product ID)
4. Scroll down to **Media** section
5. Click **"Choose Files"** under "Gallery Images (Multiple)"
6. **Select 5, 10, or as many images as you want** at once
7. All images upload automatically in parallel ⚡
8. Add alt text for each image (optional but recommended)
9. Click **"Save Product"** - Done! ✅

### For Existing Products:
1. Go to **Products** → **Edit Product**
2. Scroll to **Media** section
3. See all existing gallery images below
4. Click **"Choose Files"** to add more
5. Select multiple new images
6. They upload automatically and merge with existing ones
7. Click **"Save Product"** - Done! ✅

## Key Points

⚡ **Faster** - All images upload at the same time (parallel)
📁 **Simpler** - Click once to select multiple files
✅ **Reliable** - If one fails, retry just that one
🖼️ **Preview** - See thumbnail of each image
📝 **Alt Text** - Each image gets its own description

## File Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Max 5MB per image
- **Quantity**: Max 10 images per product
- **First Save**: Product must be saved before uploading images

## Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Save product first" | Create/save product first, then upload |
| "File size too large" | Use images smaller than 5MB |
| "Wrong file type" | Use JPG, PNG, or WebP format |
| "Maximum 10 images" | Remove unused images first |
| "Upload failed" | Click "Retry" button or try again |

## Real-Time Features

✅ See upload progress as it happens
✅ Each image shows status icon (loading, success, error)
✅ Remove images before saving if needed
✅ Edit alt text while uploading
✅ Add/remove images multiple times before final save

## Tips & Tricks

💡 **Bulk Operation** - Select 10 images at once, they all upload in ~3 seconds

💡 **Alt Text** - Use descriptive text like "Red T-shirt front view" not just "shirt"

💡 **Remove First** - Can't see all images? Remove some, then add new ones

💡 **Multiple Sessions** - Can update gallery multiple times (add 5 images now, 5 more later)

💡 **Draft Saving** - Refresh page and gallery persists (saved to cloud)

## Common Tasks

### Add 10 Images to a Product
```
1. Click "Choose Files"
2. Select 10 images from your computer
3. Wait for upload bar to complete
4. Review previews
5. Add alt text for each
6. Save product
```
**Time: ~30 seconds** ⚡

### Update Gallery (Add 5 More Images)
```
1. Edit existing product
2. Scroll to Gallery section (see existing images)
3. Click "Choose Files"
4. Select 5 new images
5. They merge with existing ones
6. Save product
```
**No need to re-upload existing images!**

### Remove Bad Image & Replace
```
1. See "Gallery Images (Multiple)" section
2. Click X on the image you want to remove
3. Click "Choose Files"
4. Select replacement image(s)
5. Save product
```

## Technical Details (For Reference)

- **Upload Destination**: Firebase Cloud Storage
- **Format Stored**: `{ url: "https://...", alt_text: "..." }`
- **Schema**: Compatible with all products
- **Max Parallel**: All images upload simultaneously
- **Timeout**: Each upload ~30 seconds max

## Not Working?

✅ Product saved first?
✅ Images under 5MB?
✅ Using JPG, PNG, or WebP?
✅ Less than 10 images?
✅ Internet connection stable?

If still having issues, **clear browser cache and try again**.

## Questions?

See detailed guides:
- [Full User Guide](MULTIPLE_IMAGE_UPLOAD_GUIDE.md)
- [Implementation Details](IMPLEMENTATION_CHANGES.md)
- [Before/After Comparison](BEFORE_AFTER_COMPARISON.md)

---

**Enjoy faster product uploads! 🚀**
