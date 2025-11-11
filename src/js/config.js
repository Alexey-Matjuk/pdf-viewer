/**
 * Configuration constants for the PDF Flipbook Viewer
 */

export const CONFIG = {
    // Directory path for PDF pages
    PAGES_BASE_PATH: 'assets',
    
    // Page file naming pattern
    PAGE_FILE_PREFIX: 'page_',
    PAGE_FILE_EXTENSION: '.jpg',
    PAGE_NUMBER_PADDING: 2,
    
    // Template path
    TEMPLATE_PATH: 'src/templates/page-template.html',
    
    // PageFlip library settings
    PAGEFLIP_OPTIONS: {
        size: "fixed",
        showCover: false,
        flippingTime: 2000,
        startZIndex: 0,
        mobileScrollSupport: true,
        usePortrait: false
    }
};
