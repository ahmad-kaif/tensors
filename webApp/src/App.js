import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

// Backend API URL
const API_URL = 'http://localhost:3001';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [noObjectsMessage, setNoObjectsMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setSnackbarMessage('Please select an image file (jpg, jpeg, png, etc.)');
        setSnackbarOpen(true);
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResults(null);
      setNoObjectsMessage(null);
      setError(null);
    }
  };

  const handleDetection = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setDetectionResults(null);
    setNoObjectsMessage(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch(`${API_URL}/api/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Detection failed');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if no objects were detected
      if (data.message && data.message.includes('No objects detected')) {
        setNoObjectsMessage(data.message);
        setDetectionResults([]);
      } else {
        setDetectionResults(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to process image. Please try again.');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Object Detection App
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Upload Image
            </Button>
          </label>

          {previewUrl && (
            <Box sx={{ mt: 2, position: 'relative' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px',
                  objectFit: 'contain'
                }} 
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleDetection}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <ImageIcon />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Detecting...' : 'Detect Objects'}
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {noObjectsMessage && (
            <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
              {noObjectsMessage}
            </Alert>
          )}

          {detectionResults && detectionResults.length > 0 && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Detection Results:
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                {detectionResults.map((result, index) => (
                  <Typography key={index}>
                    {result.class}: {Math.round(result.confidence * 100)}% confidence
                  </Typography>
                ))}
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default App; 