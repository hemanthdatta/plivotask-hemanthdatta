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
  Chip,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CloudUpload,
  RecordVoiceOver,
  ExpandMore,
  PlayArrow,
  Person,
  AccessTime,
  Refresh,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

function ConversationAnalysis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
      'audio/*': ['.wav', '.mp3', '.m4a', '.ogg', '.flac'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload an audio file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        process.env.NODE_ENV === 'production' 
          ? '/api/conversation' 
          : 'http://localhost:5000/api/skills/conversation',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setResult(response.data.result);
      toast.success('Audio analysis completed successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to analyze audio';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RecordVoiceOver sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Conversation Analysis
            </Typography>
            <Typography variant="body1">
              Upload audio files to convert speech to text with speaker diarization
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Upload Section */}
      {!result && (
        <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
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
                ? 'Drop the audio file here'
                : 'Drag & drop an audio file here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: WAV, MP3, M4A, OGG, FLAC (Max 50MB)
            </Typography>
          </Box>

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
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                  sx={{
                    background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                    },
                  }}
                >
                  {loading ? 'Analyzing...' : 'Analyze Audio'}
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

          {/* Memory Context */}
          {result.memory_context && result.memory_context.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Previous Conversation Context
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {result.memory_context.map((context, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                      • {context}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Transcription */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <RecordVoiceOver sx={{ mr: 1 }} /> Full Transcription
              </Typography>
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
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result.transcription || 'No transcription available'}
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* Speaker Diarization */}
          {result.speaker_diarization && result.speaker_diarization.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} /> Speaker Diarization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Identified {result.speaker_diarization.length} speaker(s) in the conversation
                </Typography>
                
                {result.speaker_diarization.map((speaker, speakerIndex) => (
                  <Accordion key={speakerIndex} defaultExpanded={speakerIndex === 0}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={speaker.speaker}
                          color={speakerIndex === 0 ? 'primary' : 'secondary'}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {speaker.segments.length} segment(s)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {speaker.segments.map((segment, segmentIndex) => (
                        <Box key={segmentIndex} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                            </Typography>
                          </Box>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              backgroundColor: 'grey.50',
                              borderLeft: '3px solid',
                              borderLeftColor: speakerIndex === 0 ? 'primary.main' : 'secondary.main',
                            }}
                          >
                            <Typography variant="body2">
                              {segment.text || '[No speech detected]'}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}

export default ConversationAnalysis;
