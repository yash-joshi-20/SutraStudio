import os
import shutil
from PIL import Image

def process_image(src_path, is_black_bg=False):
    print(f"Processing {src_path}...")
    img = Image.open(src_path)
    
    if is_black_bg:
        img = img.convert('RGBA')
        datas = img.getdata()
        new_data = []
        for r, g, b, a in datas:
            max_c = max(r, g, b)
            if max_c <= 8:
                new_data.append((255, 255, 255, 0))
            elif max_c < 250:
                alpha = max_c
                a_f = alpha / 255.0
                nr = max(0, min(255, int(r / a_f)))
                ng = max(0, min(255, int(g / a_f)))
                nb = max(0, min(255, int(b / a_f)))
                new_data.append((nr, ng, nb, alpha))
            else:
                new_data.append((r, g, b, 255))
        img.putdata(new_data)
    else:
        # White background removal
        img = img.convert('RGBA')
        datas = img.getdata()
        new_data = []
        for r, g, b, a in datas:
            # Check how close to white
            min_c = min(r, g, b)
            # If all components are high (near white)
            if min_c >= 245:
                # Alpha depends on brightness drop from 255
                alpha = int(255 * (255 - min_c) / (255 - 245 + 0.001))
                if alpha <= 0:
                    new_data.append((255, 255, 255, 0))
                else:
                    a_f = alpha / 255.0
                    nr = max(0, min(255, int((r - 255 * (1 - a_f)) / a_f)))
                    ng = max(0, min(255, int((g - 255 * (1 - a_f)) / a_f)))
                    nb = max(0, min(255, int((b - 255 * (1 - a_f)) / a_f)))
                    new_data.append((nr, ng, nb, alpha))
            else:
                # For antialiasing near boundaries where min_c is between 200 and 245
                # calculate color saturation & darkness
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                if min_c > 220 and (max(r, g, b) - min_c) < 15:
                    # light gray/white edge
                    alpha = int(255 * (255 - min_c) / 35.0)
                    a_f = max(0.01, alpha / 255.0)
                    nr = max(0, min(255, int((r - 255 * (1 - a_f)) / a_f)))
                    ng = max(0, min(255, int((g - 255 * (1 - a_f)) / a_f)))
                    nb = max(0, min(255, int((b - 255 * (1 - a_f)) / a_f)))
                    new_data.append((nr, ng, nb, alpha))
                else:
                    new_data.append((r, g, b, 255))
        img.putdata(new_data)
        
    # Crop to non-transparent bounding box with tight padding
    bbox = img.getbbox()
    if bbox:
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        pad = int(max(w, h) * 0.015) # 1.5% balanced margin
        crop_box = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(img.width, bbox[2] + pad),
            min(img.height, bbox[3] + pad)
        )
        img = img.crop(crop_box)
        
    img.save(src_path, "PNG", optimize=True)
    print(f"Saved {src_path}, new size: {img.size}")

def main():
    dirs_to_process = ["public/brand", "public/brand/LOGO"]
    black_bg_files = ["sutra-logo-white.png", "sutra-watermark-dark.png"]
    
    for d in dirs_to_process:
        if not os.path.exists(d):
            continue
        for fname in os.listdir(d):
            if fname.endswith(".png") and fname not in ["gpay-qr.png", "sutra-brand-board-reference.png", "sutra-app-icon.png"]:
                fpath = os.path.join(d, fname)
                if os.path.isfile(fpath):
                    is_black = fname in black_bg_files
                    process_image(fpath, is_black)

if __name__ == "__main__":
    main()
