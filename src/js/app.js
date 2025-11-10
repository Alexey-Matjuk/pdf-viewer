/**
 * Main application entry point
 */

import { FlipBook } from './FlipBook.js';

// Initialize flipbook when DOM is ready
(async function() {
    const bookContainer = document.getElementById('book');
    
    if (!bookContainer) {
        console.error('Book container element not found');
        return;
    }

    const flipbook = new FlipBook(bookContainer);
    await flipbook.init();
})();
