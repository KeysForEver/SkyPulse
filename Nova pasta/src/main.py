# pip install pillow

import os
from PIL import Image

input_folder = "public/"

for root, dirs, files in os.walk(input_folder):
    for file_name in files:
        if file_name.lower().endswith((".jpg" , ".jpeg")):
            file_path = os.path.join(root, file_name)

            img = Image.open(file_path).convert("RGB")

            output_path = os.path.splitext(file_path)[0] + ".webp"

            img.save(output_path, "WEBP", quality=85)

            os.remove(file_path)

print("Conversão concluída! Todos os arquivos .jpg/.jpeg foram substituídos por .webp")
