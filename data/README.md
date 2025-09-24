# Sample Images Directory

Place your sample images here:

- `sample1.jpg` - This will be processed into a Deep Zoom Image using **vips**
- `sample2.jpg` - This will be displayed as a regular full-resolution image

## Image Requirements

- Format: JPEG, PNG, or TIFF
- Recommended size: At least 2000x2000 pixels for good deep zoom demonstration
- File names must be exactly `sample1.jpg` and `sample2.jpg`

## What happens during processing:

1. `sample1.jpg` gets processed by vips using the `dzsave` command
2. This creates a `sample1.dzi` descriptor file and a `sample1_files/` directory with pyramid tiles
3. Both the DZI file and tile directory are uploaded to MinIO
4. `sample2.jpg` is uploaded directly to MinIO without processing

## Example vips command used:

```bash
vips dzsave sample1.jpg sample1 --layout dz --suffix .jpg --overlap 1 --tile-size 254
```

This creates a Deep Zoom Image with:
- 254x254 pixel tiles
- JPEG format tiles
- 1 pixel overlap between tiles
- Deep Zoom layout (Microsoft's format)
