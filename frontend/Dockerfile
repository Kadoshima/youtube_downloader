FROM node:18-alpine

WORKDIR /app

# Package files をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# ビルド
RUN npm run build

# Serveをインストールして本番環境で使用
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"] 