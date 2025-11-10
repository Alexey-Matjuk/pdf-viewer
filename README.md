# PDF Flipbook Viewer

A professional, responsive PDF flipbook viewer with realistic page-turning animations. Perfect for displaying magazines, catalogs, brochures, and other multi-page documents on the web.

## 🌐 Live Demo

**Access the viewer at:** `https://alexey-matjuk.github.io/pdf-viewer/`

## 🚀 Quick Start

## 📚 Adding Your Own Documents

### 1. Convert PDF to Images

```bash
# Install ImageMagick
brew install imagemagick  # macOS

# Convert PDF to JPG (recommended settings)
magick convert -density 150 your-document.pdf -quality 90 page_%02d.jpg
```

### 2. Add Images to Assets

Place your converted images in the `assets/` directory:

```
assets/
├── page_00.jpg
├── page_01.jpg
├── page_02.jpg
└── ...
```

**Note:** Images must be named `page_00.jpg`, `page_01.jpg`, etc. (with zero-padding).

## 🙏 Credits

- Built with [StPageFlip](https://nodlik.github.io/StPageFlip/) by Nodlik
