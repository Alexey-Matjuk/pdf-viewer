/**
 * Utility functions for the PDF Flipbook Viewer
 */

import { CONFIG } from './config.js';

/**
 * Get URL parameters from the current page
 * @returns {URLSearchParams} URL parameters object
 */
export function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

/**
 * Generate page URL based on index
 * @param {number} index - Page index
 * @returns {string} Full page URL
 */
export function getPageUrl(index) {
    const paddedIndex = String(index).padStart(CONFIG.PAGE_NUMBER_PADDING, '0');
    return `${CONFIG.PAGES_BASE_PATH}/${CONFIG.PAGE_FILE_PREFIX}${paddedIndex}${CONFIG.PAGE_FILE_EXTENSION}`;
}

/**
 * Check if a URL exists by making a HEAD request
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if URL exists
 */
export async function urlExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Load all page URLs from the assets directory
 * @returns {Promise<string[]>} Array of page URLs
 */
export async function loadPageUrls() {
    const pages = [];
    let pageIndex = 0;

    while (true) {
        const pageUrl = getPageUrl(pageIndex);
        const exists = await urlExists(pageUrl);
        
        if (!exists) {
            break;
        }
        
        pages.push(pageUrl);
        pageIndex++;
    }

    return pages;
}

/**
 * Load template HTML from file
 * @param {string} templatePath - Path to template file
 * @returns {Promise<string>} Template HTML content
 */
export async function loadTemplate(templatePath) {
    const response = await fetch(templatePath);
    if (!response.ok) {
        throw new Error(`Failed to load template: ${templatePath}`);
    }
    return await response.text();
}

/**
 * Get image aspect ratio
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<number>} Aspect ratio (width/height)
 */
export async function getImageAspectRatio(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
            resolve(img.width / img.height);
        };
        
        img.onerror = () => {
            resolve(1);
        };
        
        img.src = imageUrl;
    });
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
export function showError(message) {
    document.body.innerHTML = `<div class="error"><h1>${message}</h1></div>`;
}

/**
 * Hide loading screen
 */
export function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}
