import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  Refresh,
  Analytics,
  TextFields,
  Info,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

function ImageAnalysis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setError('');
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        process.env.NODE_ENV === 'production' 
          ? '/api/image' 
          : 'http://localhost:5000/api/skills/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setResult(response.data.result);
      toast.success('Image analysis completed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to analyze image';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ImageIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Image Analysis
            </Typography>
            <Typography variant="body1">
              Upload images to generate AI-powered descriptions and extract text
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Upload Section */}
      {!result && (
        <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={preview ? 6 : 12}>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.default',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  height: preview ? 300 : 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: PNG, JPG, JPEG, GIF, BMP, WEBP (Max 50MB)
                </Typography>
              </Box>
            </Grid>
            
            {preview && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  <Card>
                    <CardMedia
                      component="img"
                      height="300"
                      image={preview}
                      alt="Preview"
                      sx={{ objectFit: 'contain', backgroundColor: 'grey.100' }}
                    />
                  </Card>
                </Box>
              </Grid>
            )}
          </Grid>

          {file && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Selected file: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
                  sx={{
                    background: 'linear-gradient(45deg, #8b5cf6 30%, #a78bfa 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7c3aed 30%, #9333ea 90%)',
                    },
                  }}
                >
                  {loading ? 'Analyzing...' : 'Analyze Image'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      )}

      {/* Results Section */}
      {result && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Analysis Results
            </Typography>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<Refresh />}
            >
              New Analysis
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Image Preview */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  image={preview}
                  alt="Analyzed"
                  sx={{ height: 300, objectFit: 'contain', backgroundColor: 'grey.100' }}
                />
                {result.image_properties && (
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Image Properties
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label={`Size: ${result.image_properties.size}`} size="small" />
                      <Chip label={`Format: ${result.image_properties.format}`} size="small" />
                      <Chip label={`Mode: ${result.image_properties.mode}`} size="small" />
                    </Box>
                  </CardContent>
                )}
              </Card>
            </Grid>

            {/* Analysis Content */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="Summary" icon={<Info />} iconPosition="start" />
                    <Tab label="Detailed Analysis" icon={<Analytics />} iconPosition="start" />
                    <Tab label="Text Extraction" icon={<TextFields />} iconPosition="start" />
                  </Tabs>

                  {/* Summary Tab */}
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Brief Summary
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: 'primary.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body1">
                          {result.brief_summary || 'No summary available'}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Detailed Analysis Tab */}
                  {tabValue === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Detailed Analysis
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          maxHeight: 400,
                          overflowY: 'auto',
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {result.detailed_analysis || 'No detailed analysis available'}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Text Extraction Tab */}
                  {tabValue === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Extracted Text
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        This feature extracts any text found within the image using OCR
                      </Alert>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          maxHeight: 300,
                          overflowY: 'auto',
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {result.extracted_text || 'No text found in the image'}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}

export default ImageAnalysis;
