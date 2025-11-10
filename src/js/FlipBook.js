/**
 * FlipBook class - Main controller for the flipbook application
 */

import { CONFIG } from './config.js';
import {
    loadPageUrls,
    loadTemplate,
    getImageAspectRatio,
    showError,
    hideLoading,
} from './utils.js';
import { createPageElements, calculatePageDimensions } from './pageRenderer.js';

export class FlipBook {
    constructor(containerElement) {
        this.container = containerElement;
        this.pageFlipInstance = null;
        this.pages = [];
    }

    /**
     * Initialize the flipbook
     */
    async init() {
        try {
            this.pages = await loadPageUrls();
            if (this.pages.length === 0) {
                showError('No pages found in assets directory.');
                return;
            }

            // Load page template
            const template = await loadTemplate(CONFIG.TEMPLATE_PATH);

            // Get image aspect ratio from first page
            const imageAspectRatio = await getImageAspectRatio(this.pages[0]);

            createPageElements(this.pages, template, this.container);

            const dimensions = calculatePageDimensions(
                imageAspectRatio,
                window.innerWidth,
                window.innerHeight
            );

            this.initPageFlip(dimensions);
            hideLoading();
        } catch (error) {
            console.error('Error initializing flipbook:', error);
            showError('Failed to load flipbook. Please try again.');
        }
    }

    /**
     * Initialize the PageFlip library
     * @param {{width: number, height: number}} dimensions - Page dimensions
     */
    initPageFlip(dimensions) {
        const options = {
            ...CONFIG.PAGEFLIP_OPTIONS,
            width: dimensions.width,
            height: dimensions.height,            
        };

        this.pageFlipInstance = new St.PageFlip(this.container, options);
        this.pageFlipInstance.loadFromHTML(document.querySelectorAll('.page'));

        // Store reference globally for debugging
        window.pageFlip = this.pageFlipInstance;
    }

    /**
     * Get the PageFlip instance
     * @returns {Object} PageFlip instance
     */
    getPageFlip() {
        return this.pageFlipInstance;
    }

    /**
     * Get current page number
     * @returns {number} Current page index
     */
    getCurrentPage() {
        return this.pageFlipInstance?.getCurrentPageIndex() || 0;
    }

    /**
     * Navigate to specific page
     * @param {number} pageNumber - Page number to navigate to
     */
    goToPage(pageNumber) {
        if (this.pageFlipInstance) {
            this.pageFlipInstance.turnToPage(pageNumber);
        }
    }
}
