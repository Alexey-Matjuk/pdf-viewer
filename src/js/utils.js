/**
 * Utility functions for the PDF Flipbook Viewer
 */

import { CONFIG } from './config.js';

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
        // Check both status and content-type to ensure it's actually an image
        const contentType = response.headers.get('content-type');
        const isImage = contentType && contentType.startsWith('image/');
        return response.ok && isImage;
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
    const MAX_PAGES = 1000; // Safety limit

    console.log('loadPageUrls: Starting to check for pages...');

    while (pageIndex < MAX_PAGES) {
        const pageUrl = getPageUrl(pageIndex);
        const exists = await urlExists(pageUrl);
        
        if (!exists) {
            console.log(`Stopping at page ${pageIndex}, no more pages found`);
            break;
        }
        
        console.log(`Found page ${pageIndex}: ${pageUrl}`);
        pages.push(pageUrl);
        pageIndex++;
    }

    console.log('Total pages found:', pages.length);
    return pages;
}
