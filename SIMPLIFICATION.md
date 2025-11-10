# Simplification Summary

## ✅ Changes Made

### Code Updates
1. **Removed `dir` URL parameter** - No longer needed
2. **Simplified file structure** - All images go directly in `assets/` folder
3. **Updated paths**:
   - Old: `pdfs/{dir}/page_00.jpg`
   - New: `assets/page_00.jpg`

### Files Modified
- `app.js` - Simplified to load from `assets/` directly
- `src/js/config.js` - Changed `PDFS_BASE_PATH` to `PAGES_BASE_PATH: 'assets'`
- `src/js/utils.js` - Removed `getDirectoryFromUrl()` function
- `src/js/FlipBook.js` - Removed directory parameter logic
- `README.md` - Updated to reflect simplified usage

### How to Use Now

**Simple!** Just add your images:
```
assets/
├── page_00.jpg
├── page_01.jpg
├── page_02.jpg
└── ...
```

Then open: `http://localhost:8000/index.html`

**That's it!** No URL parameters needed.

### Image Naming Convention
- Must be named: `page_00.jpg`, `page_01.jpg`, `page_02.jpg`, etc.
- Zero-padded numbers (00, 01, 02...)
- Can be JPG or change extension in `config.js`

### Benefits
✅ Simpler to use  
✅ No configuration needed  
✅ Cleaner URLs  
✅ Easier for beginners  
✅ One place for all images  

### Note on Documentation
✅ **All documentation updated!** Both main README and docs/ folder now reflect the simplified single-directory approach. No more references to `?dir` parameter or multi-directory structure.
