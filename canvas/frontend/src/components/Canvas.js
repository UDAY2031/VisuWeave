import React, { useState, useEffect } from 'react';

const Canvas = ({ query }) => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!query || query.trim().length === 0) {
          setImages([]);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/images/search?query=${encodeURIComponent(query)}`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch images');
        }

        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
        setError(error.message);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent rapid API calls
    const debounceTimer = setTimeout(fetchImages, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found';
    e.target.style.objectFit = 'contain';
    e.target.style.backgroundColor = '#f0f0f0';
  };

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
      }}>
        {query ? `Results for: "${query}"` : 'Search for images to display'}
      </h2>

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '20px 0'
        }}>
          <div className="spinner"></div>
          <span style={{ marginLeft: '10px' }}>Searching for images...</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '4px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && query && (
        <div style={{
          textAlign: 'center',
          color: '#666',
          margin: '40px 0',
          fontSize: '1.1em'
        }}>
          No images found. Try a different search term.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {images.map((image, index) => (
          <div key={`${image.filename}-${index}`} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            ':hover': {
              transform: 'scale(1.02)'
            }
          }}>
            <div style={{
              height: '200px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={`http://localhost:5000/public/images/${image.filename}`}
                alt={image.filename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: '#fafafa',
              borderTop: '1px solid #eee',
              fontSize: '0.9em',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                color: image.source === 'local' ? '#2e7d32' : '#1565c0',
                fontWeight: '500'
              }}>
                {image.source.toUpperCase()}
              </span>
              <span style={{
                color: '#666',
                fontSize: '0.8em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '150px'
              }}>
                {image.filename}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Canvas;
