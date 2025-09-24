#!/bin/bash

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 10

# Configure MinIO client
mc alias set myminio http://minio:9000 minioadmin minioadmin123

# Create bucket
echo "Creating bucket 'images'..."
mc mb myminio/images

# Set bucket policy to public read
echo "Setting bucket policy..."
mc anonymous set public myminio/images

# Upload sample images
echo "Uploading sample images..."
if [ -f /source-data/sample1.jpg ]; then
    mc cp /source-data/sample1.jpg myminio/images/
    echo "Uploaded sample1.jpg"
fi

if [ -f /source-data/sample2.jpg ]; then
    mc cp /source-data/sample2.jpg myminio/images/
    echo "Uploaded sample2.jpg"
fi

echo "MinIO setup complete!"
