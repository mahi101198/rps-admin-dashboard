# Multiple Image Upload Feature - Implementation Guide

## What's New

Your product form now supports **uploading multiple images at once** instead of adding images one by one. This makes it much faster and easier to manage product gallery images.

## Features

✅ **Select Multiple Images At Once** - Choose 5, 10, or any number of images in a single file picker dialog
✅ **Parallel Upload** - All selected images upload simultaneously (not sequentially)
✅ **Automatic URL Storage** - Images are uploaded to Firebase Storage and URLs are automatically saved
✅ **Individual Alt Text** - Each image has its own customizable alt text for SEO
✅ **Real-time Progress** - See upload progress with visual indicators
✅ **Error Handling** - Failed uploads show error messages and can be retried
✅ **Image Preview** - Thumbnail previews of uploaded images
✅ **Max File Limit** - Up to 10 gallery images per product (configurable)

## How to Use

### Creating a New Product

1. **Fill Basic Details**
   - Enter product title, subtitle, category, etc.
   - Save the product first (this creates a product ID needed for image uploads)

2. **Upload Gallery Images**
   - Scroll to the **"Media"** section
   - Under **"Gallery Images (Multiple)"**, click **"Choose Files"**
   - Select multiple image files from your computer (hold Ctrl/Cmd to select multiple)
   - All selected images will start uploading immediately

3. **Monitor Upload Progress**
   - You'll see a loading indicator while images upload
   - Each image shows upload status
   - Successful uploads display a green checkmark

4. **Add Alt Text**
   - Each uploaded image has an **"Alt Text"** field
   - Enter descriptive text for each image (important for accessibility and SEO)
   - Alt text is optional but recommended

5. **Remove Images**
   - Click the **"X"** button on any image to remove it
   - The image won't be included in the final product

6. **Save Product**
   - Click **"Save Product"** to finalize and store all gallery images

### Updating an Existing Product

1. **Edit the Product**
   - Go to Products → Edit an existing product
   - All previously uploaded gallery images appear at the bottom

2. **Add More Images**
   - Click **"Choose Files"** again to add new images
   - New images will upload and be added to the existing gallery

3. **Remove Old Images**
   - Click the **"X"** button on any image card to remove it
   - Only confirmed after saving the product

4. **Update Alt Text**
   - Click on any alt text field to edit descriptions
   - Changes save automatically when you submit the form

## Technical Details

### Component: `MultiImageUpload`
- **Location**: `src/components/form/multi-image-upload.tsx`
- **Supports**: Multiple concurrent uploads
- **Max Files**: 10 per product (easily configurable via `maxFiles` prop)
- **Upload Method**: Uses existing `uploadProductImageAction` from server actions

### Supported File Types
- JPEG/JPG
- PNG
- WEBP

### File Size Limits
- Maximum 5MB per file
- Larger files will be rejected with an error message

### Storage
- Images uploaded to Firebase Cloud Storage
- URLs stored in Firestore document under `media.gallery`
- Format: `{ url: "https://...", alt_text: "description" }`

## API Changes

The product schema remains the same:
```typescript
media: {
  main_image: {
    url: string;
    alt_text: string;
  },
  gallery: Array<{
    url: string;
    alt_text: string;
  }>
}
```

No database schema changes needed!

## Error Handling

### Upload Fails
- Error message appears below the image
- Click **"Retry"** button to attempt upload again
- Or remove and re-upload the image

### File Too Large
- You'll see: "File size must be less than 5MB"
- Compress the image and try again

### Wrong File Type
- You'll see: "Please select image files (JPEG, PNG, WEBP)"
- Use an image converter to change file format

### Max Files Reached
- You'll see: "Maximum 10 images allowed"
- Remove unused images first, then upload new ones

## Benefits Over Old Method

| Feature | Old Method | New Method |
|---------|-----------|-----------|
| Select Multiple Files | ❌ One at a time | ✅ All at once |
| Upload Speed | Slow (sequential) | ✅ Fast (parallel) |
| User Experience | Many clicks needed | ✅ Simple 1-click |
| Progress Visibility | Limited | ✅ Clear indicators |
| Error Recovery | Need to restart | ✅ Retry button |
| Alt Text Management | Separate inputs | ✅ Integrated fields |

## Troubleshooting

### Images not uploading?
- Make sure product is saved first (you need a product ID)
- Check file size is under 5MB
- Verify file format is JPEG, PNG, or WEBP
- Check internet connection

### Upload takes too long?
- Very large files may take longer (should still be under 1MB per image)
- Try compression tool if files are huge

### Lost images after uploading?
- Images are immediately saved to Firebase Storage
- They persist even if you don't save the product
- If product not saved, refresh page to reload gallery

### Can I upload to both main image and gallery?
- **Main Image**: Single required image (first product picture)
- **Gallery Images**: Multiple additional images (can have up to 10)
- You can manage both independently

## Customization

To change maximum files allowed, edit [multi-image-upload.tsx](src/components/form/multi-image-upload.tsx):

```typescript
maxFiles={10}  // Change this number (line in MultiImageUpload call)
```

To add support for more file types, modify the accept attribute in the component:
```typescript
accept="image/png,image/jpeg,image/webp,image/gif"  // Add image/gif
```

---

**Note**: The single image upload component (`ProductImageUpload`) is still available for main product images and SKU images.
