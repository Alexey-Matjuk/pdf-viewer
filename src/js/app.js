/**
 * Main application entry point - Vue 3 App with flipbook-vue
 */

// ==== PERSISTENT CRASH LOGGING WITH VISUAL OVERLAY ====
// Logs survive page reloads/crashes via localStorage AND display on screen

const persistentLog = {
    overlay: null,
    logList: null,

    init() {
        // Create visual overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'debug-overlay';
        this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      max-height: 40vh;
      background: rgba(0,0,0,0.95);
      color: #0f0;
      font-family: monospace;
      font-size: 11px;
      padding: 8px;
      z-index: 999999;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
      display: none; /* Hidden by default */
      pointer-events: auto;
      border-bottom: 3px solid #0f0;
      user-select: text;
      -webkit-user-select: text;
    `;

        // Create toggle button only if debug=true is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const isDebugMode = urlParams.get('debug') === 'true';

        if (!isDebugMode) {
            console.log('📊 Debug mode disabled. Add ?debug=true to URL to enable overlay.');
            return;
        }

        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'debug-toggle-btn';
        toggleBtn.innerHTML = '📊';
        toggleBtn.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      z-index: 1000000;
      background: rgba(0, 255, 0, 0.2);
      color: #0f0;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 20px;
      border: 1px solid #0f0;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    `;
        toggleBtn.onclick = () => {
            const isHidden = this.overlay.style.display === 'none';
            this.overlay.style.display = isHidden ? 'block' : 'none';
            toggleBtn.style.background = isHidden ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 0, 0.2)';
        };
        document.body.appendChild(toggleBtn);

        // Add Clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ CLEAR';
        clearBtn.style.cssText = `
      position: sticky;
      top: 0;
      left: 100px;
      background: #c00;
      color: #fff;
      border: none;
      padding: 8px 12px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 8px;
      margin-left: 8px;
      z-index: 1;
    `;
        clearBtn.onclick = () => this.clear();

        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 COPY ALL';
        copyBtn.style.cssText = `
      position: sticky;
      top: 0;
      left: 0;
      background: #0a0;
      color: #000;
      border: none;
      padding: 8px 12px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 8px;
      z-index: 1;
    `;
        copyBtn.onclick = () => {
            const logs = JSON.parse(localStorage.getItem('crashLogs') || '[]');
            const text = logs.join('\n');

            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.textContent = '✅ COPIED!';
                    setTimeout(() => copyBtn.textContent = '📋 COPY ALL', 2000);
                });
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                copyBtn.textContent = '✅ COPIED!';
                setTimeout(() => copyBtn.textContent = '📋 COPY ALL', 2000);
            }
        };

        const controls = document.createElement('div');
        controls.style.cssText = 'position: sticky; top: 0; background: rgba(0,0,0,0.9); padding: 5px 0; display: flex; gap: 8px;';
        controls.appendChild(copyBtn);
        controls.appendChild(clearBtn);
        this.overlay.appendChild(controls);

        this.logList = document.createElement('div');
        this.logList.style.cssText = 'user-select: text; -webkit-user-select: text;';
        this.overlay.appendChild(this.logList);
        document.body.appendChild(this.overlay);

        // Show previous crash logs
        const previousLogs = JSON.parse(localStorage.getItem('crashLogs') || '[]');
        if (previousLogs.length > 0) {
            const crashHeader = document.createElement('div');
            crashHeader.style.cssText = 'color: #f00; font-weight: bold; margin-bottom: 5px; font-size: 13px; background: rgba(255,0,0,0.2); padding: 5px;';
            crashHeader.textContent = '🚨 CRASH DETECTED - PREVIOUS SESSION LOGS:';
            this.logList.appendChild(crashHeader);

            previousLogs.slice(-15).forEach(log => {
                const logDiv = document.createElement('div');
                logDiv.style.cssText = 'color: #ff0; padding: 2px 0; user-select: text; -webkit-user-select: text;';
                logDiv.textContent = log;
                this.logList.appendChild(logDiv);
            });

            const divider = document.createElement('div');
            divider.style.cssText = 'border-top: 2px solid #f00; margin: 8px 0;';
            this.logList.appendChild(divider);

            const newSessionHeader = document.createElement('div');
            newSessionHeader.style.cssText = 'color: #0f0; font-weight: bold; margin-bottom: 5px;';
            newSessionHeader.textContent = '--- NEW SESSION ---';
            this.logList.appendChild(newSessionHeader);
        }
    },

    add(type, message, data = {}) {
        const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
        const entry = `[${timestamp}] ${type} ${message} ${JSON.stringify(data)}`;

        try {
            const logs = JSON.parse(localStorage.getItem('crashLogs') || '[]');
            logs.push(entry);
            localStorage.setItem('crashLogs', JSON.stringify(logs.slice(-100))); // Keep last 100
            console[type === '⚠️' ? 'warn' : 'log'](type, message, data);

            // Add to visual overlay
            if (this.logList) {
                const logDiv = document.createElement('div');
                logDiv.style.cssText = `color: ${type === '⚠️' ? '#f80' : '#0f0'}; padding: 2px 0; user-select: text; -webkit-user-select: text;`;
                logDiv.textContent = entry;
                this.logList.appendChild(logDiv);

                // Auto-scroll to bottom
                this.overlay.scrollTop = this.overlay.scrollHeight;

                // Keep only last 50 visible entries
                while (this.logList.children.length > 200) {
                    this.logList.removeChild(this.logList.firstChild);
                }
            }
        } catch (e) {
            console.error('Log storage failed:', e);
        }
    },

    show() {
        const logs = JSON.parse(localStorage.getItem('crashLogs') || '[]');
        console.log('📋 FULL CRASH HISTORY:\n' + logs.join('\n'));
        return logs;
    },

    clear() {
        localStorage.removeItem('crashLogs');
        if (this.logList) {
            // Keep only headers if present
            while (this.logList.firstChild) {
                this.logList.removeChild(this.logList.firstChild);
            }
        }
        console.log('🗑️ Logs cleared');
    }
};

// Initialize overlay immediately
persistentLog.init();

// Expose globally for manual inspection
window.persistentLog = persistentLog;

persistentLog.add('✅', 'Session started');

// ==== SIMPLE DEBUG LOGGING ====
// Monitor critical events for debugging mobile zoom crash

// Track gesture events (monitor only)
document.addEventListener('gesturestart', (e) => {
    persistentLog.add('🔍', 'GESTURE START', { scale: e.scale, rotation: e.rotation });
}, { passive: true });

document.addEventListener('gesturechange', (e) => {
    // Only log every 10th event to reduce overhead
    if (Math.random() < 0.1) {
        persistentLog.add('🔍', 'GESTURE CHANGE', { scale: e.scale });
    }
}, { passive: true });

document.addEventListener('gestureend', (e) => {
    persistentLog.add('🔍', 'GESTURE END', { scale: e.scale });
}, { passive: true });

// Monitor memory if available
if (performance.memory) {
    setInterval(() => {
        const mem = performance.memory;
        const usedMB = (mem.usedJSHeapSize / 1048576).toFixed(2);
        const limitMB = (mem.jsHeapSizeLimit / 1048576).toFixed(2);
        const percentage = ((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100).toFixed(1);
        console.log(`💾 Memory: ${usedMB}MB / ${limitMB}MB (${percentage}%)`);
    }, 10000); // Every 10 seconds
}

// Detect page about to crash/reload
window.addEventListener('beforeunload', (e) => {
    persistentLog.add('⚠️', 'PAGE UNLOADING - Crash or navigation!');
});

window.addEventListener('pagehide', () => {
    persistentLog.add('⚠️', 'PAGE HIDDEN - Crash or navigation!');
});

// Monitor resize events (can indicate zoom issues)
let resizeCount = 0;
window.addEventListener('resize', () => {
    resizeCount++;
    persistentLog.add('📐', `Resize #${resizeCount}`, { width: window.innerWidth, height: window.innerHeight });
});

// Catch errors
window.addEventListener('error', (e) => {
    persistentLog.add('⚠️', 'JavaScript Error', { message: e.message, file: e.filename, line: e.lineno });
});

window.addEventListener('unhandledrejection', (e) => {
    persistentLog.add('⚠️', 'Unhandled Rejection', { reason: String(e.reason) });
});

import { createApp, h } from 'vue';
import Flipbook from '@evomark/flipbook-vue';
import '../../node_modules/@evomark/flipbook-vue/dist/flipbook-vue.css';
import { loadPageUrls } from './utils.js';

// Create Vue app
const app = createApp({
    components: {
        Flipbook
    },
    data() {
        return {
            loading: true,
            pages: [],
            allPageUrls: [], // Store all page URLs
            error: null,
            isFullscreen: false,
            backgroundColor: '#333',
            lastHeight: 0,
            lastHeight: 0,
            isInitialized: false,
            currentPage: (() => {
                const hashPage = parseInt(window.location.hash.replace('#', ''));
                return (!isNaN(hashPage) && hashPage > 0) ? hashPage : 1;
            })()
        };
    },
    async mounted() {
        persistentLog.add('✅', 'Vue app mounted');

        // Set initialized after short delay to allow startPage to take effect
        setTimeout(() => {
            this.isInitialized = true;
        }, 500);
        persistentLog.add('📱', 'Device', { ua: navigator.userAgent });
        persistentLog.add('📐', 'Viewport', { width: window.innerWidth, height: window.innerHeight, pixelRatio: window.devicePixelRatio });

        // Detect if we're in an iframe and delay initialization
        const isInIframe = window.self !== window.top;
        const initDelay = isInIframe ? 300 : 0;

        // Get background color from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const bgColor = urlParams.get('bgColor');
        if (bgColor) {
            // Handle color keywords (transparent, etc.) and hex colors
            this.backgroundColor = bgColor.startsWith('#') || /^[a-z]+$/i.test(bgColor)
                ? bgColor
                : `#${bgColor}`;
        }

        // Apply background color to body and app container
        document.body.style.backgroundColor = this.backgroundColor;
        this.$nextTick(() => {
            if (this.$el) {
                this.$el.style.backgroundColor = this.backgroundColor;
            }
        });

        // Delay loading if in iframe to prevent SSR conflicts
        if (initDelay > 0) {
            console.log('Detected iframe embedding, delaying initialization by', initDelay, 'ms');
            await new Promise(resolve => setTimeout(resolve, initDelay));
        }

        await this.loadPages();

        // Send initial height to parent window (for iframe embedding)
        this.$nextTick(() => {
            this.sendHeightToParent();
        });

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', this.onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);

        // Listen for messages from parent (for iframe fullscreen state)
        window.addEventListener('message', this.handleParentMessage);

        // Listen for hash changes (browser back/forward)
        window.addEventListener('hashchange', this.onHashChange);

        // Listen for keyboard navigation
        window.addEventListener('keydown', this.onKeyDown);

        // Register Service Worker for caching
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                persistentLog.add('👷', 'Service Worker registered', { scope: registration.scope });
            } catch (error) {
                persistentLog.add('⚠️', 'Service Worker registration failed', { error: error.message });
            }
        }
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('hashchange', this.onHashChange);
        document.removeEventListener('fullscreenchange', this.onFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
        window.removeEventListener('message', this.handleParentMessage);
    },
    methods: {
        toggleFullscreen() {
            if (!this.isFullscreen) {
                // Try native fullscreen first
                const elem = document.documentElement;
                let requestFs = elem.requestFullscreen ||
                    elem.webkitRequestFullscreen ||
                    elem.mozRequestFullScreen ||
                    elem.msRequestFullscreen;

                if (requestFs) {
                    requestFs.call(elem).catch(() => {
                        // If native fails (e.g. no allowfullscreen), try fake fullscreen
                        this.toggleFakeFullscreen();
                    });
                } else {
                    this.toggleFakeFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {
                        this.toggleFakeFullscreen();
                    });
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else {
                    this.toggleFakeFullscreen();
                }
            }
        },
        toggleFakeFullscreen() {
            // Request parent to toggle fake fullscreen class
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'toggle-fake-fullscreen'
                }, '*');
                // Optimistically update state
                this.isFullscreen = !this.isFullscreen;
            }
        },
        handleParentMessage(event) {
            // Update fullscreen state when parent notifies us
            if (event.data.type === 'fullscreen-state') {
                this.isFullscreen = event.data.isFullscreen;
            }
        },
        onFullscreenChange() {
            this.isFullscreen = !!(document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement);
        },
        sendHeightToParent() {
            if (window.parent !== window) {
                // Get the actual flipbook element height instead of scrollHeight
                const flipbookEl = document.querySelector('.flipbook');
                if (flipbookEl) {
                    const height = flipbookEl.offsetHeight + 40; // Add padding
                    // Only send if height actually changed
                    if (height !== this.lastHeight) {
                        this.lastHeight = height;
                        window.parent.postMessage({
                            type: 'flipbook-height',
                            height: height
                        }, '*');
                    }
                }
            }
        },
        onHashChange() {
            const hashPage = parseInt(window.location.hash.replace('#', ''));
            if (!isNaN(hashPage) && hashPage > 0 && hashPage !== this.currentPage) {
                this.currentPage = hashPage;
                // Trigger loading logic for the new page
                // this.updatePagesAround(hashPage);
            }
        },
        onKeyDown(e) {
            // Ignore if input/textarea is focused
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            if (e.key === 'ArrowLeft') {
                const flipbook = this.$refs.flipbook;
                if (flipbook && typeof flipbook.flipLeft === 'function') {
                    flipbook.flipLeft();
                } else if (flipbook && typeof flipbook.goToPage === 'function') {
                    flipbook.goToPage(this.currentPage - 1);
                } else {
                    // Fallback: Click the button if methods aren't exposed
                    const btn = document.querySelector('button[title="Previous Page"]');
                    if (btn && !btn.disabled) btn.click();
                }
            } else if (e.key === 'ArrowRight') {
                const flipbook = this.$refs.flipbook;
                if (flipbook && typeof flipbook.flipRight === 'function') {
                    flipbook.flipRight();
                } else if (flipbook && typeof flipbook.goToPage === 'function') {
                    flipbook.goToPage(this.currentPage + 1);
                } else {
                    // Fallback: Click the button if methods aren't exposed
                    const btn = document.querySelector('button[title="Next Page"]');
                    if (btn && !btn.disabled) btn.click();
                }
            }
        },
        async loadPages() {
            try {
                persistentLog.add('🔄', 'Starting to load pages (Lazy Loading enabled)...');
                const loadedPages = await loadPageUrls();

                if (loadedPages.length === 0) {
                    throw new Error('No pages found in assets directory');
                }

                // Store all page URLs for future loading
                this.allPageUrls = [...loadedPages];

                // Create a null-filled array of the correct length (lazy loading)
                this.pages = new Array(this.allPageUrls.length).fill(null);
                persistentLog.add('🔄', '*** Loaded pages', this.pages.length);

                // Initial Load using the new Smart Strategy
                this.updatePagesAround(this.currentPage);

                this.loading = false;

                persistentLog.add('📚', 'Initialization complete', {
                    total: this.allPageUrls.length,
                    loaded: this.pages.filter(p => p && !p.startsWith('data:')).length
                });

                if (performance.memory) {
                    const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                    persistentLog.add('💾', 'Initial memory', { MB: usedMB });
                }
            } catch (error) {
                console.error('Error loading pages:', error);
                this.error = error.message;
                this.loading = false;
            }
        },

        getVisibleIndices(page) {
            const leftIndex = page - 1;
            const rightIndex = leftIndex + 1;
            return [leftIndex, rightIndex].filter(i => i >= 0 && i < this.allPageUrls.length);
        },

        updatePagesAround(targetPage) {
            // targetPage is the page we want to load for (either current or next)
            const currentPage = targetPage || this.$refs.flipbook?.page || this.currentPage || 1;

            // Update state
            this.currentPage = currentPage;

            // Update URL hash without scrolling
            if (window.location.hash !== `#${currentPage}`) {
                history.replaceState(null, null, `#${currentPage}`);
            }

            // 1. IMMEDIATE: Load ONLY visible pages
            const visibleIndices = this.getVisibleIndices(currentPage);
            let loadedCount = 0;
            visibleIndices.forEach(i => {
                if (!this.pages[i]) {
                    this.pages.splice(i, 1, this.allPageUrls[i]);
                    loadedCount++;
                }
            });

            if (loadedCount > 0) {
                persistentLog.add('⚡️', `Immediate load: ${loadedCount} pages`, { indices: visibleIndices });
            }

            // 2. DEFERRED: Preload neighbors (Smart Preloading)
            // Cancel any pending preload
            if (this.preloadTimer) clearTimeout(this.preloadTimer);

            this.preloadAll();
            // this.preloadNeighbors(currentPage);

            persistentLog.add('📖', 'Flipping', {
                page: currentPage,
                loadedValues: this.pages.filter(p => p && !p.startsWith('data:')).length
            });

            // Log memory usage
            if (performance.memory) {
                const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                persistentLog.add('💾', 'Memory', { usedMB, page: currentPage });
            }

            // Sync Flipbook component state (required for deep linking/hash changes)
            // if (this.$refs.flipbook && typeof this.$refs.flipbook.goToPage === 'function') {
            //     this.$refs.flipbook.goToPage(currentPage);
            // }
        },

        preloadAll() {
            let preloaded = 0;
            this.pages.forEach((p, i) => {
                if (!p) {
                    this.pages.splice(i, 1, this.allPageUrls[i]);
                    preloaded++;
                }
            });

            persistentLog.add('🔄', `Preloaded all pages: ${preloaded} pages loaded`);
        },

        preloadNeighbors(centerPage) {
            // Preload strategy:
            // Keep: Current Spread
            // Load: Next Spread (1-2 pages)
            // Load: Prev Spread (1-2 pages)
            // Load: Always first page (0)

            const visible = this.getVisibleIndices(centerPage);
            persistentLog.add('🔄', `Visible indices ${visible}`);
            const toKeep = new Set(visible);

            // Add Next Spread
            const nextSpreadIndices = this.getVisibleIndices(centerPage + 2);
            nextSpreadIndices.forEach(i => toKeep.add(i));

            // Add Prev Spread
            const prevSpreadIndices = this.getVisibleIndices(centerPage - 2);
            prevSpreadIndices.forEach(i => toKeep.add(i));

            // Always keep first page
            toKeep.add(0)
            persistentLog.add('🔄', `Indices to keep: ${Array.from(toKeep)}`);

            // Execute Loading
            let preloaded = 0;
            toKeep.forEach(i => {
                if (i >= 0 && i < this.allPageUrls.length) {
                    if (!this.pages[i]) {
                        this.pages.splice(i, 1, this.allPageUrls[i]);
                        preloaded++;
                    }
                }
            });

            if (preloaded > 0) {
                persistentLog.add('🔄', `Preloaded ${preloaded} neighbor pages`);
            }

            // Optional: Unload distant pages to save memory?
            // For now, let's keep it simple and additive as per browser cache.
            // If memory is an issue, we can enable unloading later.
            // this.unloadDistant(toKeep);
        }
    },
    render() {
        if (this.loading) {
            return h('div', { class: 'loading-container' }, [
                h('div', { class: 'loading-spinner' }),
                h('div', 'Loading pages...')
            ]);
        }

        if (this.error) {
            return h('div', {
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#ff4444',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '10px'
                }
            }, [
                h('h2', 'Error'),
                h('p', this.error)
            ]);
        }

        if (this.pages.length > 0) {
            console.log('Rendering flipbook with pages:', this.pages.length);

            return h('div', { style: { backgroundColor: this.backgroundColor, width: '100%', height: '100%', position: 'relative' } }, [
                h(Flipbook, {
                    class: 'flipbook',
                    pages: this.pages,
                    ambient: 1,
                    clickToZoom: true,
                    startPage: this.currentPage,
                    ref: 'flipbook',
                    onFlipLeftStart: (page) => {
                        persistentLog.add('◀️', 'Flip Left Start', { from: page });
                    },
                    onFlipRightStart: (page) => {
                        persistentLog.add('▶️', 'Flip Right Start', { from: page });
                    },
                    // End events to ensure final state is caught
                    onFlipLeftEnd: (page) => {
                        persistentLog.add('◀️', 'Flip Left End', { to: page });
                        // this.$nextTick(() => {
                        //     this.updatePagesAround(page);
                        // });
                    },
                    onFlipRightEnd: (page) => {
                        persistentLog.add('▶️', 'Flip Right End', { to: page });
                        // this.$nextTick(() => {
                        //     this.updatePagesAround(page);
                        // });
                    }
                }, {
                    default: (slotProps) => {
                        persistentLog.add('🔄', `this.pages`, this.pages);
                        persistentLog.add('🔄', `slotProps`, slotProps);

                        // DEBUG: Monitor scroll dimensions during interactions
                        if (this.isInitialized && slotProps.canZoomOut) {
                            const viewport = this.$refs.flipbook?.$refs?.viewport;
                            if (viewport && Math.random() < 0.05) { // Throttle
                                console.log('🔍 Zoom Scroll:', {
                                    scrollLeft: viewport.scrollLeft,
                                    scrollWidth: viewport.scrollWidth,
                                    clientWidth: viewport.clientWidth
                                });
                            }
                        }

                        return [
                            // Bottom Controls Container
                            h('div', { class: 'zoom-controls' }, [
                                // Previous Button
                                h('button', {
                                    class: 'control-btn',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        slotProps.flipLeft();
                                    },
                                    disabled: !slotProps.canFlipLeft,
                                    title: 'Previous Page',
                                    innerHTML: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>'
                                }),

                                // Page Counter
                                h('div', { class: 'page-counter' },
                                    `${slotProps.page} / ${slotProps.numPages}`
                                ),

                                // Next Button
                                h('button', {
                                    class: 'control-btn',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        slotProps.flipRight();
                                    },
                                    disabled: !slotProps.canFlipRight,
                                    title: 'Next Page',
                                    innerHTML: '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>'
                                }),

                                // Separator
                                h('div', { class: 'separator' }),

                                // Zoom Out
                                h('button', {
                                    class: 'control-btn',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        console.log('🔍 Zoom out - page', slotProps.page);
                                        slotProps.zoomOut();
                                    },
                                    disabled: !slotProps.canZoomOut,
                                    title: 'Zoom Out',
                                    innerHTML: '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>'
                                }),

                                // Zoom In
                                h('button', {
                                    class: 'control-btn',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        console.log('🔍 Zoom in - page', slotProps.page);
                                        if (performance.memory) {
                                            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                                            console.log('💾 Memory:', usedMB, 'MB');
                                        }
                                        slotProps.zoomIn();
                                    },
                                    disabled: !slotProps.canZoomIn,
                                    title: 'Zoom In',
                                    innerHTML: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
                                }),

                                // Separator
                                h('div', { class: 'separator' }),

                                // Fullscreen Button
                                h('button', {
                                    class: 'control-btn',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        this.toggleFullscreen();
                                    },
                                    title: this.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
                                    innerHTML: this.isFullscreen
                                        ? '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
                                        : '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>'
                                })
                            ])
                        ];
                    }
                })
            ]);
        }

        console.log('Rendering null - no conditions met');
        return h('div', { class: 'loading' }, 'Waiting for pages...');
    }
});

// Mount Vue app
app.mount('#app');
