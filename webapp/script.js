// MinIO endpoint configuration
const MINIO_ENDPOINT = 'http://localhost:9000';
const BUCKET_NAME = 'images';

// Initialize OpenSeadragon viewers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeViewers();
});

function initializeViewers() {
    // Initialize Deep Zoom Image viewer (left)
    initializeDZIViewer();
    
    // Initialize regular image viewer (right)
    initializeRegularViewer();
}

function initializeDZIViewer() {
    const dziStatus = document.getElementById('dzi-status');
    
    try {
        const dziViewer = OpenSeadragon({
            id: 'dzi-viewer',
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1.0/build/openseadragon/images/',
            tileSources: `${MINIO_ENDPOINT}/${BUCKET_NAME}/sample1.dzi`,
            showNavigator: true,
            navigatorPosition: 'TOP_RIGHT',
            showHomeControl: true,
            showZoomControl: true,
            showFullPageControl: true,
            zoomInButton: null,
            zoomOutButton: null,
            homeButton: null,
            fullPageButton: null,
            nextButton: null,
            previousButton: null,
        });
        
        dziViewer.addHandler('open', function() {
            dziStatus.textContent = 'DZI loaded successfully!';
            dziStatus.className = 'status success';
        });
        
        dziViewer.addHandler('open-failed', function() {
            dziStatus.textContent = 'Failed to load DZI. Check if image processing completed.';
            dziStatus.className = 'status error';
        });
        
    } catch (error) {
        console.error('Error initializing DZI viewer:', error);
        dziStatus.textContent = 'Error initializing DZI viewer';
        dziStatus.className = 'status error';
    }
}

function initializeRegularViewer() {
    const regularStatus = document.getElementById('regular-status');
    
    try {
        const regularViewer = OpenSeadragon({
            id: 'regular-viewer',
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1.0/build/openseadragon/images/',
            tileSources: {
                type: 'image',
                url: `${MINIO_ENDPOINT}/${BUCKET_NAME}/sample2.jpg`
            },
            showNavigator: true,
            navigatorPosition: 'TOP_RIGHT',
            showHomeControl: true,
            showZoomControl: true,
            showFullPageControl: true,
            zoomInButton: null,
            zoomOutButton: null,
            homeButton: null,
            fullPageButton: null,
            nextButton: null,
            previousButton: null,
        });
        
        regularViewer.addHandler('open', function() {
            regularStatus.textContent = 'Regular image loaded successfully!';
            regularStatus.className = 'status success';
        });
        
        regularViewer.addHandler('open-failed', function() {
            regularStatus.textContent = 'Failed to load regular image from MinIO.';
            regularStatus.className = 'status error';
        });
        
    } catch (error) {
        console.error('Error initializing regular viewer:', error);
        regularStatus.textContent = 'Error initializing regular image viewer';
        regularStatus.className = 'status error';
    }
}

// Helper function to check MinIO connectivity
function checkMinIOConnectivity() {
    fetch(`${MINIO_ENDPOINT}/minio/health/live`)
        .then(response => {
            if (response.ok) {
                console.log('MinIO is accessible');
            } else {
                console.warn('MinIO may not be fully ready');
            }
        })
        .catch(error => {
            console.error('MinIO connectivity check failed:', error);
        });
}

// Check connectivity on load
checkMinIOConnectivity();
