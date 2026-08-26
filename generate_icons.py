import os
from PIL import Image, ImageDraw

source_img_path = r"C:\Users\Ahmed Bilal Khan\.gemini\antigravity\brain\54eccb8b-fafa-4dc9-9384-331629321722\.user_uploaded\media_1787686590106.jpg"
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
    
    scale_factor = 0.70
    new_size = original.size[0]
    scaled_size = int(new_size * scale_factor)
    
    scaled_img = original.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
    
    edge_color = original.getpixel((0, 0))
    
    canvas = Image.new("RGBA", (new_size, new_size), edge_color)
    offset = ((new_size - scaled_size) // 2, (new_size - scaled_size) // 2)
    canvas.paste(scaled_img, offset, scaled_img)
    
    def make_round(img):
        mask = Image.new("L", img.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)
        result = img.copy()
        result.putalpha(mask)
        return result

    for folder, size in sizes.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        resized = canvas.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder_path, "ic_launcher.png"), format="PNG")
        
        round_img = make_round(resized)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.png"), format="PNG")
        
    print("Zoomed out icons generated successfully!")
except Exception as e:
    print(f"Error: {e}")
