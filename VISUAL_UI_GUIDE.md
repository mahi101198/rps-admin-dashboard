# Visual Guide - Multiple Image Upload UI

## New Gallery Images Section

The gallery image section has been completely redesigned for simplicity and efficiency.

### OLD UI (Before)
```
┌────────────────────────────────────────────────┐
│  Gallery Images                  [+ Add Image]  │  ← Click "Add Image" each time
├────────────────────────────────────────────────┤
│ Gallery Image #1                          [✕]  │
├─────────────────────────────────────────────────┤
│ Image URL:    [File Upload]                     │  ← Single image at a time
│ Alt Text:     [Input field]                     │
├─────────────────────────────────────────────────┤
│ Gallery Image #2                          [✕]  │  ← Need to add & upload each
├─────────────────────────────────────────────────┤
│ Image URL:    [File Upload]                     │  ← Separate component for each
│ Alt Text:     [Input field]                     │
└─────────────────────────────────────────────────┘
```

**Problems:**
- ❌ Must click "Add Image" for each new image
- ❌ Each image requires separate upload
- ❌ Alt text separate from upload UI
- ❌ Tedious for many images
- ❌ Complex visual layout

---

### NEW UI (After)
```
┌─────────────────────────────────────────────────┐
│ Gallery Images (Multiple)                       │
├─────────────────────────────────────────────────┤
│ [📁 Choose Files]  5/10                         │  ← Select multiple at once!
└─────────────────────────────────────────────────┘

        After selecting files:

┌─────────────────────────────────────────────────┐
│ 3 images selected                               │
├─────────────────────────────────────────────────┤
│ Image #1  ⏳ Uploading...                       │
│  Alt Text: [Beautiful red shirt front view    ]│
│  [Thumbnail preview]        [↻ Retry] [✕ Remove]
│                                                  │
│ Image #2  ✅ Uploaded                           │
│  Alt Text: [Red shirt size L view             ]│
│  [Thumbnail preview]        [↻ Retry] [✕ Remove]
│                                                  │
│ Image #3  ✅ Uploaded                           │
│  Alt Text: [Red shirt back view                ]│
│  [Thumbnail preview]        [↻ Retry] [✕ Remove]
└─────────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Select 1 or multiple files in one dialog
- ✅ All upload in parallel (faster)
- ✅ Alt text integrated with upload
- ✅ See progress for each image
- ✅ Clean, organized layout
- ✅ Retry failed uploads
- ✅ Remove images easily

---

## Step-by-Step Visual Workflow

### Step 1: Click "Choose Files"
```
  Product Form
  ┌─────────────────────────┐
  │ Media Section           │
  ├─────────────────────────┤
  │ Main Image: [Upload]    │
  │                         │
  │ Gallery Images:         │
  │ [📁 Choose Files]  0/10  │  ← Click here
  │                         │
  └─────────────────────────┘
```

### Step 2: File Picker Opens
```
  Windows File Picker Dialog
  ┌──────────────────────────────┐
  │ 📁 Select Images             │
  ├──────────────────────────────┤
  │  📂 Downloads                │
  │  📂 Pictures                 │
  │  ├─ image1.jpg      ✓ Select │
  │  ├─ image2.jpg      ✓ Select │
  │  ├─ image3.png      ✓ Select │
  │  ├─ image4.webp             │
  │  └─ image5.jpg              │
  │                   [Open] [Cancel]
  └──────────────────────────────┘
  
  User selects multiple files and clicks "Open"
```

### Step 3: Images Start Uploading
```
  Product Form (Upload In Progress)
  ┌──────────────────────────────────────┐
  │ Gallery Images (Multiple)             │
  ├──────────────────────────────────────┤
  │ 3 images selected                    │
  ├──────────────────────────────────────┤
  │ Image #1  ⏳ Uploading...             │
  │  Alt Text: [image1.jpg               ]│
  │  [progress =====>        ]            │
  │                  [↻ Retry] [✕ Remove] │
  │                                       │
  │ Image #2  ⏳ Uploading...             │
  │  Alt Text: [image2.jpg               ]│
  │  [progress =======>      ]            │
  │                  [↻ Retry] [✕ Remove] │
  │                                       │
  │ Image #3  ⏳ Uploading...             │
  │  Alt Text: [image3.png               ]│
  │  [progress ===>           ]           │
  │                  [↻ Retry] [✕ Remove] │
  └──────────────────────────────────────┘
  
  All 3 upload in parallel simultaneously!
```

### Step 4: Uploads Complete
```
  Product Form (All Uploaded)
  ┌──────────────────────────────────────┐
  │ Gallery Images (Multiple)             │
  ├──────────────────────────────────────┤
  │ 3 images selected                    │
  ├──────────────────────────────────────┤
  │ Image #1  ✅ Uploaded                 │
  │  Alt Text: [Beautiful red shirt     ]│
  │  [🖼️ Thumbnail Preview]               │
  │                  [✕ Remove]           │
  │                                       │
  │ Image #2  ✅ Uploaded                 │
  │  Alt Text: [Product from side       ]│
  │  [🖼️ Thumbnail Preview]               │
  │                  [✕ Remove]           │
  │                                       │
  │ Image #3  ✅ Uploaded                 │
  │  Alt Text: [Back view of product    ]│
  │  [🖼️ Thumbnail Preview]               │
  │                  [✕ Remove]           │
  └──────────────────────────────────────┘
  
  User can now edit alt text if needed
```

### Step 5: Save Product
```
  Product Form (Ready to Save)
  ┌──────────────────────────────────────┐
  │ ✓ Title: Red T-Shirt                 │
  │ ✓ Category: Apparel                  │
  │ ✓ Price: $19.99                      │
  │ ✓ Main Image: uploaded               │
  │ ✓ Gallery Images: 3 uploaded         │
  ├──────────────────────────────────────┤
  │           [← Back]   [Save Product]  │
  └──────────────────────────────────────┘
```

### Step 6: Confirmation
```
  Toast Notification
  ┌──────────────────────────────────────┐
  │ ✅ 3 images uploaded successfully    │
  │ ✅ Product created successfully      │
  └──────────────────────────────────────┘
```

---

## Error Scenarios

### Error: File Too Large
```
┌────────────────────────────────────────┐
│ Image #1  ⚠️ Error                     │
│  Alt Text: [large_image.jpg           ]│
│  Error: File size must be less than 5MB│
│                    [↻ Retry] [✕ Remove]│
└────────────────────────────────────────┘
```

### Error: Wrong File Type
```
┌────────────────────────────────────────┐
│ Image #2  ⚠️ Error                     │
│  Alt Text: [document.pdf               ]│
│  Error: Please select image files      │
│                    [↻ Retry] [✕ Remove]│
└────────────────────────────────────────┘
```

### Error: Max Files Exceeded
```
┌────────────────────────────────────────┐
│ [📁 Choose Files]  10/10 (FULL)        │
│                                        │
│ ℹ️ Maximum 10 images allowed.          │
│    Remove unused images first.         │
└────────────────────────────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────┐
│         Product Form (product-form.tsx)         │
└────────────────┬────────────────────────────────┘
                 │
                 │ Uses
                 ▼
┌─────────────────────────────────────────────────┐
│      MultiImageUpload Component                 │
│   (src/components/form/multi-image-upload.tsx)  │
├─────────────────────────────────────────────────┤
│ Props:                                          │
│  • label: "Gallery Images (Multiple)"           │
│  • value: Form gallery images array             │
│  • onChange: Update form state                  │
│  • productId: For Firebase upload               │
│  • maxFiles: 10                                 │
├─────────────────────────────────────────────────┤
│ Features:                                       │
│  ✓ File selection UI                           │
│  ✓ Validation logic                            │
│  ✓ Parallel upload manager                     │
│  ✓ Progress tracking                           │
│  ✓ Error handling                              │
│  ✓ Image preview                               │
│  ✓ Alt text management                         │
└───────────────┬────────────────────────────────┘
                │
                │ Calls
                ▼
┌─────────────────────────────────────────────────┐
│   uploadProductImageAction (Server Action)      │
│    (src/actions/product-details-actions.ts)     │
├─────────────────────────────────────────────────┤
│ • Validates file on server                      │
│ • Uploads to Firebase Storage                   │
│ • Returns public URL                            │
└───────────────┬────────────────────────────────┘
                │
                │ Uploads to
                ▼
┌─────────────────────────────────────────────────┐
│      Firebase Cloud Storage                     │
│    gs://bucket/products/{id}/gallery_*.{ext}    │
└─────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
User Interface Layer
       │
       ├─→ [Choose Files] ──→ File Picker Dialog
       │                           │
       │                      Select Multiple Files
       │                           │
       └─────────────────────────┬─┘
                                 ▼
                        Input Array of Files
                                 │
                    ┌────────────┴────────────┐
                    │   Component Internal    │
                    │   State Management      │
                    │                        │
                    ├─→ setUploadedImages    │
                    │   (Create placeholders)│
                    │                        │
                    ├─→ Parallel Upload Loop│
                    │   (Promise.all)        │
                    │                        │
                    ├─→ Process Results      │
                    │   (Success/Error)      │
                    │                        │
                    └─→ Update UI            │
                        (Show progress)      │
                                 │
                    ┌────────────┴───────────┐
                    ▼                        ▼
             Success Path              Error Path
                    │                        │
         Update image URL           Show error message
         Show thumbnail             [Retry] [Remove]
         Enable alt text edit       
                    │                        │
                    └────────────┬───────────┘
                                 ▼
                        onChange Called with
                        Updated Array
                                 │
                                 ▼
                        Form State Updated
                        (React Hook Form)
                                 │
                                 ▼
                        User Edits Alt Text
                                 │
                                 ▼
                        Save Product Button
                                 │
                    ┌────────────┴───────────┐
                    ▼                        ▼
             Create Product         Update Product
                    │                        │
                    └────────────┬───────────┘
                                 ▼
                        Firestore Save
                        (All URLs + Alt Text)
                                 │
                                 ▼
                           Success Toast
```

---

## Interaction States

### 1. Initial State
```
[📁 Choose Files]  0/10

(User hasn't selected any files yet)
```

### 2. Selection State
```
[📁 Choose Files]  3/10

3 images selected
(File picker open or files being processed)
```

### 3. Upload State
```
[📁 Choose Files]  3/10  DISABLED

Image #1  ⏳ Uploading...  [progress bar]
Image #2  ⏳ Uploading...  [progress bar]
Image #3  ⏳ Uploading...  [progress bar]

(User can't select new files while uploading)
```

### 4. Partial Success State
```
[📁 Choose Files]  3/10

Image #1  ✅ Uploaded       [Alt Text] [✕]
Image #2  ⚠️ Failed         [Alt Text] [↻] [✕]
Image #3  ✅ Uploaded       [Alt Text] [✕]

(User can retry failed or remove images)
```

### 5. Complete State
```
[📁 Choose Files]  5/10

Image #1  ✅ Uploaded       [Alt Text] [✕]
Image #2  ✅ Uploaded       [Alt Text] [✕]
Image #3  ✅ Uploaded       [Alt Text] [✕]
Image #4  ✅ Uploaded       [Alt Text] [✕]
Image #5  ✅ Uploaded       [Alt Text] [✕]

(User can add more images or save product)
```

---

## Mobile Responsive Design

```
Desktop (Wide Screen)
┌────────────────────────────────────────┐
│ [📁 Choose Files] 3/10                 │
├────────────────────────────────────────┤
│ Image #1 ✅  [Alt Text] [thumbnail]    │
│ Image #2 ✅  [Alt Text] [thumbnail]    │
│ Image #3 ✅  [Alt Text] [thumbnail]    │
└────────────────────────────────────────┘

Tablet (Medium Screen)
┌────────────────────┐
│ [📁 Choose Files]  │ 3/10
├────────────────────┤
│ Image #1 ✅        │
│ [Alt Text input]   │
│ [Thumbnail]   [✕]  │
│                    │
│ Image #2 ✅        │
│ [Alt Text input]   │
│ [Thumbnail]   [✕]  │
└────────────────────┘

Mobile (Small Screen)
┌──────────────────┐
│ [📁 Choose Files]│ 3/10
├──────────────────┤
│ Image #1 ✅      │
│ [Alt Text...   ]│
│ [Thumbnail] [✕] │
│ Image #2 ✅      │
│ [Alt Text...   ]│
│ [Thumbnail] [✕] │
└──────────────────┘
```

---

## Summary

The new UI provides a **clean, modern, and efficient experience** for uploading multiple product images with:

✅ Single file picker for multiple selection
✅ Parallel uploads (faster)
✅ Clear progress indicators
✅ Error handling with retry
✅ Integrated alt text management
✅ Mobile responsive design
✅ Intuitive and user-friendly interface

---

*Visual Guide Created: February 4, 2026*
