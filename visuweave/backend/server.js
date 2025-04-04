const express = require("express");
const path = require("path");
const cors = require("cors"); // ✅ Import cors

const app = express();

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: "https://visu-weave-1.vercel.app/", // 🔁 Replace this with your actual frontend URL
  methods: ["GET"],
  credentials: true
}));

// Serve images from /public/images directory
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
