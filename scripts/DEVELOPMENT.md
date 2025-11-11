# StPageFlip Development Guide

## Project Structure

```
StPageFlip-dev/
├── src/
│   ├── PageFlip.ts           # Main entry point and public API
│   ├── Flip/
│   │   └── Flip.ts          # Page flipping logic and animations
│   ├── Render/
│   │   ├── CanvasRender.ts  # Canvas-based rendering
│   │   └── HTMLRender.ts    # HTML/CSS rendering
│   ├── Page/
│   │   ├── Page.ts          # Base page class
│   │   ├── ImagePage.ts     # Image-based pages
│   │   └── HTMLPage.ts      # HTML-based pages
│   ├── UI/
│   │   └── UI.ts            # User interface and interaction handling
│   └── Settings.ts          # Configuration and settings
├── dist/                     # Built files (generated)
└── rollup.config.js         # Build configuration
```

## Common Modifications

### 1. Change Animation Speed/Easing

**File:** `src/Flip/Flip.ts`

```typescript
// Look for the animateFlippingTo method
private animateFlippingTo(/* ... */) {
    // Modify duration calculation
    const duration = this.getAnimationDuration(points.length);
    
    // Or add custom easing function
}
```

### 2. Modify Shadow Effects

**File:** `src/Render/HTMLRender.ts` or `src/Render/CanvasRender.ts`

```typescript
// Look for shadow-related methods
private drawOuterShadow() { /* ... */ }
private drawInnerShadow() { /* ... */ }
private drawHardShadow() { /* ... */ }
```

### 3. Change Page Flip Behavior

**File:** `src/Flip/Flip.ts`

```typescript
// Methods to modify:
public flip(point: Point): void          // Click-to-flip behavior
public fold(point: Point): void          // Drag folding behavior
public flipNext(corner: FlipCorner): void
public flipPrev(corner: FlipCorner): void
```

### 4. Adjust Touch/Mouse Handling

**File:** `src/UI/UI.ts`

```typescript
// Event handlers:
private onMouseDown(e: MouseEvent): void
private onTouchStart(e: TouchEvent): void
private onMouseMove(e: MouseEvent): void
private onTouchMove(e: TouchEvent): void
```

### 5. Modify Page Layout/Sizing

**File:** `src/Render/Render.ts`

```typescript
private calculateBoundsRect(): FlipSetting {
    // Page sizing logic
    // Portrait vs landscape detection
}
```

### 6. Add Custom Settings

**File:** `src/Settings.ts`

```typescript
export interface FlipSetting {
    // Add your custom setting here
    myCustomSetting?: boolean;
    
    // Then use it in other files
}
```

## Development Workflow

### 1. Quick Edit-Test Cycle

```bash
# Make changes in StPageFlip-dev/src/
nano StPageFlip-dev/src/Flip/Flip.ts

# Build and deploy
./scripts/build-pageflip-dev.sh

# Test in browser (with live server)
# Make more changes and repeat
```

### 2. Watch Mode (Optional)

Set up automatic rebuilding:

```bash
cd StPageFlip-dev

# Install watch tools
npm install -g nodemon

# Watch and rebuild on changes
nodemon --watch src --exec "npm run build && cp -r dist/* ../src/lib/"
```

### 3. Debug Build

Add console.logs or debugger statements:

```typescript
// In any TypeScript file
console.log('Debug: flip angle =', this.angle);
debugger; // Browser will pause here
```

Then rebuild and test in browser DevTools.

## Example Modifications

### Remove Double-Click Prevention

**File:** `src/Flip/Flip.ts`

```typescript
public flip(point: Point): void {
    // Comment out or remove this check:
    // if (!this.app.getSettings().disableFlipByClick && 
    //     !this.isPointOnCorners(point)) {
    //     return;
    // }
    
    // Rest of the method...
}
```

### Change Shadow Opacity

**File:** `src/Render/HTMLRender.ts`

```typescript
private drawOuterShadow(): void {
    // Find gradient creation
    const gradient = /* ... */;
    
    // Change opacity values
    gradient.addColorStop(0, `rgba(0, 0, 0, ${this.shadow.opacity * 0.5})`); // Lighter shadow
}
```

### Adjust Flip Corner Sensitivity

**File:** `src/Flip/Flip.ts`

```typescript
private isPointOnCorners(pos: Point): boolean {
    // Change corner detection distance
    const cornerSize = Math.sqrt(Math.pow(pageWidth, 2) + Math.pow(rect.height, 2)) / 3; // Larger corners
    
    // Rest of the method...
}
```

## Building for Production

When ready to publish your fork:

```bash
cd StPageFlip-dev

# Run tests (if available)
npm test

# Build
npm run build

# Commit changes
git add .
git commit -m "Description of your changes"

# Push to your fork
git push myfork master
```

## Tips

1. **TypeScript Errors:** The project uses TypeScript. Fix type errors before building.
2. **Browser Cache:** Clear cache or use hard refresh (Cmd+Shift+R) after rebuilding.
3. **Console Logs:** Add logging to understand execution flow.
4. **Source Maps:** Built files include source maps for debugging.
5. **Rollup Config:** Modify `rollup.config.js` to change build behavior.

## Resources

- [Original StPageFlip Docs](https://nodlik.github.io/StPageFlip/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Rollup Documentation](https://rollupjs.org/)
