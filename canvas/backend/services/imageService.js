const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pool = require('../config/dbConfig');

const PEXELS_API_KEY = 'tu9Kz5T8Vi9hVdTXHz9wTQAy518Y9TVDRSGiRw0gD0OTScr1pQJcKmRF'; // Replace with your actual key

async function downloadAndSaveImage(url, keyword, outputDir) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const filename = `${keyword.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        const filepath = path.join(outputDir, filename);
        
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(filepath, response.data);
        
        return filename;
    } catch (error) {
        console.error('Error downloading image:', error);
        return null;
    }
}

exports.searchImage = async (keyword) => {
    try {
        // 1. Check local database first
        const localResult = await pool.query(
            'SELECT image_path FROM images WHERE LOWER(keyword) = LOWER($1) LIMIT 1',
            [keyword]
        );

        if (localResult.rows.length > 0) {
            const imagePath = path.join(__dirname, '../../public/images', localResult.rows[0].image_path);
            if (fs.existsSync(imagePath)) {
                return {
                    source: 'local',
                    imageUrl: `/images/${localResult.rows[0].image_path}`
                };
            }
        }

        // 2. Search Pexels API
        const apiResponse = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`, {
            headers: { Authorization: PEXELS_API_KEY }
        });

        if (apiResponse.data.photos.length === 0) {
            throw new Error('No images found');
        }

        const imageUrl = apiResponse.data.photos[0].src.medium;
        const filename = await downloadAndSaveImage(
            imageUrl,
            keyword,
            path.join(__dirname, '../../public/images')
        );

        if (!filename) {
            throw new Error('Failed to save image');
        }

        // 3. Save to database
        await pool.query(
            'INSERT INTO images (keyword, image_path) VALUES ($1, $2)',
            [keyword, filename]
        );

        return {
            source: 'pexels',
            imageUrl: `/images/${filename}`
        };

    } catch (error) {
        console.error('Image search error:', error.message);
        throw error;
    }
};
