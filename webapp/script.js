// MinIO endpoint configuration
const MINIO_ENDPOINT = 'http://localhost:9090';
const BUCKET_NAME = 'images';

// Global viewers for overlay creation
let dziViewer = null;
let regularViewer = null;

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
        dziViewer = OpenSeadragon({
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
            
            // Create overlays after image loads
            createCanvasOverlay(dziViewer, 'dzi');
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
        regularViewer = OpenSeadragon({
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
            
            // Create overlays after image loads
            createCanvasOverlay(regularViewer, 'regular');
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

// Create canvas overlays for a viewer
function createCanvasOverlay(viewer, viewerType) {
    console.log(`Creating overlays for ${viewerType} viewer`);
    
    // Create overlay 1 (left of center) - red diamond
    createPolygonOverlay(viewer, generatePolygonPoints1(), 'rgba(255, 0, 0, 0.6)', '#ff0000');
    
    // Create overlay 2 (right of center) - green triangle  
    createPolygonOverlay(viewer, generatePolygonPoints2(), 'rgba(0, 255, 0, 0.6)', '#00ff00');
    
    console.log(`Created overlays for ${viewerType} viewer`);
}

// Create a single polygon overlay using canvas
function createPolygonOverlay(viewer, points, fillColor, strokeColor) {
    // Calculate bounding box for the polygon
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Create canvas sized to the bounding box
    const canvas = document.createElement('canvas');
    canvas.width = 300;  // Fixed size for crisp rendering
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    
    // Transform points to canvas coordinates (relative to bounding box)
    const canvasPoints = points.map(p => ({
        x: ((p.x - minX) / width) * canvas.width,
        y: ((p.y - minY) / height) * canvas.height
    }));
    
    // Draw polygon
    ctx.beginPath();
    ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
    for (let i = 1; i < canvasPoints.length; i++) {
        ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
    }
    ctx.closePath();
    
    // Style the polygon
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    
    // Add overlay to viewer
    viewer.addOverlay({
        element: canvas,
        location: new OpenSeadragon.Rect(minX, minY, width, height)
    });
    
    console.log(`Added overlay at position (${minX}, ${minY}) with size (${width}, ${height})`);
}

// Generate polygon points for overlay 1 (left of center)
function generatePolygonPoints1() {
    // Diamond shape left of center
    return [
        { x: 0.25, y: 0.4 },   // Top
        { x: 0.35, y: 0.5 },   // Right
        { x: 0.25, y: 0.6 },   // Bottom
        { x: 0.15, y: 0.5 }    // Left
    ];
}

// Generate polygon points for overlay 2 (right of center)
function generatePolygonPoints2() {
    // Triangle shape right of center
    return [
        { x: 0.7, y: 0.35 },   // Top
        { x: 0.85, y: 0.65 },  // Bottom right
        { x: 0.55, y: 0.65 }   // Bottom left
    ];
}

// Check connectivity on load
checkMinIOConnectivity();
