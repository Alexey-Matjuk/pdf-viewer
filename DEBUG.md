# Mobile Debugging Guide

## 📊 Debug Features Added

The app now includes a comprehensive mobile debugging system to help diagnose the zoom crash issue.

## How to Use

### Visual Debug Panel (On Phone)

1. **Open the app** on your phone
2. **Look for the green 📊 button** in the top-right corner (below fullscreen button)
3. **Tap it** to show/hide the debug panel
4. The panel shows:
   - Touch events
   - Gesture events (pinch/zoom)
   - Memory usage (updates every 5 seconds)
   - Page flips
   - Zoom operations
   - Window resize events
   - Errors and warnings

### What to Look For

When testing the zoom crash:

1. **Navigate to near the last page** (where crashes happen more often)
2. **Open the debug panel** (tap 📊)
3. **Perform zoom gestures** on the page (pinch-to-zoom outside the flipbook)
4. **Watch for these indicators:**
   - `GESTURE: Pinch/zoom gesture detected` - Shows zoom is happening
   - `MEMORY: Memory usage` - Watch the percentage
   - `RESIZE: Window resize` - Multiple rapid resizes can indicate problems
   - `LIFECYCLE: Page about to unload (CRASH?)` - This appears RIGHT before crash
   - `TOUCH: Touch start` - Shows touch patterns

5. **Take screenshots** of the debug panel before and during crash

### After a Crash

When the page reloads after a crash:

1. **Tap 📊 again** to open the debug panel
2. **Look for** `RECOVERY: Found crash logs from previous session`
3. The previous session's logs are saved automatically

### Remote Debugging (Most Detailed)

#### For iPhone/iPad:
1. Connect iPhone to Mac via USB
2. On iPhone: Settings → Safari → Advanced → Enable "Web Inspector"
3. On Mac: Safari → Develop → [Your iPhone] → Select the flipbook page
4. Full console with all logs will appear

#### For Android:
1. Connect Android to computer via USB
2. On Android: Settings → Developer Options → Enable "USB Debugging"
3. On computer: Chrome → `chrome://inspect`
4. Click "Inspect" under your device
5. Full console access

### Export Logs Programmatically

In browser console (or via remote debugging):

```javascript
// Export all logs
window.exportDebugLogs()

// Access the debugger directly
window.mobileDebugger.logs

// Get specific log types
window.mobileDebugger.logs.filter(l => l.type === 'MEMORY')
window.mobileDebugger.logs.filter(l => l.type === 'GESTURE')
window.mobileDebugger.logs.filter(l => l.type === 'LIFECYCLE')
```

## Log Types

| Type | Color | What It Means |
|------|-------|---------------|
| `LOG` | Green | General logging |
| `WARN` | Yellow | Warnings |
| `ERROR` | Red | Errors |
| `MEMORY` | Cyan | Memory usage stats (every 5s) |
| `TOUCH` | Magenta | Touch events |
| `GESTURE` | Orange | Pinch/zoom gestures |
| `RESIZE` | Green | Window resize events |
| `ORIENTATION` | Green | Device rotation |
| `LIFECYCLE` | Red | Page lifecycle (unload/hide) |
| `VUE` | Green | Vue app events |
| `FLIPBOOK` | Green | Flipbook interactions |
| `ZOOM` | Green | Zoom button clicks |

## Key Patterns to Watch

### Memory Leak Pattern:
```
MEMORY: percentage: 65.23
MEMORY: percentage: 72.45
MEMORY: percentage: 81.67  ← Getting high
MEMORY: percentage: 89.32  ← Critical
LIFECYCLE: Page about to unload (CRASH?)
```

### Gesture Conflict Pattern:
```
GESTURE: Pinch/zoom gesture detected
RESIZE: Window resize (multiple rapid resizes)
TOUCH: Touch start (unusual touch patterns)
LIFECYCLE: Page about to unload (CRASH?)
```

### Page-Specific Pattern:
```
FLIPBOOK: Page flip started {currentPage: 18}  ← Near end
ZOOM: Zoom in clicked
MEMORY: percentage: 85.67  ← High memory
GESTURE: Pinch/zoom gesture detected
LIFECYCLE: Page about to unload (CRASH?)
```

## Testing Checklist

- [ ] Load page and open debug panel (📊)
- [ ] Navigate to page 1, perform zoom gesture - note behavior
- [ ] Navigate to middle page, perform zoom gesture - note behavior
- [ ] Navigate to last 3 pages, perform zoom gesture - note behavior
- [ ] Screenshot debug panel showing memory usage
- [ ] Screenshot debug panel if/when crash occurs
- [ ] Check localStorage for crash logs after reload

## Disabling Debug Mode

To disable the debug panel in production, comment out or remove the debugger initialization in `src/js/app.js`:

```javascript
// Comment these lines:
// const debugger = new MobileDebugger();
// window.mobileDebugger = debugger;
```

Or set a flag based on URL parameter:
```javascript
const enableDebug = new URLSearchParams(window.location.search).get('debug') === 'true';
if (enableDebug) {
    const debugger = new MobileDebugger();
    window.mobileDebugger = debugger;
}
```

Then access with: `https://your-site.com/?debug=true&bgColor=transparent`
