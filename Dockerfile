# 1. Node.js が入った軽いLinuxをベースにする
FROM node:20-alpine

# 2. 作業フォルダを作る
WORKDIR /app

# 3. package.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install   # ← devDependenciesも含めて全部インストール

# 4. プロジェクト全体をコピー
COPY . .

# 5. TypeScript をビルド（distフォルダができる）
RUN npm run build

# 6. このサーバーはポート3000で待ち受けます
EXPOSE 4000

# 7. サーバーを起動するコマンド
CMD ["npx", "tsx", "functions/index.ts"]

