const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.searchImages = async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // 1. First check local storage
    const imagesDir = path.join(__dirname, '../../public/images');
    const files = fs.readdirSync(imagesDir);
    const matchedFiles = files.filter(file => 
      file.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedFiles.length > 0) {
      return res.json(matchedFiles.map(file => ({ 
        filename: file,
        source: 'local'
      }));
    }

    // 2. If not found locally, call web scraper
    const pythonScriptPath = path.join(__dirname, '../webscraper.py');
    exec(`python3 ${pythonScriptPath} "${query}"`, 
      { cwd: path.dirname(pythonScriptPath) },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing scraper: ${error}`);
          return res.status(500).json({ error: 'Failed to search for images' });
        }
        
        try {
          const result = JSON.parse(stdout);
          
          if (result.error) {
            console.error(`Scraping error: ${result.error}`);
            return res.status(404).json({ error: result.error });
          }
          
          if (result.filename) {
            // Verify the file was actually created
            const filePath = path.join(imagesDir, result.filename);
            if (fs.existsSync(filePath)) {
              return res.json([{
                filename: result.filename,
                source: 'web'
              }]);
            }
            return res.status(500).json({ error: 'Image downloaded but not found' });
          }
          
          return res.status(404).json({ error: 'Image not found' });
        } catch (e) {
          console.error(`Error parsing scraper output: ${e}`);
          return res.status(500).json({ error: 'Failed to process image results' });
        }
      });
  } catch (err) {
    console.error(`Server error: ${err}`);
    res.status(500).json({ error: 'Server error' });
  }
};
