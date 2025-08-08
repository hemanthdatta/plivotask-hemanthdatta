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
  TextField,
  Tab,
  Tabs,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Summarize,
  Link as LinkIcon,
  Description,
  Refresh,
  Analytics,
  Category,
  Info,
  InsertDriveFile,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

function DocumentSummarization() {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
      setResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleInputTypeChange = (event, newType) => {
    if (newType !== null) {
      setInputType(newType);
      setFile(null);
      setUrl('');
      setError('');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (inputType === 'file' && !file) {
      setError('Please upload a document first');
      return;
    }
    if (inputType === 'url' && !url) {
      setError('Please enter a URL first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      let response;

      if (inputType === 'file') {
        const formData = new FormData();
        formData.append('document', file);
        response = await axios.post(
          process.env.NODE_ENV === 'production' 
            ? '/api/summarize' 
            : 'http://localhost:5000/api/skills/summarize',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          process.env.NODE_ENV === 'production' 
            ? '/api/summarize' 
            : 'http://localhost:5000/api/skills/summarize',
          { url },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }

      setResult(response.data.result);
      toast.success('Content summarized successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to summarize content';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUrl('');
    setResult(null);
    setError('');
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatEntityList = (entitiesText) => {
    if (!entitiesText) return [];
    const lines = entitiesText.split('\n').filter(line => line.trim());
    const categories = [];
    let currentCategory = null;

    lines.forEach(line => {
      if (line.includes(':') && !line.startsWith(' ') && !line.startsWith('-')) {
        currentCategory = {
          name: line.split(':')[0].trim(),
          items: []
        };
        categories.push(currentCategory);
        const afterColon = line.split(':')[1];
        if (afterColon && afterColon.trim()) {
          currentCategory.items.push(afterColon.trim());
        }
      } else if (currentCategory && line.trim()) {
        currentCategory.items.push(line.replace(/^[-•]\s*/, '').trim());
      }
    });

    return categories;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Summarize sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Document & URL Summarization
            </Typography>
            <Typography variant="body1">
              Upload documents or provide URLs to get AI-powered summaries
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Input Section */}
      {!result && (
        <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Choose Input Type
            </Typography>
            <ToggleButtonGroup
              value={inputType}
              exclusive
              onChange={handleInputTypeChange}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="file" sx={{ px: 3 }}>
                <InsertDriveFile sx={{ mr: 1 }} />
                Upload Document
              </ToggleButton>
              <ToggleButton value="url" sx={{ px: 3 }}>
                <LinkIcon sx={{ mr: 1 }} />
                Enter URL
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {inputType === 'file' ? (
            <>
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
                    ? 'Drop the document here'
                    : 'Drag & drop a document here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 50MB)
                </Typography>
              </Box>

              {file && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="info" icon={<Description />}>
                    Selected file: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Alert>
                </Box>
              )}
            </>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                variant="outlined"
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                helperText="Enter a URL to summarize its content"
              />
            </Box>
          )}

          {(file || url) && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
                sx={{
                  background: 'linear-gradient(45deg, #ec4899 30%, #f472b6 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #db2777 30%, #ec4899 90%)',
                  },
                }}
              >
                {loading ? 'Summarizing...' : 'Generate Summary'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
              >
                Clear
              </Button>
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
              Summary Results
            </Typography>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<Refresh />}
            >
              New Summary
            </Button>
          </Box>

          {/* Metadata */}
          {(result.metadata || result.title || result.url) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {result.title && (
                    <Chip label={`Title: ${result.title}`} color="primary" size="small" />
                  )}
                  {result.url && (
                    <Chip 
                      label={result.url} 
                      icon={<LinkIcon />} 
                      size="small"
                      onClick={() => window.open(result.url, '_blank')}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                  {result.metadata?.type && (
                    <Chip label={`Type: ${result.metadata.type}`} size="small" />
                  )}
                  {result.metadata?.pages && (
                    <Chip label={`Pages: ${result.metadata.pages}`} size="small" />
                  )}
                  {result.word_count && (
                    <Chip label={`Words: ${result.word_count.toLocaleString()}`} size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Summary Content */}
          <Card>
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Brief Summary" icon={<Info />} iconPosition="start" />
                <Tab label="Detailed Summary" icon={<Analytics />} iconPosition="start" />
                <Tab label="Key Entities" icon={<Category />} iconPosition="start" />
              </Tabs>

              {/* Brief Summary Tab */}
              {tabValue === 0 && (
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      backgroundColor: 'primary.50',
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderLeftColor: 'primary.main',
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {result.brief_summary || 'No brief summary available'}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Detailed Summary Tab */}
              {tabValue === 1 && (
                <Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      backgroundColor: 'grey.50',
                      borderRadius: 2,
                      maxHeight: 500,
                      overflowY: 'auto',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {result.detailed_summary || 'No detailed summary available'}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Key Entities Tab */}
              {tabValue === 2 && (
                <Box>
                  {result.key_entities ? (
                    formatEntityList(result.key_entities).map((category, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                          {category.name}
                        </Typography>
                        <List dense>
                          {category.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex}>
                              <ListItemText
                                primary={item}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        {index < formatEntityList(result.key_entities).length - 1 && <Divider />}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No key entities extracted
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}

export default DocumentSummarization;
