# YouTube Downloader 使い方ガイド

## システムの起動

### Docker Composeを使った起動（推奨）

1. PowerShellまたはコマンドプロンプトを開く
2. プロジェクトのルートディレクトリに移動
```bash
cd C:\Users\tp240\Documents\Repositorys\youtube_downloader
```

3. Docker Composeで起動
```bash
docker-compose up --build
```

初回起動時は、Dockerイメージのビルドに数分かかることがあります。

## システムの使用方法

### 1. Webブラウザでアクセス

ブラウザで以下のURLにアクセス：
- http://localhost:3000

### 2. YouTube動画のURLを入力

ダウンロードしたいYouTube動画のURLを入力欄に貼り付けます。
例：`https://www.youtube.com/watch?v=XXXXXXXXXXX`

### 3. 動画情報を取得

「動画情報を取得」ボタンをクリックすると、以下の情報が表示されます：
- 動画のサムネイル
- タイトル
- 投稿者
- 再生時間
- 再生回数

### 4. ダウンロード設定

- **画質**: 利用可能な画質から選択（1080p, 720p, 480p など）
- **フォーマット**: 
  - MP4: 一般的な動画形式
  - WebM: Web用の動画形式
  - MP3: 音声のみ

### 5. ダウンロード実行

「ダウンロード」ボタンをクリックすると、ダウンロードが開始されます。
完了すると、自動的にダウンロードリンクが開きます。

## ダウンロードした動画の確認

ダウンロードした動画は以下の場所に保存されます：
- `C:\Users\tp240\Documents\Repositorys\youtube_downloader\downloads\`

## システムの停止

Docker Composeを停止するには：
```bash
# Ctrl+C でプロセスを停止後
docker-compose down
```

## トラブルシューティング

### ポートが使用中のエラー

他のアプリケーションがポート3000または3001を使用している場合：
1. `docker-compose.yml` ファイルを編集
2. ポート番号を変更（例：3000 → 3002）

### ダウンロードが失敗する

- YouTubeのURLが正しいか確認
- インターネット接続を確認
- 地域制限やプライベート動画でないか確認

### Dockerが起動しない

- Docker Desktopが起動しているか確認
- 管理者権限でPowerShellを実行しているか確認 