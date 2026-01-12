/**
 * Main application entry point - Vue 3 App with flipbook-vue
 */

// ==== SIMPLE DEBUG LOGGING ====
// Monitor critical events for debugging mobile zoom crash

// Track gesture events (pinch/zoom)
document.addEventListener('gesturestart', (e) => {
    console.warn('🔍 GESTURE START - scale:', e.scale, 'rotation:', e.rotation);
}, { passive: true });

document.addEventListener('gesturechange', (e) => {
    console.warn('🔍 GESTURE CHANGE - scale:', e.scale);
}, { passive: true });

document.addEventListener('gestureend', (e) => {
    console.warn('🔍 GESTURE END - scale:', e.scale);
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
    console.error('⚠️ PAGE UNLOADING - Possible crash!');
});

window.addEventListener('pagehide', () => {
    console.error('⚠️ PAGE HIDDEN - Possible crash!');
});

// Monitor resize events (can indicate zoom issues)
let resizeCount = 0;
window.addEventListener('resize', () => {
    resizeCount++;
    console.log(`📐 Resize #${resizeCount}: ${window.innerWidth}x${window.innerHeight}`);
});

// Catch errors
window.addEventListener('error', (e) => {
    console.error('❌ ERROR:', e.message, 'at', e.filename, 'line', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ UNHANDLED REJECTION:', e.reason);
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
            error: null,
            isFullscreen: false,
            backgroundColor: '#333',
            lastHeight: 0
        };
    },
    async mounted() {
        console.log('✅ Vue app mounted');
        console.log('📱 Device:', navigator.userAgent);
        console.log('📐 Viewport:', `${window.innerWidth}x${window.innerHeight}`, 'Pixel ratio:', window.devicePixelRatio);
        
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
        
        console.log('📚 Pages loaded:', this.pages.length);
        if (performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            console.log('💾 Initial memory:', usedMB, 'MB');
        }
        
        // Send initial height to parent window (for iframe embedding)
        this.$nextTick(() => {
            this.sendHeightToParent();
        });
        
        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', this.onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);
        
        // Listen for messages from parent (for iframe fullscreen state)
        window.addEventListener('message', this.handleParentMessage);
    },
    beforeUnmount() {
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
        async loadPages() {
            try {
                console.log('Starting to load pages...');
                const loadedPages = await loadPageUrls();
                console.log('Raw loaded pages:', loadedPages);
                console.log('Pages length:', loadedPages.length);
                
                // Convert to plain array and ensure it's not empty
                this.pages = [...loadedPages];
                console.log('Pages loaded:', this.pages);
                console.log('this.pages.length:', this.pages.length);
                
                if (this.pages.length === 0) {
                    throw new Error('No pages found in assets directory');
                }
                
                this.loading = false;
            } catch (error) {
                console.error('Error loading pages:', error);
                this.error = error.message;
                this.loading = false;
            }
        },
        onFlipStart() {
            const currentPage = this.$refs.flipbook?.page;
            const totalPages = this.pages.length;
            console.log(`📖 Flipping to page ${currentPage}/${totalPages}`);
            
            // Warn if on last few pages (where crashes are more common)
            if (currentPage && currentPage >= totalPages - 3) {
                console.warn(`⚠️ Near end of book - page ${currentPage}/${totalPages}`);
                if (performance.memory) {
                    const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                    console.warn('💾 Memory at:', usedMB, 'MB');
                }
            }
            
            // Auto zoom out when flipping pages
            if (this.$refs.flipbook && this.$refs.flipbook.canZoomOut) {
                this.$refs.flipbook.zoomOut();
            }
        }
    },
    render() {
        console.log('Render called - loading:', this.loading, 'error:', this.error, 'pages.length:', this.pages.length);
        
        if (this.loading) {
            return h('div', { class: 'loading' }, 'Loading pages...');
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
                    zooms: [1, 2],
                    ambient: 1,
                    clickToZoom: false,
                    ref: 'flipbook',
                    onFlipLeftStart: this.onFlipStart,
                    onFlipRightStart: this.onFlipStart
                }, {
                    default: (slotProps) => {
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
