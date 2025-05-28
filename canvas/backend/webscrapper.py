import sys
import requests
import json
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from PIL import Image
from io import BytesIO

def download_image(url, output_dir, keyword):
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Generate unique filename
        filename = f"{keyword.replace(' ', '_')}_{int(time.time())}.jpg"
        filepath = os.path.join(output_dir, filename)
        
        # Save the image
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        
        return filename
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def scrape_image_from_web(keyword, output_dir="../public/images"):
    os.makedirs(output_dir, exist_ok=True)
    search_url = f"https://www.google.com/search?q={keyword}&tbm=isch"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        img_tags = soup.find_all('img')
        
        if not img_tags:
            return {"error": "No images found"}

        # Get the first valid image URL
        img_url = None
        for img in img_tags[1:]:  # Skip the first logo image
            img_url = img.get('src') or img.get('data-src')
            if img_url and img_url.startswith('http'):
                break
        
        if not img_url:
            return {"error": "No valid image URL found"}

        filename = download_image(img_url, output_dir, keyword)
        if not filename:
            return {"error": "Failed to download image"}

        return {"filename": filename}

    except Exception as e:
        return {"error": f"Error scraping image: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Keyword argument missing"}))
        sys.exit(1)

    keyword = sys.argv[1]
    result = scrape_image_from_web(keyword)
    print(json.dumps(result))
