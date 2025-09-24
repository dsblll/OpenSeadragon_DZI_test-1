#!/bin/bash

echo "Starting image processing with vips..."

# Wait for MinIO to be ready
sleep 15

# Configure MinIO client
mc alias set myminio http://${MINIO_ENDPOINT} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}

# Create output directories
mkdir -p /output/dzi

# Check if sample1.jpg exists for processing
if [ -f /input/sample1.jpg ]; then
    echo "Processing sample1.jpg into Deep Zoom Image..."
    
    # Use vips to create Deep Zoom Image
    vips dzsave /input/sample1.jpg /output/dzi/sample1 --layout dz --suffix .jpg --overlap 1 --tile-size 254
    
    echo "Deep Zoom Image created at /output/dzi/sample1.dzi"
    
    # Upload DZI files to MinIO
    echo "Uploading DZI files to MinIO..."
    
    # Upload the .dzi descriptor file
    mc cp /output/dzi/sample1.dzi myminio/images/
    
    # Upload all tile directories and files
    mc cp --recursive /output/dzi/sample1_files/ myminio/images/sample1_files/
    
    echo "DZI files uploaded successfully!"
else
    echo "Warning: sample1.jpg not found for DZI processing"
fi

echo "Image processing complete!"

# Keep container running for debugging if needed
tail -f /dev/null
