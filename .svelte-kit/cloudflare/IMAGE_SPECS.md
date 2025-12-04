# Social Media Image Specifications

## Open Graph Image (og-image.png)

For best results when sharing on social media, create an image with these specifications:

### Dimensions

- **Recommended**: 1200 x 630 pixels
- **Aspect Ratio**: 1.91:1
- **File Format**: PNG or JPG
- **File Size**: Keep under 5MB (ideally under 1MB)

### Design Suggestions

1. **Include Brand Name**: "Tadwin" prominently displayed
2. **Tagline**: "Markdown-First Note Taking"
3. **Visual Elements**:
   - Markdown icon or editor screenshot
   - Clean, professional design
   - Use brand colors (Indigo #4F46E5)
4. **Text Readability**: Ensure text is large enough to read in small thumbnails

### Tools for Creating

- Canva (easiest, templates available)
- Figma (professional design)
- Adobe Photoshop/Illustrator
- Online OG Image generators

### Example Content Layout

```
┌─────────────────────────────────────┐
│                                     │
│         TADWIN                      │
│  Markdown-First Note Taking         │
│                                     │
│  [Simple illustration/icon]         │
│                                     │
│  ✓ Organize Your Thoughts           │
│  ✓ Lightning-Fast Search            │
│  ✓ Offline Support                  │
│                                     │
└─────────────────────────────────────┘
```

## Favicon Files Needed

### 1. favicon.svg (Created ✓)

- **Location**: `/static/favicon.svg`
- Already created with gradient "T" letter

### 2. favicon.png

- **Dimensions**: 32x32 or 192x192 pixels
- **Format**: PNG with transparency
- **Use**: Fallback for older browsers

### 3. apple-touch-icon.png

- **Dimensions**: 180x180 pixels
- **Format**: PNG (no transparency needed)
- **Use**: iOS home screen icon

## Testing Social Media Previews

After creating your og-image.png, test it with:

### Facebook

https://developers.facebook.com/tools/debug/

### Twitter

https://cards-dev.twitter.com/validator

### LinkedIn

Share a link and check the preview

### General Open Graph

https://www.opengraph.xyz/

## Quick Creation with Canva Template

1. Go to Canva.com
2. Search for "Open Graph Image" or use dimensions 1200x630
3. Use these elements:
   - Background: Gradient (Indigo to Purple)
   - Text: "Tadwin" (large, white, bold)
   - Subtext: "Markdown-First Note Taking & Knowledge Management"
   - Icon: Document or markdown symbol
   - Bullet points with key features
4. Export as PNG (high quality)
5. Save to `/static/og-image.png`

## Color Palette Reference

```css
Primary Indigo: #4F46E5
Purple Accent: #7C3AED
Dark Gray: #1F2937
Light Gray: #F9FAFB
White: #FFFFFF
```
