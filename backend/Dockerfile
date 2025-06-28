FROM node:18-alpine

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