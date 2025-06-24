# 🧠 VisuWeave

VisuWeave is an innovative full-stack web application designed to **translate speech into meaningful visuals** on a dynamic canvas. It intelligently retrieves or generates images based on spoken input using a prioritized pipeline and leverages **motion graph theory** to organize and display visuals fluidly.

---

## 🎯 Key Features

- 🎤 **Speech to Visuals**: Converts speech to text and identifies key concepts using NLP.
- 📦 **Multi-priority Image Retrieval**:
  - **Priority 1**: Search images in the **Database**.
  - **Priority 2**: If not found, scrape the web (**Webscraping**).
  - **Priority 3**: If still not found, use **AI image generation**.
  - **Priority 4**: As a fallback, use **Matplotlib** to create a structured image representation.
- 🎥 **Motion Graph Theory**: Arranges images on the canvas with smooth transitions and optimal placement.
- 🔍 **Piston Framework**: A novel verification method to validate the relevance of retrieved or generated images.

---

## 🧪 How It Works

### 1. **Speech Input**
- User provides a speech input.
- The system converts it to text using Speech-to-Text APIs.

### 2. **Keyword Extraction**
- NLP techniques extract the most relevant **keyword(s)** from the input.

### 3. **Image Retrieval Pipeline**
- Keywords are processed through the following prioritized flow:

<img src="public/priority.png" width="450" alt="Image Retrieval Pipeline">

#### ➤ Priority Order:
1. **Database**: Searches for keyword-matching images in a local or cloud-hosted database.
2. **Webscraping**: Dynamically scrapes images related to the keyword from the web.
3. **AI Image Generation**: Uses deep learning or diffusion models to generate custom images from text.
4. **Matplotlib**: As a last resort, visualizes the concept using plot-based representation.

### 4. **Canvas Visualization**
- Images are arranged on the **VisuWeave Canvas** using **motion graph theory** to ensure dynamic, aesthetically pleasing layouts.

### 5. **Verification with Piston Framework**
- A custom validation system named **Piston Framework** checks whether the image(s) displayed accurately represent the original speech intent.

---

## 📁 Project Structure

```bash
visuweave/
├── backend/
│   ├── index.js
│   ├── routes/
│   │   └── retrieval.js
│   ├── utils/
│   │   ├── speech.js
│   │   ├── nlp.js
│   │   ├── db.js
│   │   ├── scraper.js
│   │   ├── aiGen.js
│   │   └── piston.js
├── python_service/
│   └── fallback.py
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── public/
│   │   └── priority.png
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── components/
│           └── Canvas.jsx
├── README.md
└── package.json

```

## 🔧 Technologies Used

- **Frontend**: React.js, TailwindCSS, HTML5 Canvas
- **Backend**: Node.js / Express, Python (for NLP, Matplotlib)
- **Database**: PostgreSQL / MongoDB
- **Webscraping**: BeautifulSoup, Puppeteer
- **Image Generation**: OpenAI DALL·E, Stable Diffusion
- **Speech Recognition**: Google Speech-to-Text / Whisper
- **Validation Framework**: Piston Framework (Custom)

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/visuweave.git
cd visuweave
npm install
----------------------------------------------------------
For frontend:
cd frontend
npm start
----------------------------------------------------------
For backend:
cd backend
pip install -r requirements.txt
node server.js
----------------------------------------------------------
```
