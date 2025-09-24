# MinIO + OpenSeadragon Deep Zoom Demo

A Proof-of-Concept project demonstrating deep zoom images using **vips**, MinIO storage, and OpenSeadragon viewer.

## Architecture

- **MinIO**: S3-compatible storage for images and DZI tiles
- **Vips Image Processor**: Converts images to Deep Zoom format
- **Web App**: Vanilla JavaScript application with OpenSeadragon
- **Docker Compose**: Orchestrates all services

## Key Features

✅ **Vips integration** for high-quality deep zoom preprocessing  
✅ **MinIO storage** with CORS configured for browser access  
✅ **Side-by-side comparison** of DZI vs regular image display  
✅ **No npm dependencies** - uses CDN for OpenSeadragon  
✅ **Vanilla JavaScript** - no frameworks required  

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

3. **Access the application**:
   - Web App: http://localhost:8080
   - MinIO Console: http://localhost:9001 (admin/minioadmin123)

## How it Works

### Image Processing Flow
1. **MinIO starts** and creates the 'images' bucket
2. **Sample images uploaded** to MinIO
3. **Vips processes** `sample1.jpg` into Deep Zoom format:
   ```bash
   vips dzsave sample1.jpg sample1 --layout dz --suffix .jpg --overlap 1 --tile-size 254
   ```
4. **DZI files uploaded** back to MinIO (`.dzi` descriptor + tile pyramid)
5. **Web app loads** both DZI and regular images via OpenSeadragon

### Services

- **minio**: Storage service (ports 9000, 9001)
- **minio-init**: Initializes bucket and uploads sample images
- **image-processor**: Uses vips to create DZI tiles
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
│   ├── Dockerfile             # Vips + MinIO client
│   └── process-images.sh      # DZI processing script
├── webapp/
│   ├── index.html             # Main HTML page
│   ├── script.js              # OpenSeadragon logic
│   ├── style.css              # Styling
│   ├── nginx.conf             # CORS configuration
│   └── Dockerfile
└── processed/                  # Temporary processing directory
```

## Vips Deep Zoom Processing

The project uses **libvips** to generate Deep Zoom Images:

- **Tile size**: 254x254 pixels
- **Format**: JPEG tiles
- **Overlap**: 1 pixel between adjacent tiles
- **Layout**: Deep Zoom (Microsoft format)

This creates a pyramid of progressively smaller images, allowing smooth zooming and panning of large images in the browser.

## How OpenSeadragon Fetches DZI Tiles from MinIO

When OpenSeadragon displays a Deep Zoom Image, it follows a sophisticated tile-fetching strategy:

### **1. Initial Load Process**
```javascript
// OpenSeadragon first loads the DZI descriptor
GET http://localhost:9000/images/sample1.dzi
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
Vips creates a pyramid of zoom levels in MinIO:
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
GET http://localhost:9000/images/sample1_files/8/0_0.jpg
GET http://localhost:9000/images/sample1_files/8/0_1.jpg
```

**User Zooms In:**
```javascript
// Loads higher-resolution tiles for visible area
GET http://localhost:9000/images/sample1_files/12/3_2.jpg
GET http://localhost:9000/images/sample1_files/12/3_3.jpg
GET http://localhost:9000/images/sample1_files/12/4_2.jpg
GET http://localhost:9000/images/sample1_files/12/4_3.jpg
```

**User Pans Around:**
```javascript
// Loads adjacent tiles as needed
GET http://localhost:9000/images/sample1_files/12/5_2.jpg
GET http://localhost:9000/images/sample1_files/12/5_3.jpg
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

## Troubleshooting

**DZI not loading?**
- Check if `sample1.jpg` exists in `data/` directory
- Wait for image processing to complete (check logs: `docker-compose logs image-processor`)
- Verify DZI files were uploaded to MinIO

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
✅ **Vips for deep zoom preprocessing**  
✅ Side-by-side image comparison  
✅ Proper titles for both viewers

---

# 🏭 Production Deployment

The current setup uses **public bucket access** for simplicity, but production environments require secure credential management. Here are the recommended approaches:

## 🚨 Current Setup (Development Only)

```javascript
// Browser directly accesses MinIO - no credentials needed
GET http://localhost:9000/images/sample1_files/12/0_0.jpg
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

1. **Update nginx configuration** (see `nginx-production.conf`):
   ```nginx
   location /api/images/ {
       # Add authentication (JWT, session, etc.)
       auth_request /auth;
       
       # Proxy to MinIO with credentials
       rewrite ^/api/images/(.*)$ /images/$1 break;
       proxy_pass http://minio:9000;
       proxy_set_header Authorization "AWS4-HMAC-SHA256 ...";
   }
   ```

2. **Update JavaScript**:
   ```javascript
   // Change from direct MinIO access
   const MINIO_ENDPOINT = 'http://localhost:9000';
   
   // To API endpoint
   const API_ENDPOINT = '/api/images';
   tileSources: `${API_ENDPOINT}/sample1.dzi`
   ```

3. **Set MinIO to private**:
   ```bash
   mc anonymous set none myminio/images  # Remove public access
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
       HTTPPort: 9000
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
