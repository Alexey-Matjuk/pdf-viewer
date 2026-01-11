# PDF Flipbook Viewer

A responsive PDF flipbook viewer with realistic page-turning animations. Perfect for displaying magazines, catalogs, and brochures on the web.

## ✨ Features

- 📖 Realistic 3D page-turning animations
- 🎨 Customizable background color (including transparent)
- 🔍 Zoom in/out controls
- 📱 Responsive design (mobile & desktop)
- ⌨️ Keyboard navigation (arrow keys)
- 👆 Tap-to-flip on mobile
- 🎯 Page counter display
- 🖥️ Fullscreen support
- 🚀 Iframe-ready with auto-detection
- 🎨 Modern glassmorphism UI

## 🌐 Live Demo

**Production URL:** https://pdf-viewer-eight-tawny.vercel.app/

**With transparent background:** https://pdf-viewer-eight-tawny.vercel.app/?bgColor=transparent

## 📦 Embedding in Your Website

### Simple Iframe (Recommended)

The app automatically detects iframe embedding and handles initialization properly. Just use:

```html
<iframe 
    src="https://pdf-viewer-eight-tawny.vercel.app/?bgColor=transparent" 
    width="100%" 
    height="600" 
    frameborder="0"
    allowfullscreen
    style="border: none;">
</iframe>
```

### Customization Options

**Background Color Parameter:**

```html
<!-- Transparent background -->
<iframe src="https://pdf-viewer-eight-tawny.vercel.app/?bgColor=transparent"></iframe>

<!-- Hex color (use %23 instead of #) -->
<iframe src="https://pdf-viewer-eight-tawny.vercel.app/?bgColor=%23ffffff"></iframe>

<!-- CSS color keyword -->
<iframe src="https://pdf-viewer-eight-tawny.vercel.app/?bgColor=white"></iframe>
```

**Note:** For hex colors in URLs, replace `#` with `%23` (e.g., `%23333` for `#333`)

### Platform-Specific Instructions

#### Tilda
1. Add an **HTML block** (T123)
2. Paste the iframe code
3. Save and publish

#### WordPress
1. Add an **HTML block** or **Custom HTML widget**
2. Paste the iframe code
3. Update/publish

#### Webflow
1. Add an **Embed** element
2. Paste the iframe code
3. Publish site

#### Other Platforms
The iframe works on any platform that allows custom HTML/embeds (Wix, Squarespace, Shopify, etc.)

## 📚 Adding Your Own Documents

### 1. Convert PDF to Images

```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux

# Convert PDF to JPG (recommended settings)
magick -density 150 your-document.pdf -quality 90 page_%02d.jpg
```

**Conversion Options:**
- `-density 150`: Controls image quality (150 DPI is good for web)
- `-quality 90`: JPEG quality (90 is high quality)
- Increase density to 300 for print-quality images

### 2. Add Images to Assets

Place your converted images in the `public/assets/` directory:

```
public/
└── assets/
    ├── page_00.jpg
    ├── page_01.jpg
    ├── page_02.jpg
    └── ...
```

**Important:** 
- Images must be named `page_00.jpg`, `page_01.jpg`, etc.
- Use zero-padding (00, 01, 02, not 0, 1, 2)
- Supported formats: JPG, PNG

### 3. Build and Deploy

```bash
npm run build
vercel --prod
```

## 🔨 Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel
vercel --prod
```

## 🛠️ Technology Stack

- **Vue 3** - Progressive JavaScript framework (Composition API)
- **@evomark/flipbook-vue** - 3D page flip component
- **Vite 7.2.2** - Next generation frontend tooling
- **Vercel** - Hosting and deployment platform

## 📁 Project Structure

```
pdf-viewer-copilot-create-static-pdf-flipbook/
├── public/
│   ├── assets/              # PDF page images
│   │   ├── page_00.jpg
│   │   ├── page_01.jpg
│   │   └── ...
│   └── _headers             # Vercel headers for iframe embedding
├── src/
│   ├── css/
│   │   └── styles.css       # Global styles & glassmorphism UI
│   └── js/
│       ├── app.js           # Main Vue application
│       ├── config.js        # Configuration constants
│       └── utils.js         # Utility functions
├── index.html               # Entry HTML file
├── your-embed.html          # Simple iframe example
├── example-embed.html       # Advanced integration example
├── vite.config.js           # Vite build configuration
├── vercel.json              # Vercel deployment config
├── package.json
└── README.md
```

## 🚀 Deployment

The app is configured for Vercel with proper CORS headers to allow iframe embedding from any domain.

**Security Headers:**
- `Access-Control-Allow-Origin: *` - Allow embedding from any domain
- `Cross-Origin-Resource-Policy: cross-origin` - Allow cross-origin resources
- `Cross-Origin-Embedder-Policy: unsafe-none` - Permit embedding

These headers are set in both `vercel.json` and `public/_headers` for reliability.

## 🔧 Troubleshooting

### Fullscreen Not Working

1. **Add `allowfullscreen` attribute** to iframe
2. **Check browser support** - Some mobile browsers limit iframe fullscreen
3. **User gesture required** - Fullscreen must be triggered by user click

## 📝 License

MIT
