const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

// Set up storage for recorded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}.wav`);
  },
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Route for handling audio upload
app.post("/audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No audio file received");
  }

  console.log(`File saved: ${req.file.filename}`);
  res.status(200).send({ id: req.file.filename });
});

// Start the server
app.listen(port, () => {
  console.log(`Audio recorder app listening at http://localhost:${port}`);
});
