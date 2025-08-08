import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
} from '@mui/material';
import {
  RecordVoiceOver,
  Image,
  Summarize,
  ArrowForward,
  Analytics,
  SmartToy,
} from '@mui/icons-material';

function Dashboard({ user }) {
  const navigate = useNavigate();

  const skills = [
    {
      id: 'conversation',
      title: 'Conversation Analysis',
      description: 'Upload audio files to convert speech to text with speaker diarization for up to 2 speakers',
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />,
      color: '#6366f1',
      path: '/conversation',
      features: ['Speech-to-Text', 'Speaker Diarization', 'Conversation Timeline'],
    },
    {
      id: 'image',
      title: 'Image Analysis',
      description: 'Upload images to generate detailed AI-powered descriptions and extract text',
      icon: <Image sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      path: '/image',
      features: ['Detailed Descriptions', 'Object Detection', 'Text Extraction'],
    },
    {
      id: 'summarize',
      title: 'Document Summarization',
      description: 'Upload documents (PDF, DOC) or provide URLs to get concise summaries',
      icon: <Summarize sx={{ fontSize: 40 }} />,
      color: '#ec4899',
      path: '/summarize',
      features: ['PDF/DOC Support', 'URL Summarization', 'Key Entity Extraction'],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome to AI Playground
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95 }}>
              Hello, {user?.username}! Select a skill below to get started with AI-powered analysis.
            </Typography>
          </Box>
          <SmartToy sx={{ fontSize: 80, opacity: 0.9 }} />
        </Box>
      </Paper>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
              <Analytics />
            </Avatar>
            <Box>
              <Typography variant="h6">3</Typography>
              <Typography variant="body2" color="text.secondary">
                Available Skills
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6">Gemini AI</Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by Google
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Avatar sx={{ bgcolor: '#ec4899', mr: 2 }}>
              <RecordVoiceOver />
            </Avatar>
            <Box>
              <Typography variant="h6">Multi-Modal</Typography>
              <Typography variant="body2" color="text.secondary">
                Audio, Image, Text
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Skills Grid */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Available Skills
      </Typography>
      <Grid container spacing={3}>
        {skills.map((skill) => (
          <Grid item xs={12} md={4} key={skill.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${skill.color} 0%, ${skill.color}dd 100%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {skill.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  {skill.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {skill.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {skill.features.map((feature, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0.5,
                        color: skill.color,
                      }}
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(skill.path)}
                  sx={{
                    background: `linear-gradient(45deg, ${skill.color} 30%, ${skill.color}dd 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${skill.color}dd 30%, ${skill.color} 90%)`,
                    },
                  }}
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
