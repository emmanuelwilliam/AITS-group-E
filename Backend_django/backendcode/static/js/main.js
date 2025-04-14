// Check if the environment is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Django static files loaded successfully');
    
    // Initialize any global variables
    window.DJANGO_STATIC_URL = '/static/';
    
    // Add basic error handling
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.message);
    });

    // Check if root element exists
    const rootElement = document.getElementById('root');
    if (rootElement) {
        console.log('React root element found');
    } else {
        console.error('React root element not found');
    }
});