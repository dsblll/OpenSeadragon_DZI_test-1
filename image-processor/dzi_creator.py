import os
import math
import xml.etree.ElementTree as ET
from PIL import Image

class PILDeepZoomCreator:
    def __init__(self, tile_size=254, tile_overlap=1, image_format="jpg", image_quality=85):
        self.tile_size = tile_size
        self.tile_overlap = tile_overlap
        self.image_format = image_format
        self.image_quality = image_quality
        
    def create_dzi(self, source_path, destination_path):
        """Create Deep Zoom Image from source using pure PIL"""
        print(f"Creating DZI from {source_path}...")
        
        # Open source image
        source_image = Image.open(source_path)
        width, height = source_image.size
        
        print(f"Source image: {width}x{height}")
        
        # Calculate pyramid levels
        max_dimension = max(width, height)
        max_level = math.ceil(math.log2(max_dimension))
        
        print(f"Creating pyramid with max level {max_level}...")
        
        # Create output directories
        base_name = os.path.splitext(os.path.basename(destination_path))[0]
        output_dir = os.path.dirname(destination_path)
        tiles_dir = os.path.join(output_dir, f"{base_name}_files")
        
        os.makedirs(tiles_dir, exist_ok=True)
        
        # Generate pyramid levels from max_level (full size) down to 0 (smallest)
        for level in range(max_level + 1):
            level_dir = os.path.join(tiles_dir, str(level))
            os.makedirs(level_dir, exist_ok=True)
            
            # Calculate scale factor for this level
            scale = 2 ** (max_level - level)
            level_width = max(1, width // scale)
            level_height = max(1, height // scale)
            
            print(f"Level {level}: {level_width}x{level_height} (scale: 1/{scale})")
            
            # Resize image for this level
            if level == max_level:
                # Full resolution level
                level_image = source_image.copy()
            else:
                # Smaller level - resize from original
                level_image = source_image.resize(
                    (level_width, level_height), 
                    Image.Resampling.LANCZOS
                )
            
            # Generate tiles for this level
            self._create_level_tiles(level_image, level_dir, level)
        
        # Create DZI descriptor file
        self._create_dzi_descriptor(destination_path, width, height)
        
        print(f"DZI creation complete: {destination_path}")
        
    def _create_level_tiles(self, image, level_dir, level):
        """Create tiles for a specific pyramid level"""
        width, height = image.size
        
        # Calculate number of tiles needed
        cols = math.ceil(width / self.tile_size)
        rows = math.ceil(height / self.tile_size)
        
        for row in range(rows):
            for col in range(cols):
                # Calculate tile boundaries
                x = col * self.tile_size
                y = row * self.tile_size
                
                # Calculate actual crop area with overlap
                crop_x1 = max(0, x - self.tile_overlap)
                crop_y1 = max(0, y - self.tile_overlap)
                crop_x2 = min(width, x + self.tile_size + self.tile_overlap)
                crop_y2 = min(height, y + self.tile_size + self.tile_overlap)
                
                # Debug info for first tile of each level
                if row == 0 and col == 0:
                    print(f"  Level {level} tile (0,0): crop area ({crop_x1}, {crop_y1}, {crop_x2}, {crop_y2})")
                
                # Extract and save tile
                tile = image.crop((crop_x1, crop_y1, crop_x2, crop_y2))
                
                tile_filename = f"{col}_{row}.{self.image_format}"
                tile_path = os.path.join(level_dir, tile_filename)
                
                if self.image_format.lower() == 'jpg':
                    tile.save(tile_path, 'JPEG', quality=self.image_quality, optimize=True)
                else:
                    tile.save(tile_path)
                
    def _create_dzi_descriptor(self, dzi_path, width, height):
        """Create the DZI XML descriptor file"""
        root = ET.Element("Image")
        root.set("xmlns", "http://schemas.microsoft.com/deepzoom/2008")
        root.set("Format", self.image_format)
        root.set("Overlap", str(self.tile_overlap))
        root.set("TileSize", str(self.tile_size))
        
        size_elem = ET.SubElement(root, "Size")
        size_elem.set("Height", str(height))
        size_elem.set("Width", str(width))
        
        # Write XML file
        tree = ET.ElementTree(root)
        ET.indent(tree, space="  ", level=0)  # Pretty print
        tree.write(dzi_path, encoding="utf-8", xml_declaration=True)
