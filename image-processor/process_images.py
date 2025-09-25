import os
import sys
from pathlib import Path
from minio import Minio
import tempfile
from dzi_creator import PILDeepZoomCreator

def create_dzi_with_pil(input_file, output_dir):
    """Create DZI tiles using pure PIL"""
    print(f"Processing {input_file} with Pure PIL Deep Zoom...")
    
    # Create DZI creator with PIL only
    creator = PILDeepZoomCreator(
        tile_size=254,
        tile_overlap=1,
        image_format="jpg",
        image_quality=85
    )
    
    # Generate DZI files
    dzi_path = os.path.join(output_dir, "sample1.dzi")
    creator.create_dzi(input_file, dzi_path)
    
    print(f"PIL DZI created: {dzi_path}")
    return output_dir

def upload_to_minio(local_dir, minio_client, bucket_name):
    """Upload all DZI files to MinIO"""
    print("Uploading DZI files to MinIO...")
    
    for root, dirs, files in os.walk(local_dir):
        for file in files:
            local_path = os.path.join(root, file)
            # Calculate relative path for MinIO
            relative_path = os.path.relpath(local_path, local_dir)
            minio_path = relative_path.replace('\\', '/')
            
            print(f"Uploading {minio_path}...")
            minio_client.fput_object(bucket_name, minio_path, local_path)

def main():
    # MinIO configuration
    minio_endpoint = os.getenv('MINIO_ENDPOINT', 'minio:9090')
    minio_access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
    minio_secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin123')
    bucket_name = 'images'
    
    # Initialize MinIO client
    minio_client = Minio(
        minio_endpoint,
        access_key=minio_access_key,
        secret_key=minio_secret_key,
        secure=False
    )
    
    input_file = "/input/sample1.jpg"
    
    if not os.path.exists(input_file):
        print(f"Input file {input_file} not found!")
        sys.exit(1)
    
    # Create temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"Processing in temporary directory: {temp_dir}")
        
        # Create DZI tiles with pure PIL
        create_dzi_with_pil(input_file, temp_dir)
        
        # Upload to MinIO
        upload_to_minio(temp_dir, minio_client, bucket_name)
    
    print("Pure PIL DZI processing complete!")

if __name__ == "__main__":
    main()
