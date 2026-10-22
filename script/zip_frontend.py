import os
import zipfile

dist_dir = os.path.abspath("frontend/dist")
zip_path = os.path.abspath("frontend_dist.zip")

print(f"Creating zip from {dist_dir} to {zip_path}...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, dist_dir)
            zipf.write(full_path, rel_path)

print(f"Zip created successfully. Size: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")
