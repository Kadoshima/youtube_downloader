import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import { Download, YouTube, Settings } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [downloading, setDownloading] = useState(false);

  const handleGetInfo = async () => {
    if (!url) {
      setError('YouTubeのURLを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setVideoInfo(null);

    try {
      const response = await axios.get(`${API_URL}/api/video-info`, {
        params: { url }
      });
      setVideoInfo(response.data);
      if (response.data.availableQualities.length > 0) {
        setSelectedQuality(response.data.availableQualities[0]);
      }
    } catch (err) {
      setError('動画情報の取得に失敗しました。URLを確認してください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url || !videoInfo) {
      setError('まず動画情報を取得してください');
      return;
    }

    setDownloading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/api/download`, {
        url,
        quality: selectedQuality,
        format: selectedFormat
      });

      if (response.data.success) {
        setSuccess(`ダウンロード完了！ ファイル名: ${response.data.filename}`);
        // ダウンロードリンクを開く
        window.open(`${API_URL}${response.data.downloadUrl}`, '_blank');
      }
    } catch (err) {
      setError('ダウンロードに失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <YouTube sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            YouTube ダウンローダー
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="YouTube URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={loading || downloading}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetInfo}
            disabled={loading || downloading || !url}
            startIcon={loading ? <CircularProgress size={20} /> : <Settings />}
            fullWidth
          >
            {loading ? '情報を取得中...' : '動画情報を取得'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {videoInfo && (
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="300"
              image={videoInfo.thumbnail}
              alt={videoInfo.title}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {videoInfo.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {videoInfo.author}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`再生時間: ${formatDuration(videoInfo.lengthSeconds)}`} size="small" />
                <Chip label={`再生回数: ${parseInt(videoInfo.viewCount).toLocaleString()}`} size="small" />
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>画質</InputLabel>
                    <Select
                      value={selectedQuality}
                      onChange={(e) => setSelectedQuality(e.target.value)}
                      label="画質"
                    >
                      {videoInfo.availableQualities.map((quality) => (
                        <MenuItem key={quality} value={quality}>
                          {quality}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>フォーマット</InputLabel>
                    <Select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      label="フォーマット"
                    >
                      <MenuItem value="mp4">MP4</MenuItem>
                      <MenuItem value="webm">WebM</MenuItem>
                      <MenuItem value="mp3">MP3 (音声のみ)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleDownload}
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                fullWidth
                sx={{ mt: 3 }}
              >
                {downloading ? 'ダウンロード中...' : 'ダウンロード'}
              </Button>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
}

export default App; 