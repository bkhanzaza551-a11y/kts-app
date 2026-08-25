import os
from PIL import Image

source_img_path = r"C:\Users\Ahmed Bilal Khan\.gemini\antigravity\brain\54eccb8b-fafa-4dc9-9384-331629321722\.user_uploaded\media_1787690498385.jpg"
res_dir = r"d:\KTS10PIPSBOTS_PROJECT\kts10pipsbots-mobile\android\app\src\main\res"

sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

try:
    original = Image.open(source_img_path).convert("RGBA")
    
    for folder, size in sizes.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        resized = original.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder_path, "ic_launcher.png"), format="PNG")
        resized.save(os.path.join(folder_path, "ic_launcher_round.png"), format="PNG")
        
    print("Exact icons generated successfully!")
except Exception as e:
    print(f"Error: {e}")
