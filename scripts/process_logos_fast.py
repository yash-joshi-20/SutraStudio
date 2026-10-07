import os
import shutil
from PIL import Image, ImageOps, ImageChops

def process_logo_file(path, is_black_bg=False):
    print(f"Processing {path}...")
    try:
        img = Image.open(path).convert('RGB')
        r, g, b = img.split()
        
        if is_black_bg:
            # Black background removal
            max_rgb = ImageChops.lighter(ImageChops.lighter(r, g), b)
            table = []
            for i in range(256):
                if i < 8:
                    table.append(0)
                elif i < 35:
                    table.append(int(255 * (i - 8) / 27.0))
                else:
                    table.append(255)
            alpha = max_rgb.point(table)
        else:
            # White background removal
            min_rgb = ImageChops.darker(ImageChops.darker(r, g), b)
            darkness = ImageOps.invert(min_rgb)
            table = []
            for i in range(256):
                if i < 6:
                    table.append(0)
                elif i < 30:
                    table.append(int(255 * (i - 6) / 24.0))
                else:
                    table.append(255)
            alpha = darkness.point(table)
            
        rgba = Image.merge('RGBA', (r, g, b, alpha))
        
        # Calculate tight bounding box
        bbox = rgba.getbbox()
        if bbox:
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            pad = int(max(w, h) * 0.015)
            crop_box = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(rgba.width, bbox[2] + pad),
                min(rgba.height, bbox[3] + pad)
            )
            cropped = rgba.crop(crop_box)
        else:
            cropped = rgba
            
        cropped.save(path, "PNG", optimize=True)
        print(f"  -> Successfully converted {path}: new size={cropped.size}")
    except Exception as e:
        print(f"  -> Error processing {path}: {e}")

def main():
    target_dirs = ["public/brand", "public/brand/LOGO"]
    skip_files = ["gpay-qr.png", "sutra-brand-board-reference.png", "sutra-app-icon.png"]
    black_bg_files = ["sutra-logo-white.png", "sutra-watermark-dark.png"]
    
    for d in target_dirs:
        if not os.path.exists(d):
            continue
        for fname in os.listdir(d):
            if fname.endswith(".png") and fname not in skip_files:
                fpath = os.path.join(d, fname)
                if os.path.isfile(fpath):
                    is_black = (fname in black_bg_files) or ("white" in fname and "primary" not in fname) or ("watermark-dark" in fname)
                    process_logo_file(fpath, is_black)

if __name__ == "__main__":
    main()
