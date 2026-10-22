import os
import glob
from PIL import Image, ImageDraw, ImageFilter
from collections import deque

BRAIN_DIR = "/home/ubuntu/.gemini/antigravity-ide/brain/9438a089-9cdf-468c-a742-721e22b34408"
DEST_AVATARS = "/home/ubuntu/DuAn/monopoly-3d/public/images/avatars"
DEST_TOKENS = "/home/ubuntu/DuAn/monopoly-3d/public/images/tokens"
DEST_UI = "/home/ubuntu/DuAn/monopoly-3d/public/images/ui"

os.makedirs(DEST_AVATARS, exist_ok=True)
os.makedirs(DEST_TOKENS, exist_ok=True)
os.makedirs(DEST_UI, exist_ok=True)

def remove_white_background(img, threshold=235):
    """Xóa nền trắng từ viền ngoài vào sử dụng Breadth-First Flood Fill bằng pure PIL"""
    img = img.convert("RGBA")
    w, h = img.size
    
    # Tạo mask grayscale
    mask = Image.new("L", (w, h), 255)
    
    pixels = img.load()
    mask_pixels = mask.load()
    
    visited = set()
    queue = deque([(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)])
    
    for pt in queue:
        visited.add(pt)
        
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        
        # Nếu là màu nền trắng/rất nhạt
        if r > threshold and g > threshold and b > threshold:
            mask_pixels[x, y] = 0
            
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    nr, ng, nb, _ = pixels[nx, ny]
                    if nr > threshold and ng > threshold and nb > threshold:
                        queue.append((nx, ny))
                    elif nr > 210 and ng > 210 and nb > 210:
                        # Vùng biên chuyển tiếp mượt
                        avg = (nr + ng + nb) / 3.0
                        mask_pixels[nx, ny] = int(max(0, min(255, (255 - avg) * 5)))
    
    # Làm mờ mịn viền mask
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.0))
    img.putalpha(mask)
    return img

def create_circular_avatar(img, size=(512, 512)):
    """Tạo avatar dạng hình tròn bo viền cực đẹp và sạch"""
    img = img.convert("RGBA").resize(size, Image.Resampling.LANCZOS)
    
    # Tạo mask hình tròn
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((4, 4, size[0] - 4, size[1] - 4), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.2))
    
    img.putalpha(mask)
    return img

# 1. Xử lý Avatars
avatar_map = {
    "gentleman": "avatar_gentleman_*.jpg",
    "princess": "avatar_princess_*.jpg",
    "lucky_cat": "avatar_lucky_cat_*.jpg",
    "inventor": "avatar_inventor_*.jpg",
    "fox": "avatar_fox_*.jpg",
}

for name, pattern in avatar_map.items():
    matches = glob.glob(os.path.join(BRAIN_DIR, pattern))
    if matches:
        src = matches[0]
        img = Image.open(src)
        out_circle = create_circular_avatar(img)
        out_path = os.path.join(DEST_AVATARS, f"{name}.png")
        out_circle.save(out_path, "PNG")
        print(f"Saved Avatar: {out_path}")

# 2. Xử lý Tokens (Xóa nền trắng trong suốt)
token_map = {
    "race_car": "token_race_car_*.jpg",
    "luxury_yacht": "token_luxury_yacht_*.jpg",
    "top_hat": "token_top_hat_*.jpg",
    "private_jet": "token_private_jet_*.jpg",
    "royal_crown": "token_royal_crown_*.jpg",
    "lucky_cat": "token_lucky_cat_*.jpg",
    "rocket": "token_rocket_*.jpg",
    "giant_diamond": "token_giant_diamond_*.jpg",
}

for name, pattern in token_map.items():
    matches = glob.glob(os.path.join(BRAIN_DIR, pattern))
    if matches:
        src = matches[0]
        img = Image.open(src)
        out_transparent = remove_white_background(img)
        out_path = os.path.join(DEST_TOKENS, f"{name}.png")
        out_transparent.save(out_path, "PNG")
        print(f"Saved Token: {out_path}")

# 3. Xử lý Logo
logo_matches = glob.glob(os.path.join(BRAIN_DIR, "logo_monopoly_city_*.jpg"))
if logo_matches:
    img = Image.open(logo_matches[0])
    out_logo = remove_white_background(img)
    out_path = os.path.join(DEST_UI, "logo.png")
    out_logo.save(out_path, "PNG")
    print(f"Saved Logo: {out_path}")

print("All images processed and saved successfully!")
