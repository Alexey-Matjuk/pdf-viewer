/**
 * Main application entry point - Vue 3 App with flipbook-vue
 */

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
            lastHeight: 0
        };
    },
    async mounted() {
        console.log('Vue app mounted successfully');
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
                // If in iframe, request parent to make iframe fullscreen
                if (window.parent !== window) {
                    window.parent.postMessage({ 
                        type: 'request-fullscreen'
                    }, '*');
                } else {
                    // Direct fullscreen
                    const elem = document.documentElement;
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                    }
                }
            } else {
                // Exit fullscreen - also works for iframe
                if (window.parent !== window) {
                    window.parent.postMessage({ 
                        type: 'exit-fullscreen'
                    }, '*');
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
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
            return h('div', { style: { width: '100%', height: '100%', position: 'relative' } }, [
                h(Flipbook, {
                    class: 'flipbook',
                    pages: this.pages,
                    zooms: [1, 2],
                    ambient: 1
                }),
                // Fullscreen button
                h('button', {
                    class: 'fullscreen-btn',
                    onClick: this.toggleFullscreen,
                    title: this.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
                }, this.isFullscreen ? '╳' : '⛶')
            ]);
        }
        
        console.log('Rendering null - no conditions met');
        return h('div', { class: 'loading' }, 'Waiting for pages...');
    }
});

// Mount Vue app
app.mount('#app');
