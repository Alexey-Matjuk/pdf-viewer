# Build Scripts

## build-pageflip.sh

This script builds the StPageFlip library.

### What it does:

1. Clones the fork: `https://github.com/Alexey-Matjuk/StPageFlip`
2. Installs dependencies
3. Builds the library
4. Copies the built files to `src/lib/`
5. Cleans up temporary files

### Usage:

```bash
./scripts/build-pageflip.sh
```

### When to run:

- Initial setup
- When you want to update to the latest version from the fork
- After the fork has been updated with new features

---

## build-pageflip-dev.sh

This script builds StPageFlip from your local development copy for testing modifications.

### What it does:

1. Builds from the local `StPageFlip-dev/` directory
2. Copies the built files to `src/lib/`
3. Preserves your local changes for testing

### Setup:

First, clone the repository for local development:

```bash
git clone https://github.com/Alexey-Matjuk/StPageFlip.git StPageFlip-dev
```

### Usage:

1. Make changes in `StPageFlip-dev/src/`
2. Run the build script:

```bash
./scripts/build-pageflip-dev.sh
```

3. Test your changes in the browser
4. Repeat as needed

### Development Workflow:

```bash
# 1. Make changes to TypeScript files
cd StPageFlip-dev/src/
# Edit files like PageFlip.ts, Flip/Flip.ts, etc.

# 2. Build and copy to your project
cd ../..
./scripts/build-pageflip-dev.sh

# 3. Test in browser
# Open your flipbook and test the changes

# 4. When satisfied, create your own fork:
cd StPageFlip-dev
git remote add myfork https://github.com/YOUR-USERNAME/StPageFlip.git
git push myfork master
```

### Creating Your Own Fork:

Once you're happy with your modifications:

1. Fork the repository on GitHub
2. Add your fork as a remote:
   ```bash
   cd StPageFlip-dev
   git remote add myfork https://github.com/YOUR-USERNAME/StPageFlip.git
   ```
3. Commit your changes:
   ```bash
   git add .
   git commit -m "Your changes description"
   ```
4. Push to your fork:
   ```bash
   git push myfork master
   ```
5. Update `build-pageflip.sh` to use your fork URL

---

## Output:

Both scripts create:
- `src/lib/js/page-flip.browser.js` - Browser-ready bundle
- `src/lib/js/page-flip.module.js` - ES module version
- `src/lib/*.d.ts` - TypeScript definitions
- `src/lib/[various folders]` - TypeScript definition folders

## Requirements:

- Git
- Node.js and npm
- Internet connection (for cloning repositories)

## Note:

The built files are tracked in git, so team members don't need to run these scripts unless updating the library.
