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
      pointer-events: auto;
      border-bottom: 3px solid #0f0;
      user-select: text;
      -webkit-user-select: text;
    `;
    
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
    this.overlay.appendChild(copyBtn);
    
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
        while (this.logList.children.length > 60) {
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
    if (this.logList) this.logList.innerHTML = '';
    console.log('🗑️ Logs cleared');
  }
};

// Initialize overlay immediately
persistentLog.init();

// Expose globally for manual inspection
window.persistentLog = persistentLog;

persistentLog.add('✅', 'Session started', { time: new Date().toISOString() });

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
            currentPage: 0
        };
    },
    async mounted() {
        persistentLog.add('✅', 'Vue app mounted');
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
                
                if (loadedPages.length === 0) {
                    throw new Error('No pages found in assets directory');
                }
                
                // Store all page URLs
                this.allPageUrls = [...loadedPages];
                
                // Create placeholder (1x1 transparent pixel)
                const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                
                // Initialize pages array with placeholders
                this.pages = new Array(loadedPages.length).fill(placeholder);
                
                // Load first 3 pages immediately
                this.loadPageRange(0, 2);
                
                this.loading = false;
                
                persistentLog.add('📚', 'Pages loaded', { count: this.allPageUrls.length });
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
        
        loadPageRange(start, end) {
            // Load pages from start to end index
            for (let i = start; i <= end && i < this.allPageUrls.length; i++) {
                if (this.pages[i] && this.pages[i].startsWith('data:image/gif')) {
                    // Replace placeholder with actual page
                    this.pages[i] = this.allPageUrls[i];
                    persistentLog.add('📄', `Loaded page ${i + 1}`);
                }
            }
        },
        
        unloadPageRange(start, end) {
            // Unload pages by replacing with placeholder
            const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            for (let i = start; i <= end && i < this.allPageUrls.length; i++) {
                if (this.pages[i] && !this.pages[i].startsWith('data:image/gif')) {
                    this.pages[i] = placeholder;
                    persistentLog.add('🗑️', `Unloaded page ${i + 1}`);
                }
            }
        },
        
        onFlipStart() {
            const currentPage = this.$refs.flipbook?.page;
            const totalPages = this.allPageUrls.length;
            
            if (!currentPage) return;
            
            this.currentPage = currentPage;
            persistentLog.add('📖', 'Flipping', { page: currentPage, total: totalPages });
            
            // Load current page + 2 pages ahead, unload pages further back
            const loadStart = Math.max(0, currentPage - 1);
            const loadEnd = Math.min(totalPages - 1, currentPage + 2);
            
            // Load needed pages
            this.loadPageRange(loadStart, loadEnd);
            
            // Unload pages that are far away (more than 3 pages away)
            if (currentPage > 4) {
                this.unloadPageRange(0, currentPage - 4);
            }
            if (currentPage < totalPages - 4) {
                this.unloadPageRange(currentPage + 4, totalPages - 1);
            }
            
            // Log memory
            if (performance.memory) {
                const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                persistentLog.add('💾', 'Memory', { MB: usedMB, page: currentPage });
            }
            
            // Warn if on last few pages (where crashes are more common)
            if (currentPage >= totalPages - 3) {
                persistentLog.add('⚠️', 'Near end of book!', { page: currentPage, total: totalPages });
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
            
            // Detect mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            return h('div', { style: { backgroundColor: this.backgroundColor, width: '100%', height: '100%', position: 'relative' } }, [
                h(Flipbook, {
                    class: 'flipbook',
                    pages: this.pages,
                    zooms: [1, 2],
                    ambient: 1,
                    clickToZoom: false,
                    ref: 'flipbook',
                    // Mobile optimization: reduce preload and rendering quality
                    ...(isMobile ? {
                        nPolygons: 3,  // Reduce 3D complexity
                        perspective: 1000,  // Reduce perspective depth
                        gloss: 0  // Disable glossy effects
                    } : {}),
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
