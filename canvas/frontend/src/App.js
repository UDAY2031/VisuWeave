// App.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const symbolToFilename = {
  '+': 'plus',
  '-': 'minus',
  '*': 'times',
  '/': 'dividedby',
  '=': 'equals',
  '!': 'exclamation',
  '?': 'question',
  '@': 'at',
  '#': 'hash',
  '$': 'dollar',
  '%': 'percent',
  '^': 'caret',
  '&': 'and',
  '(': 'leftparenthesis',
  ')': 'rightparenthesis'
};

const toSingular = (word) => {
  const irregulars = {
    children: 'child',
    people: 'person',
    men: 'man',
    women: 'woman',
    feet: 'foot',
    teeth: 'tooth',
    mice: 'mouse',
    geese: 'goose'
  };
  return irregulars[word] || word;
};

const extractObjects = (text) => {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'to', 'of', 'in', 'on', 'at', 'for', 'with', 'under', 'over'
  ]);

  const cleanedText = text.toLowerCase().replace(/[^a-z0-9\s+*=!?@#$%^&()/-]/g, '');
  const words = cleanedText.split(/\s+/).filter(word => 
    word.length > 0 && !stopWords.has(word)
  );

  return words.map(word => {
    if (/^\d+$/.test(word)) return word;
    if (symbolToFilename[word]) return word;
    return toSingular(word);
  });
};

const App = () => {
  const [images, setImages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Welcome! Describe anything to see matching images.' }
  ]);
  const [browserSupport, setBrowserSupport] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  const imageTrackRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const checkImageExists = useCallback((url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }, []);

  const tryImageExtensions = useCallback(async (object) => {
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const imageUrlBase = 'http://localhost:5000/images/';
    
    for (const ext of extensions) {
      const exists = await checkImageExists(`${imageUrlBase}${object}${ext}`);
      if (exists) {
        return {
          url: `${imageUrlBase}${object}${ext}`,
          name: `${object}${ext}`,
          displayName: object
        };
      }
    }
    
    if (symbolToFilename[object]) {
      const symbolFile = symbolToFilename[object];
      for (const ext of extensions) {
        const exists = await checkImageExists(`${imageUrlBase}${symbolFile}${ext}`);
        if (exists) {
          return {
            url: `${imageUrlBase}${symbolFile}${ext}`,
            name: `${symbolFile}${ext}`,
            displayName: object
          };
        }
      }
    }
    
    return null;
  }, [checkImageExists]);

  const handleRecognitionError = useCallback((error) => {
    let errorMessage = 'Error occurred in speech recognition';
    if (error === 'not-allowed' || error.name === 'NotAllowedError') {
      errorMessage = 'Microphone access was denied. Please allow microphone access.';
    } else if (error === 'no-speech') {
      errorMessage = 'No speech detected. Try again.';
    }
    
    setError(errorMessage);
    setChatMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      setIsListening(true);
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Listening... Speak now" 
      }]);
      setError("");
    } catch (error) {
      handleRecognitionError(error);
    }
  }, [isListening, handleRecognitionError]);

  const processInput = useCallback(async (text = inputValue) => {
    const valueToUse = text.trim();
    if (!valueToUse) {
      setError("Please enter some text");
      return;
    }

    setIsLoading(true);
    setChatMessages(prev => [...prev, { 
      sender: 'user', 
      text: `Processing: "${valueToUse}"` 
    }]);

    try {
      const objects = extractObjects(valueToUse);
      
      if (objects.length === 0) {
        setError("No identifiable objects found");
        setChatMessages(prev => [...prev, { 
          sender: 'ai', 
          text: "I couldn't find any objects in that description." 
        }]);
        return;
      }

      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `Looking for: ${objects.join(', ')}` 
      }]);

      const foundImages = [];
      for (const obj of objects) {
        const image = await tryImageExtensions(obj);
        if (image) {
          foundImages.push(image);
        }
      }

      if (foundImages.length > 0) {
        setImages(foundImages);
        setChatMessages(prev => [...prev, { 
          sender: 'ai', 
          text: `Found ${foundImages.length} matching images in equation format` 
        }]);
        setInputValue("");
        setError("");
        setZoom(1);
      } else {
        const errorMsg = `No images found for "${valueToUse}"`;
        setError(errorMsg);
        setChatMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
      }
    } catch (err) {
      setError("Failed to process input");
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Sorry, there was an error processing your request." 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, tryImageExtensions]);

  const handleZoom = useCallback((direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? 
        Math.min(prev * 1.2, 3) : 
        Math.max(prev / 1.2, 0.5);
      return newZoom;
    });
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      processInput();
    }
  };

  const clearAll = () => {
    setImages([]);
    setChatMessages(prev => [...prev, { 
      sender: 'ai', 
      text: 'Canvas cleared. Ready for new input.' 
    }]);
    setZoom(1);
  };

  useEffect(() => {
    const initSpeechRecognition = async () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition not supported');
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript.trim();
          setInputValue(transcript);
          setChatMessages(prev => [...prev, { 
            sender: 'user', 
            text: `You said: ${transcript}` 
          }]);
          setIsListening(false);
          setTimeout(() => processInput(transcript), 500);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          handleRecognitionError(event.error);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } catch (error) {
        setBrowserSupport(false);
        handleRecognitionError(error);
      }
    };

    initSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [processInput, handleRecognitionError]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    if (imageTrackRef.current && images.length > 0) {
      const containerWidth = canvasContainerRef.current.clientWidth;
      const imageWidth = 150;
      const gap = 20;
      const totalWidth = images.length * (imageWidth + gap) - gap;
      
      if (totalWidth > containerWidth) {
        imageTrackRef.current.style.justifyContent = 'flex-start';
      } else {
        imageTrackRef.current.style.justifyContent = 'center';
      }
    }
  }, [chatMessages, images]);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="chat-container" ref={chatContainerRef}>
          {chatMessages.map((message, index) => (
            <div 
              key={index} 
              className={`chat-bubble ${message.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}
            >
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble ai-bubble">
              Processing your input...
            </div>
          )}
        </div>
        
        <button className="clear-button" onClick={clearAll}>
          Clear All
        </button>
      </div>

      <div className="main-content">
        <div className="canvas-container" ref={canvasContainerRef}>
          <div 
            className="canvas-content"
            style={{ transform: `scale(${zoom})` }}
          >
            {images.length > 0 ? (
              <div className="image-track" ref={imageTrackRef}>
                {images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image.url} alt={image.displayName} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                {browserSupport ? 'Speak or type to see images' : 'Type to see images'}
              </div>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div className="canvas-zoom-controls">
            <button 
              className="zoom-btn" 
              onClick={() => handleZoom('out')}
              disabled={zoom <= 0.5}
            >
              -
            </button>
            <div className="zoom-display">
              {Math.round(zoom * 100)}%
            </div>
            <button 
              className="zoom-btn" 
              onClick={() => handleZoom('in')}
              disabled={zoom >= 3}
            >
              +
            </button>
          </div>
        )}

        <div className="prompt-container">
          <div className="prompt-input-container">
            <button
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              disabled={isLoading || !browserSupport}
            >
              {isListening ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" fill="#EF4444"/>
                  <path d="M5 11C5.55228 11 6 11.4477 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 4.44772 11 5 11Z" fill="#EF4444"/>
                  <path d="M12 19C12.5523 19 13 19.4477 13 20V23C13 23.5523 12.5523 24 12 24C11.4477 24 11 23.5523 11 23V20C11 19.4477 11.4477 19 12 19Z" fill="#EF4444"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" fill="currentColor"/>
                  <path d="M5 11C5.55228 11 6 11.4477 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 4.44772 11 5 11Z" fill="currentColor"/>
                  <path d="M12 19C12.5523 19 13 19.4477 13 20V23C13 23.5523 12.5523 24 12 24C11.4477 24 11 23.5523 11 23V20C11 19.4477 11.4477 19 12 19Z" fill="currentColor"/>
                </svg>
              )}
            </button>
            <input
              type="text"
              className="prompt-input"
              placeholder={browserSupport ? 
                "Describe anything (e.g., 'guided meditation on sleep')..." : 
                "Type a description..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="generate-button"
              onClick={() => processInput()}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? 'Processing...' : 'Generate'}
            </button>
          </div>
          
          <div className="input-counter">
            {inputValue.length}/50
          </div>
          
          <div className="mic-status">
            {isListening ? 'Listening...' : error || 'Ready'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
