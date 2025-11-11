/**
 * Configuration constants for the PDF Flipbook Viewer
 */

export const CONFIG = {
    // Directory path for PDF pages (uses Vite's base URL)
    PAGES_BASE_PATH: `${import.meta.env.BASE_URL}assets`,
    
    // Page file naming pattern
    PAGE_FILE_PREFIX: 'page_',
    PAGE_FILE_EXTENSION: '.jpg',
    PAGE_NUMBER_PADDING: 2
};
