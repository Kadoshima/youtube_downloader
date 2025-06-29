const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const youtubedl = require('youtube-dl-exec');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ダウンロードディレクトリの設定
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// 静的ファイルの提供
app.use('/downloads', express.static(downloadsDir));

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'YouTube Downloader API is running' });
});

// 動画情報取得エンドポイント
app.get('/api/video-info', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URLが必要です' });
  }

  try {
    // Get video info using youtube-dl-exec
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      ]
    });

    // Extract formats
    const formats = info.formats || [];
    const videoFormats = formats.filter(f => f.vcodec && f.vcodec !== 'none');
    
    // Get available qualities
    const availableQualities = [...new Set(videoFormats
      .filter(f => f.height)
      .map(f => `${f.height}p`)
      .sort((a, b) => parseInt(b) - parseInt(a)))];

    res.json({
      title: info.title,
      author: info.uploader || info.channel,
      lengthSeconds: info.duration,
      viewCount: info.view_count,
      thumbnail: info.thumbnail,
      formats: videoFormats.map(f => ({
        formatId: f.format_id,
        quality: f.height ? `${f.height}p` : f.format_note,
        ext: f.ext,
        filesize: f.filesize,
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec,
        url: f.url
      })),
      availableQualities
    });
  } catch (error) {
    console.error('Error fetching video info:', error.message);
    res.status(500).json({ 
      error: '動画情報の取得に失敗しました',
      details: error.message 
    });
  }
});

// ダウンロードエンドポイント
app.post('/api/download', async (req, res) => {
  const { url, quality, format } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URLが必要です' });
  }

  try {
    // First get video info to get the title
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true
    });
    
    const title = info.title.replace(/[^\w\s]/gi, '').substring(0, 50); // ファイル名に使えない文字を削除
    const timestamp = Date.now();
    const ext = format || 'mp4';
    const filename = `${title}_${timestamp}.${ext}`;
    const filePath = path.join(downloadsDir, filename);

    // Download options
    const downloadOptions = {
      output: filePath,
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      ]
    };

    // Add quality if specified
    if (quality) {
      if (quality === 'best') {
        downloadOptions.format = 'best';
      } else {
        // Convert quality like "720p" to height number "720"
        const height = quality.replace('p', '');
        downloadOptions.format = `best[height<=${height}]`;
      }
    } else {
      downloadOptions.format = 'best';
    }

    // If audio only is requested
    if (format === 'mp3' || format === 'm4a') {
      downloadOptions.extractAudio = true;
      downloadOptions.audioFormat = format;
      downloadOptions.format = 'bestaudio';
    }

    console.log('Downloading with options:', downloadOptions);

    // Start download
    await youtubedl(url, downloadOptions);

    // Check if file was created
    if (!fs.existsSync(filePath)) {
      throw new Error('Download completed but file not found');
    }

    const stats = fs.statSync(filePath);

    res.json({
      success: true,
      filename: filename,
      downloadUrl: `/downloads/${filename}`,
      size: stats.size
    });

  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ 
      error: 'ダウンロード処理でエラーが発生しました',
      details: error.message 
    });
  }
});

// ダウンロード可能なフォーマット一覧を取得
app.get('/api/formats', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URLが必要です' });
  }

  try {
    const info = await youtubedl(url, {
      listFormats: true,
      noCheckCertificates: true,
      noWarnings: true
    });
    
    res.json({
      formats: info
    });
  } catch (error) {
    console.error('Error fetching formats:', error);
    res.status(500).json({ error: 'フォーマット情報の取得に失敗しました' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`YouTube Downloader API Server is running on port ${PORT}`);
});