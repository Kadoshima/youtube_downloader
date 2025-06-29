const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

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
    // Add requestOptions to handle current YouTube API
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      }
    });
    
    const formats = info.formats.map(format => ({
      itag: format.itag,
      quality: format.qualityLabel || format.quality,
      container: format.container,
      codecs: format.codecs,
      bitrate: format.bitrate,
      audioBitrate: format.audioBitrate,
      hasAudio: format.hasAudio,
      hasVideo: format.hasVideo,
      url: format.url
    }));

    res.json({
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      lengthSeconds: info.videoDetails.lengthSeconds,
      viewCount: info.videoDetails.viewCount,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      formats: formats,
      availableQualities: [...new Set(formats
        .filter(f => f.quality && f.hasVideo)
        .map(f => f.quality))]
    });
  } catch (error) {
    console.error('Error fetching video info:', error.message);
    console.error('Stack trace:', error.stack);
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
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    });
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // ファイル名に使えない文字を削除
    const timestamp = Date.now();
    const filename = `${title}_${timestamp}.${format || 'mp4'}`;
    const filePath = path.join(downloadsDir, filename);

    // ダウンロードオプションの設定
    const downloadOptions = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    };
    if (quality) {
      downloadOptions.quality = quality;
    }

    // ストリーミングダウンロード
    const stream = ytdl(url, downloadOptions);
    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total;
      console.log(`Downloaded ${(percent * 100).toFixed(2)}%`);
    });

    writeStream.on('finish', () => {
      res.json({
        success: true,
        filename: filename,
        downloadUrl: `/downloads/${filename}`,
        size: fs.statSync(filePath).size
      });
    });

    stream.on('error', (error) => {
      console.error('Download error:', error);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(500).json({ error: 'ダウンロードに失敗しました' });
    });

  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'ダウンロード処理でエラーが発生しました' });
  }
});

// ダウンロード可能なフォーマット一覧を取得
app.get('/api/formats', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URLが必要です' });
  }

  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    });
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
    
    res.json({
      formats: formats.map(format => ({
        quality: format.qualityLabel,
        container: format.container,
        size: format.contentLength ? parseInt(format.contentLength) : null
      }))
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