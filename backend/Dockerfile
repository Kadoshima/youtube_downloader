FROM node:18-alpine

# Install Python and other dependencies for youtube-dl-exec
RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /app

# Package files をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# ダウンロードディレクトリを作成
RUN mkdir -p /app/downloads

EXPOSE 3001

CMD ["node", "server.js"] 