# MinIO + OpenSeadragon Deep Zoom Demo

A Proof-of-Concept project demonstrating deep zoom images using **vips**, MinIO storage, and OpenSeadragon viewer.

## Architecture

- **MinIO**: S3-compatible storage for images and DZI tiles
- **PIL Image Processor**: Converts images to Deep Zoom format using pure Python
- **Web App**: Vanilla JavaScript application with OpenSeadragon
- **Docker Compose**: Orchestrates all services

## Key Features

✅ **Pure PIL integration** for commercial-friendly deep zoom preprocessing  
✅ **MinIO storage** with CORS configured for browser access  
✅ **Side-by-side comparison** of DZI vs regular image display  
✅ **No npm dependencies** - uses CDN for OpenSeadragon  
✅ **Vanilla JavaScript** - no frameworks required  
✅ **Commercial license** - MIT/PIL licenses safe for commercial use  

## Quick Start

1. **Add sample images** to the `data/` directory:
   - `sample1.jpg` (will be processed into DZI)
   - `sample2.jpg` (displayed as regular image)

For example, this image can be downloaded, then pasted into the data/ directory twice and renamed to `sample1.jpg` and `sample2.jpg`:
https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg

2. **Run the project**:
   ```bash
   docker-compose up --build
   ```
Or, if only the web app needs to be updated:
   ```bash
   docker-compose up -d --build webapp
   ```

3. **Access the application**:
   - Web App: http://localhost:8080
   - MinIO Console: http://localhost:9001 (admin/minioadmin123)
   - MinIO API: http://localhost:9090

## How it Works

### Image Processing Flow
1. **MinIO starts** and creates the 'images' bucket
2. **Sample images uploaded** to MinIO
3. **PIL processes** `sample1.jpg` into Deep Zoom format:
   ```python
   # Pure Python PIL Deep Zoom creation
   creator = PILDeepZoomCreator(tile_size=254, tile_overlap=1)
   creator.create_dzi('sample1.jpg', 'sample1.dzi')
   ```
4. **DZI files uploaded** back to MinIO (`.dzi` descriptor + tile pyramid)
5. **Web app loads** both DZI and regular images via OpenSeadragon

### Services

- **minio**: Storage service (ports 9090, 9001)
- **minio-init**: Initializes bucket and uploads sample images
- **image-processor**: Uses pure PIL to create DZI tiles
- **webapp**: Nginx serving the OpenSeadragon application (port 8080)

## Project Structure

```
├── docker-compose.yml          # Service orchestration
├── data/                       # Place sample images here
│   ├── sample1.jpg            # → processed into DZI
│   ├── sample2.jpg            # → displayed as regular image
│   └── README.md
├── scripts/
│   └── setup-minio.sh         # MinIO initialization
├── image-processor/
│   ├── Dockerfile             # PIL + MinIO client
│   ├── dzi_creator.py         # Pure PIL Deep Zoom generator
│   ├── process_images.py      # DZI processing script
│   └── entrypoint.sh          # Container entrypoint
├── webapp/
│   ├── index.html             # Main HTML page
│   ├── script.js              # OpenSeadragon logic
│   ├── style.css              # Styling
│   ├── nginx.conf             # CORS configuration
│   └── Dockerfile
└── processed/                  # Temporary processing directory
```

## PIL Deep Zoom Processing

The project uses **pure Python PIL (Pillow)** to generate Deep Zoom Images:

- **Tile size**: 254x254 pixels
- **Format**: JPEG tiles
- **Overlap**: 1 pixel between adjacent tiles
- **Layout**: Deep Zoom (Microsoft format)
- **License**: PIL Software License (commercial-friendly)

This creates a pyramid of progressively smaller images, allowing smooth zooming and panning of large images in the browser without any external dependencies or licensing concerns.

## How OpenSeadragon Fetches DZI Tiles from MinIO

When OpenSeadragon displays a Deep Zoom Image, it follows a sophisticated tile-fetching strategy:

### **1. Initial Load Process**
```javascript
// OpenSeadragon first loads the DZI descriptor
GET http://localhost:9090/images/sample1.dzi
```

The `.dzi` file contains metadata about the image:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Image xmlns="http://schemas.microsoft.com/deepzoom/2008"
  Format="jpg" Overlap="1" TileSize="254">
  <Size Height="3000" Width="4000"/>
</Image>
```

### **2. Tile Pyramid Structure**
PIL creates a pyramid of zoom levels in MinIO:
```
sample1_files/
├── 0/           # Zoom level 0 (lowest resolution)
│   └── 0_0.jpg
├── 1/           # Zoom level 1
│   └── 0_0.jpg
├── ...
├── 12/          # Higher zoom levels
│   ├── 0_0.jpg  # Top-left tile
│   ├── 0_1.jpg  # Top-center tile
│   ├── 1_0.jpg  # Middle-left tile
│   └── ...
└── 13/          # Zoom level 13 (highest resolution)
    ├── 0_0.jpg
    ├── 0_1.jpg
    └── ...
```

### **3. Smart Tile Loading**
OpenSeadragon intelligently loads only visible tiles:

**Initial View (Low Zoom):**
```javascript
// Loads low-resolution overview
GET http://localhost:9090/images/sample1_files/8/0_0.jpg
GET http://localhost:9090/images/sample1_files/8/0_1.jpg
```

**User Zooms In:**
```javascript
// Loads higher-resolution tiles for visible area
GET http://localhost:9090/images/sample1_files/12/3_2.jpg
GET http://localhost:9090/images/sample1_files/12/3_3.jpg
GET http://localhost:9090/images/sample1_files/12/4_2.jpg
GET http://localhost:9090/images/sample1_files/12/4_3.jpg
```

**User Pans Around:**
```javascript
// Loads adjacent tiles as needed
GET http://localhost:9090/images/sample1_files/12/5_2.jpg
GET http://localhost:9090/images/sample1_files/12/5_3.jpg
```

### **4. Performance Optimizations**

- **On-Demand Loading**: Only requests tiles that are visible
- **Progressive Enhancement**: Shows low-res tiles first, then high-res
- **Caching**: Browser caches tiles for fast re-display
- **Preloading**: Loads nearby tiles before user navigates to them
- **Adaptive Quality**: Loads appropriate zoom level based on viewport

### **5. Network Efficiency**
```
Regular Image Approach:
└── Single Request: 4MB JPEG file

Deep Zoom Approach:
├── DZI Descriptor: ~200 bytes
├── Initial tiles: ~50KB (4-8 tiles)
├── Zoom tiles: ~100KB (as needed)
└── Total: Only loads what's needed!
```

This tile-based approach means users can interact with massive images (even gigapixel images) with minimal initial loading time and smooth performance.

## Polygon Overlays with OpenSeadragon

OpenSeadragon provides excellent support for polygon overlays, including on Deep Zoom Images. This enables advanced features like annotations, region highlighting, and interactive elements.

### **Overlay Implementation Approaches**

#### **1. SVG Overlays**
- **Best for**: Simple polygons with few points (<500)
- **Pros**: Easy styling with CSS, scalable graphics
- **Cons**: Performance degrades with thousands of points

```javascript
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
polygon.setAttribute("points", "100,100 200,50 300,100 250,200");
polygon.setAttribute("fill", "rgba(255,0,0,0.3)");
```

#### **2. Canvas Overlays (Recommended)**
- **Best for**: Complex polygons with thousands of points
- **Pros**: High performance, memory efficient, handles complex shapes
- **Cons**: Less styling flexibility than SVG

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.beginPath();
for(let i = 0; i < points.length; i++) {
    i === 0 ? ctx.moveTo(points[i].x, points[i].y) : ctx.lineTo(points[i].x, points[i].y);
}
ctx.closePath();
ctx.fillStyle = 'rgba(255,0,0,0.3)';
ctx.fill();
```

### **Performance Considerations**

- **Canvas is superior** for polygons with >500 points
- **SVG creates DOM elements** for each point (performance bottleneck)
- **Canvas renders in single operation** (much faster)
- **OpenSeadragon coordinates** automatically scale with zoom levels

### **Deep Zoom Compatibility**

✅ **Overlays scale automatically** with image zoom  
✅ **Coordinates use image space**, not screen pixels  
✅ **Works with tile-based loading** seamlessly  
✅ **Interactive capabilities** (click detection, hover effects)  
✅ **Show/hide functionality** built-in  

### **Overlay Coordinate System**

OpenSeadragon uses normalized image coordinates (0.0 to 1.0):
- `(0, 0)` = Top-left corner of image
- `(1, 1)` = Bottom-right corner of image
- Overlays automatically scale with zoom and pan operations

This makes overlays perfect for Deep Zoom Images where users can zoom from overview to pixel-level detail.

## Troubleshooting

**DZI not loading?**
- Check if `sample1.jpg` exists in `data/` directory
- Wait for image processing to complete (check logs: `docker-compose logs image-processor`)
- Verify DZI files were uploaded to MinIO at http://localhost:9090

**Regular image not loading?**
- Ensure `sample2.jpg` exists in `data/` directory
- Check MinIO bucket contents at http://localhost:9001

**CORS issues?**
- The nginx configuration includes CORS headers
- MinIO bucket is set to public read access

## Requirements Met

✅ Docker Compose setup  
✅ MinIO for image storage  
✅ Vanilla JavaScript (no npm)  
✅ OpenSeadragon from CDN  
✅ **Pure PIL for deep zoom preprocessing**  
✅ Side-by-side image comparison  
✅ Proper titles for both viewers  
✅ **Commercial-friendly licensing**

---

# 🏭 Production Deployment

The current setup uses **public bucket access** for simplicity, but production environments require secure credential management. Here are the recommended approaches:

## 🚨 Current Setup (Development Only)

```javascript
// Browser directly accesses MinIO - no credentials needed
GET http://localhost:9090/images/sample1_files/12/0_0.jpg
```

- MinIO bucket set to **public read** (`mc anonymous set public`)
- No authentication required
- ⚠️ **NOT suitable for production**

## 🔐 Production Security Solutions

### **Option 1: Reverse Proxy (Recommended)**

**How it works:**
- Nginx proxy sits between browser and MinIO
- Proxy handles authentication and adds MinIO credentials
- Browser never sees MinIO credentials

**Implementation:**

1. **Create nginx configuration** (`/etc/nginx/sites-available/openseadragon-app`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve the web application
       location / {
           root /var/www/openseadragon-app;
           index index.html;
           try_files $uri $uri/ =404;
           
           # CORS headers for the app
           add_header Access-Control-Allow-Origin *;
           add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
           add_header Access-Control-Allow-Headers "Authorization, Content-Type";
       }
       
       # Proxy MinIO requests with authentication
       location /api/images/ {
           # Optional: Add your authentication here
           # auth_request /auth;
           # auth_request_set $user $upstream_http_x_user;
           
           # Remove /api from path before forwarding
           rewrite ^/api/images/(.*)$ /images/$1 break;
           
           # Forward to MinIO with credentials injected
           proxy_pass http://minio-server:9090;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Add MinIO credentials (use environment variables)
           proxy_set_header Authorization "AWS4-HMAC-SHA256 Credential=$MINIO_ACCESS_KEY/20231001/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=$MINIO_SIGNATURE";
           
           # CORS headers for image requests
           add_header Access-Control-Allow-Origin *;
           add_header Access-Control-Allow-Methods "GET, OPTIONS";
           add_header Access-Control-Allow-Headers "Authorization, Content-Type";
           
           # Handle preflight requests
           if ($request_method = 'OPTIONS') {
               return 204;
           }
       }
       
       # Optional: Authentication endpoint
       location = /auth {
           internal;
           proxy_pass http://auth-service/verify;
           proxy_pass_request_body off;
           proxy_set_header Content-Length "";
           proxy_set_header X-Original-URI $request_uri;
       }
   }
   ```

2. **Update JavaScript to use API endpoint**:
   ```javascript
   // Change from direct MinIO access
   const MINIO_ENDPOINT = 'http://localhost:9090';
   
   // To proxied API endpoint
   const API_ENDPOINT = '/api/images';
   tileSources: `${API_ENDPOINT}/sample1.dzi`
   ```

3. **Environment variables for nginx** (in `/etc/nginx/conf.d/env.conf`):
   ```nginx
   # Load MinIO credentials from environment
   env MINIO_ACCESS_KEY;
   env MINIO_SECRET_KEY;
   
   # You'll need to use lua or a more advanced setup for dynamic AWS signature generation
   # Alternative: Use a simple proxy_pass with basic auth or API key
   ```

4. **Simplified approach without AWS signatures**:
   ```nginx
   # In your nginx config, use a simpler approach:
   location /api/images/ {
       # Set MinIO bucket to private access
       # Use nginx auth_basic or auth_request for user authentication
       auth_basic "Restricted Access";
       auth_basic_user_file /etc/nginx/.htpasswd;
       
       # Forward to MinIO (bucket should be private)
       rewrite ^/api/images/(.*)$ /images/$1 break;
       proxy_pass http://minio-server:9090;
       proxy_set_header Authorization "Basic $MINIO_BASIC_AUTH_TOKEN";
   }
   ```

5. **Set MinIO bucket to private access**:
   ```bash
   # Remove public access
   mc anonymous set none myminio/images
   
   # Create service account for nginx
   mc admin user svcacct add myminio minioadmin --access-key "nginx-proxy" --secret-key "your-secret-key"
   ```

**Benefits:**
- ✅ Browser never sees MinIO credentials
- ✅ Centralized authentication/authorization
- ✅ Can add rate limiting, caching, monitoring
- ✅ Works with existing OpenSeadragon code

### **Option 2: Presigned URLs**

**How it works:**
- Server generates temporary, signed URLs
- URLs include authentication tokens
- Browser uses presigned URLs (time-limited)

**Implementation:**

1. **Server-side URL generation**:
   ```javascript
   // Generate presigned URL (server-side)
   const presignedUrl = await minioClient.presignedGetObject(
       'images', 
       'sample1_files/12/0_0.jpg', 
       3600  // 1 hour expiry
   );
   
   // Send to browser
   res.json({ tileUrl: presignedUrl });
   ```

2. **Browser requests presigned URLs**:
   ```javascript
   // Browser gets presigned URL from your API
   const response = await fetch('/api/get-tile-url?tile=sample1_files/12/0_0.jpg');
   const { tileUrl } = await response.json();
   
   // Use the presigned URL
   GET https://minio.example.com/images/sample1_files/12/0_0.jpg?X-Amz-Algorithm=...
   ```

**Benefits:**
- ✅ Time-limited access (automatic expiry)
- ✅ Granular permissions per tile
- ✅ No persistent credentials in browser

**Drawbacks:**
- ❌ Requires server endpoint for each tile request
- ❌ More complex implementation
- ❌ Potential performance overhead

### **Option 3: CDN with Private Origin**

**How it works:**
- CDN (CloudFront/CloudFlare) serves tiles publicly
- CDN authenticates to MinIO privately
- Browser accesses CDN (no MinIO credentials)

**Implementation:**

1. **CloudFront configuration**:
   ```yaml
   Origin:
     DomainName: private-minio.internal
     CustomOriginConfig:
       HTTPPort: 9090
       OriginRequestPolicyId: "custom-minio-auth"
   ```

2. **Browser requests**:
   ```javascript
   // Browser accesses CDN endpoint
   tileSources: 'https://cdn.example.com/images/sample1.dzi'
   
   // CDN handles MinIO authentication internally
   ```

**Benefits:**
- ✅ Global edge caching
- ✅ High performance
- ✅ Scalable worldwide
- ✅ DDoS protection

**Drawbacks:**
- ❌ Additional CDN costs
- ❌ More complex setup
- ❌ Cache invalidation complexity

## 🎯 Production Deployment Recommendation

**For most applications**: Use **Option 1 (Reverse Proxy)**

1. **Security**: Credentials stay server-side
2. **Performance**: Direct streaming with optional caching
3. **Simplicity**: Minimal code changes required
4. **Flexibility**: Easy to add authentication, rate limiting, etc.

## 📋 Production Checklist

- [ ] Remove public bucket access: `mc anonymous set none`
- [ ] Implement reverse proxy with authentication
- [ ] Use environment variables for MinIO credentials
- [ ] Add HTTPS/TLS certificates
- [ ] Implement proper user authentication
- [ ] Add rate limiting and monitoring
- [ ] Set up proper backup strategy
- [ ] Configure log aggregation
- [ ] Test failover scenarios
