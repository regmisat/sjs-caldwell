import os
from PIL import Image

# Path to your main directory
base_dir = "./public/event-pics"

# Resize and quality settings
target_width = 600   # set your desired max width
quality = 80         # JPEG quality (0-100)

def process_image(file_path):
    try:
        img = Image.open(file_path)
        w, h = img.size

        if w > target_width:  # only shrink if wider than target
            new_height = int((target_width / w) * h)
            img = img.resize((target_width, new_height), Image.LANCZOS)

        # save back with reduced quality
        img.save(file_path, optimize=True, quality=quality)
        print(f"Processed: {file_path}")
    except Exception as e:
        print(f"Skipping {file_path} ({e})")

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            process_image(os.path.join(root, file))
