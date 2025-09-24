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
