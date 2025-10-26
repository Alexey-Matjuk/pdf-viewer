# PDF Flipbook Viewer

A simple, static HTML + JS project that displays pre-rendered PDF pages as a swipable flipbook with smooth animation. Optimized for mobile Safari (iPhone/iPad) and desktop browsers, hosted on GitHub Pages.

## 🌐 Live Demo

**Access the viewer at:** `https://alexey-matjuk.github.io/pdf-viewer/?dir=example`

Replace `example` with any PDF folder name you've added to the `pdfs/` directory.

## Features

- 📱 **Mobile-first design** - Works smoothly on iPhone/iPad Safari and desktop browsers
- 📖 **Flipbook animation** - Smooth page-turning effects using turn.js
- 🌑 **Dark theme** - Clean, centered viewer with dark background
- 🔗 **Dynamic loading** - Load any PDF folder via URL parameter
- 🚀 **100% client-side** - No backend required, pure HTML/CSS/JS
- 📦 **Easy deployment** - Works perfectly on GitHub Pages

## Quick Start

### How to Open the PDF Viewer

1. **Open in your browser:** Visit `https://alexey-matjuk.github.io/pdf-viewer/?dir=example`
2. **View different documents:** Change the `dir` parameter to match any folder in `pdfs/`
   - Example: `https://alexey-matjuk.github.io/pdf-viewer/?dir=mydoc`
3. **Navigate pages:** Swipe on mobile or click page edges on desktop

## First-Time Setup (One-Time)

GitHub Pages is automatically deployed via GitHub Actions. The workflow deploys whenever you push to the `main` branch.

## Adding Your Own PDF Documents

### 1. Prepare Your PDF Images

Convert your PDF to JPG images using ImageMagick:

```bash
# Install ImageMagick (if not already installed)
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert PDF to images
magick -density 200 input.pdf -quality 90 pdfs/mydoc/page_%02d.jpg
```

This will create:
- `pdfs/mydoc/page_00.jpg`
- `pdfs/mydoc/page_01.jpg`
- `pdfs/mydoc/page_02.jpg`
- ...

**Note:** Files must follow the naming pattern `page_XX.jpg` where `XX` is a zero-padded number starting from `00`.

### 2. Upload Images to GitHub

Create the folder structure:

```
pdf-viewer/
├── index.html
├── README.md
└── pdfs/
    ├── example/
    │   ├── page_00.jpg
    │   ├── page_01.jpg
    │   └── ...
    └── mydoc/
        ├── page_00.jpg
        ├── page_01.jpg
        └── ...
```

Upload your images:

1. On GitHub, navigate to your repository
2. Click **Add file** → **Upload files**
3. Create/navigate to `pdfs/<your-folder-name>/`
4. Upload all your `page_XX.jpg` files
5. Commit the changes

Alternatively, using git:

```bash
git clone https://github.com/<username>/pdf-viewer.git
cd pdf-viewer
mkdir -p pdfs/mydoc
# Copy your page_*.jpg files to pdfs/mydoc/
git add pdfs/
git commit -m "Add mydoc PDF images"
git push
```

### 3. View Your Document

Open your browser and navigate to:

```
https://alexey-matjuk.github.io/pdf-viewer/?dir=mydoc
```

## Usage

### URL Parameters

- `?dir=<folder-name>` - **(Required)** Specifies which PDF folder to load from `pdfs/`

### Examples

```
# Load the example document
https://alexey-matjuk.github.io/pdf-viewer/?dir=example

# Load a different document
https://alexey-matjuk.github.io/pdf-viewer/?dir=annual-report

# Load another document
https://alexey-matjuk.github.io/pdf-viewer/?dir=presentation
```

## How It Works

1. **Parse URL**: The viewer reads the `dir` parameter from the URL
2. **Load Pages**: Sequentially checks for `page_00.jpg`, `page_01.jpg`, etc. until a page doesn't exist
3. **Initialize Flipbook**: Once all pages are loaded, turn.js creates the interactive flipbook
4. **Navigate**: Swipe on mobile or click page edges on desktop to flip pages

## Customization

### Styling

Edit the `<style>` section in `index.html` to customize:

- Background color: Change `background-color: #121212;`
- Page styling: Modify `.page` class properties
- Loading message: Update `.loading` class

### Page Sizing

Pages automatically scale to fit the screen while maintaining aspect ratio using:

```css
background-size: contain;
background-position: center;
```

## Troubleshooting

### "No directory specified" error
- Make sure you include `?dir=<folder-name>` in the URL

### "No pages found" error
- Verify your images are in `pdfs/<folder-name>/`
- Check that files are named `page_00.jpg`, `page_01.jpg`, etc.
- Ensure files are committed and pushed to GitHub
- Wait a few minutes after pushing for GitHub Pages to update

### Pages not loading
- Check browser console (F12) for errors
- Verify image file paths are correct
- Make sure images are accessible (not in .gitignore)

### Flipbook not working
- Ensure you have internet connection (CDN libraries required)
- Check that jQuery and turn.js are loading from CDN
- Try clearing browser cache

## Browser Support

- ✅ Safari (iOS and macOS)
- ✅ Chrome (Desktop and Mobile)
- ✅ Firefox (Desktop and Mobile)
- ✅ Edge (Desktop)

## Technical Details

### Dependencies (loaded from CDN)

- **jQuery 3.6.0** - Required by turn.js
- **turn.js 4** - Flipbook animation library

### File Structure

```
pdf-viewer/
├── index.html              # Main viewer page (self-contained)
├── README.md               # This file
└── pdfs/                   # PDF images directory
    └── <document-name>/    # Each document in its own folder
        ├── page_00.jpg     # First page
        ├── page_01.jpg     # Second page
        └── ...             # Additional pages
```

## License

This project is open source and available for free use.

## Credits

- [turn.js](http://www.turnjs.com/) - Flipbook library
- [jQuery](https://jquery.com/) - JavaScript library