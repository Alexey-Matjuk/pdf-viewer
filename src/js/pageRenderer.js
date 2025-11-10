/**
 * Page rendering and DOM manipulation functions
 */

/**
 * Create page elements from template
 * @param {string[]} pageUrls - Array of page image URLs
 * @param {string} template - HTML template string
 * @param {HTMLElement} container - Container element to append pages to
 */
export function createPageElements(pageUrls, template, container) {
    pageUrls.forEach((pageUrl, index) => {
        const pageHtml = template
            .replace('{{imageUrl}}', pageUrl)
            .replace('{{pageNumber}}', `Page ${index + 1}`);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pageHtml;
        container.appendChild(tempDiv.firstElementChild);
    });
}

/**
 * Calculate optimal page dimensions based on viewport and image aspect ratio
 * @param {number} imageAspectRatio - Image aspect ratio (width/height)
 * @param {number} viewportWidth - Viewport width
 * @param {number} viewportHeight - Viewport height
 * @returns {{width: number, height: number}} Page dimensions
 */
export function calculatePageDimensions(
    imageAspectRatio,
    viewportWidth,
    viewportHeight,
) {
    let pageWidth, pageHeight;
    
    // Single page mode: fit to viewport
    pageWidth = viewportWidth;
    pageHeight = pageWidth / imageAspectRatio;
    
    // Ensure it doesn't exceed viewport height
    if (pageHeight > viewportHeight) {
        pageHeight = viewportHeight;
        pageWidth = pageHeight * imageAspectRatio;
    }
    
    return { width: pageWidth, height: pageHeight };
}
