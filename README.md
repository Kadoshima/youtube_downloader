# YouTube Downloader

Docker環境でnode-ytdl-coreを使用したYouTube動画ダウンローダーアプリケーション。
フロントエンドから画質、フォーマットを選択して簡単にYouTube動画をダウンロードできます。

## 機能

- YouTube動画の情報取得
- 画質の選択（利用可能な画質から選択）
- フォーマットの選択（MP4、WebM、MP3）
- 動画のダウンロード
- ダウンロード進捗の表示

## 技術スタック

- **バックエンド**: Node.js + Express + ytdl-core
- **フロントエンド**: React + Material-UI
- **インフラ**: Docker + Docker Compose

## セットアップと起動

### 必要な環境

- Docker
- Docker Compose

### 起動方法

1. リポジトリをクローン
```bash
git clone <repository-url>
cd youtube_downloader
```

2. Docker Composeで起動
```bash
docker-compose up --build
```

3. アプリケーションにアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### 開発環境での起動（Dockerを使わない場合）

#### バックエンド
```bash
cd backend
npm install
npm start
```

#### フロントエンド
```bash
cd frontend
npm install
npm start
```

## API エンドポイント

- `GET /health` - ヘルスチェック
- `GET /api/video-info?url={youtube-url}` - 動画情報の取得
- `POST /api/download` - 動画のダウンロード
  - Body: `{ url, quality, format }`
- `GET /api/formats?url={youtube-url}` - 利用可能なフォーマット一覧

## 使い方

1. フロントエンドにアクセス（http://localhost:3000）
2. YouTube動画のURLを入力
3. 「動画情報を取得」ボタンをクリック
4. 画質とフォーマットを選択
5. 「ダウンロード」ボタンをクリック

## 注意事項

- ダウンロードした動画は `backend/downloads` フォルダに保存されます
- YouTubeの利用規約に従って使用してください
- 個人利用の範囲でご使用ください

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

