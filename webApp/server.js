const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Configure multer to preserve file extensions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Get the file extension
    const ext = path.extname(file.originalname);
    // Create a unique filename with the original extension
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.post('/api/detect', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    // Use the existing model file in the model directory
    const modelPath = 'model/best.pt';
    
    // Run the Python script for inference
    const pythonProcess = spawn('python', [
      'detect.py',
      '--model', modelPath,
      '--image', req.file.path
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Clean up the uploaded file
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error('Error deleting uploaded file:', err);
      }

      if (code !== 0) {
        console.error('Python process error:', error);
        return res.status(500).json({ error: 'Detection failed' });
      }

      try {
        // Try to parse the result as JSON
        let detectionResults;
        try {
          detectionResults = JSON.parse(result);
        } catch (parseError) {
          console.error('Failed to parse detection results:', parseError);
          console.error('Raw result:', result);
          return res.status(500).json({ error: 'Failed to parse detection results' });
        }
        
        // Check if the result contains an error
        if (detectionResults.error) {
          return res.status(500).json({ error: detectionResults.error });
        }
        
        // Check if no objects were detected
        if (detectionResults.length === 0) {
          return res.json({ message: 'No objects detected in the image', detections: [] });
        }
        
        res.json(detectionResults);
      } catch (e) {
        console.error('Failed to process detection results:', e);
        res.status(500).json({ error: 'Failed to process detection results' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 