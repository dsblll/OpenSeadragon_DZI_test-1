#!/bin/bash

echo "Starting Pure PIL Deep Zoom Image Processor..."

# Wait for MinIO to be ready
sleep 15

# Configure MinIO client
mc alias set myminio http://${MINIO_ENDPOINT} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}

# Run the Python processing script
python /process_images.py

echo "PIL DZI processing completed!"
