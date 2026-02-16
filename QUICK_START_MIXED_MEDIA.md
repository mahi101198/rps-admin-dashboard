# Mixed Media Gallery - Quick Start

## ⚡ 30 Second Quick Start

### What Changed?
Your product gallery now supports **videos** alongside images - all in one upload!

### How to Use
1. Create/edit a product
2. Go to **"Gallery Media"** section
3. Click **"Choose Files (Images & Videos)"**
4. Select any mix: images + videos
5. All upload automatically ✅
6. Add descriptions and save

### Example
```
Select: photo1.jpg, demo.mp4, photo2.jpg
          ↓
          Uploads all 3 in parallel
          ↓
Result: [📷, 🎬, 📷] in same gallery!
```

---

## 5 Minute Setup

### What You Need

✅ **Images**
- Format: JPG, PNG, or WebP
- Size: Up to 5MB each
- Any resolution (square recommended)

✅ **Videos**
- Format: MP4, WebM, OGG, or MOV
- Size: Up to 100MB each
- Duration: Any length (20-30s recommended)

### Step 1: Have Product ID
Create a product first (to get ID for uploads)

### Step 2: Upload Media
- Go to product edit page
- Scroll to "Gallery Media"
- Click "Choose Files"
- Select images + videos
- Watch progress
- Done! ✅

### Step 3: Add Descriptions
- Click edit icon on each media
- Add alt text (helps SEO)
- Save

### Step 4: Verify in Firestore
Check that images have `url` and videos have `videoUrl`

---

## How It Works

### Storage Structure
```
Gallery = [item1, item2, item3, ...]

Item (Image):    { url: "...", alt_text: "..." }
Item (Video):    { videoUrl: "...", alt_text: "..." }

Each item is EITHER image OR video, never both!
```

### Display
- 🖼️ Shows images with thumbnail
- 🎬 Shows videos with play button

### Performance
- Parallel upload: 5 files in ~5 seconds
- All types upload simultaneously
- Real-time progress

---

## FAQ

**Q: Can I mix images and videos?**
A: Yes! That's the whole point. [img, video, img, video] all work together.

**Q: What formats work?**
A: Images (JPG/PNG/WebP), Videos (MP4/WebM/OGG/MOV)

**Q: Size limits?**
A: Images ≤5MB, Videos ≤100MB

**Q: Does position matter?**
A: Yes! [img1, video, img2] preserves that exact order.

**Q: Can I reorder?**
A: Currently no, but planned for future.

**Q: Do I need separate uploads for images vs videos?**
A: No! One upload button handles both.

**Q: Are URLs the same for both?**
A: No! Images use `url`, videos use `videoUrl` - both stored separately.

**Q: What about alt text?**
A: Each item has its own alt text. For videos, describe the content.

**Q: Will it work on mobile?**
A: Yes! File picker works on all devices.

---

## Common Tasks

### Add 3 Images + 1 Video

```
1. Open product
2. Go to Gallery Media
3. Click Choose Files
4. Select: img1.jpg, img2.jpg, video.mp4, img3.jpg
5. Upload starts automatically
6. Wait for all to finish
7. Edit alt text if needed
8. Save product
```

### Replace a Video with Image

```
1. Open product
2. Go to Gallery Media
3. Click ✕ on the video you want to remove
4. Item is deleted
5. Click Choose Files
6. Select new image
7. Uploads automatically
8. Save product
```

### Reorder Media

```
Currently: [img1, video1, img2]
Want: [img1, img2, video1]

Solution (for now):
1. Remove all items
2. Add them back in correct order
3. Save

Future: Drag-to-reorder coming soon!
```

---

## Tips & Tricks

### Best Order
```
❌ Don't start with video (bad for first impression)
✅ Do: [main image, detail image, video, more images]
```

### Video Quality
```
✅ 20-30 seconds, MP4, H.264 codec
✅ Clean lighting, steady camera
✅ Call to action at end
❌ Avoid long videos (people won't watch)
```

### Alt Text
```
✅ Images: "Red t-shirt front view"
✅ Videos: "Product demo video"
❌ Avoid: "photo" or "video" (too vague)
```

### File Names
```
✅ Good: product_front.jpg, demo_video.mp4
✅ Simple: img1.jpg, vid1.mp4
❌ Bad: DSCN4726.JPG (hard to identify)
```

---

## Troubleshooting

### "Upload failed"
- ✅ Check internet
- ✅ Verify file format supported
- ✅ Verify file size OK
- ✅ Refresh page and retry

### "File too large"
- ✅ Image > 5MB? Compress it (TinyPNG)
- ✅ Video > 100MB? Split it or reduce bitrate

### "Unsupported format"
- ✅ Wrong image format? Use JPG/PNG/WebP
- ✅ Wrong video format? Convert to MP4

### "Video won't play"
- ✅ File might be corrupted
- ✅ Try playing locally first
- ✅ Try different MP4 file

---

## File Specs

### Images
| Property | Value |
|----------|-------|
| Formats | JPG, PNG, WebP |
| Max Size | 5MB |
| Recommended | 1080x1080px |

### Videos
| Property | Value |
|----------|-------|
| Formats | MP4, WebM, OGG, MOV |
| Max Size | 100MB |
| Codec | H.264 (MP4) |
| Bitrate | 500-2000 Kbps |
| FPS | 24-30 |
| Duration | 20-30s ideal |

---

## Examples

### Example 1: Headphones
```
1. Main product image
2. Close-up image
3. Unboxing video ← 15s demo
4. On-ear image
5. How to use video ← 30s guide
```

### Example 2: T-Shirt
```
1. Front view
2. Back view
3. Size comparison video ← shows fit
4. Detail texture image
```

### Example 3: Tutorial Product
```
1. Product overview image
2. Intro video ← what is it?
3. Setup image
4. Usage video ← how to use?
```

---

## Converting Videos

### Quick Online
- Visit [CloudConvert](https://cloudconvert.com)
- Upload your video
- Select MP4 format
- Download
- Done!

### Using FFmpeg (Advanced)
```bash
# Convert any video to MP4
ffmpeg -i input.avi -c:v libx264 output.mp4

# Compress to save space
ffmpeg -i input.mp4 -b:v 500k output_small.mp4
```

---

## What You Get

✅ Mixed image + video gallery
✅ Automatic type detection
✅ Parallel uploads (fast!)
✅ Position preservation
✅ Separate URL storage
✅ Type badges (🖼️ vs 🎬)
✅ Alt text support
✅ Error handling
✅ Upload progress
✅ Easy removal/editing

---

## What's Coming

🔜 Drag-to-reorder
🔜 Video thumbnails
🔜 Auto-compression
🔜 3D model support
🔜 360° image support

---

## Support

**Need help?**

See detailed guides:
- [UNIFIED_MEDIA_GALLERY_GUIDE.md](UNIFIED_MEDIA_GALLERY_GUIDE.md) - Full guide
- [VIDEO_SUPPORT_REFERENCE.md](VIDEO_SUPPORT_REFERENCE.md) - Video details
- [MIXED_MEDIA_IMPLEMENTATION.md](MIXED_MEDIA_IMPLEMENTATION.md) - Technical guide

**Questions?** See FAQ section above.

---

## Key Differences from Images-Only

| Feature | Before | Now |
|---------|--------|-----|
| **Gallery type** | Images only | Images + Videos |
| **Upload button** | "Add Images" | "Choose Files" |
| **Video support** | ❌ No | ✅ Yes |
| **Same upload** | 1 for images | Both in one |
| **Storage** | `url` only | `url` + `videoUrl` |
| **Position** | Fixed | Flexible mix |

---

**That's it! You're ready to use mixed media galleries! 🎉**

*Last Updated: February 4, 2026*
*Difficulty: Beginner-Friendly*
*Time to Learn: 5 minutes*
