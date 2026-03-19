<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# group-helper-0319

這裡包含在本地端運行應用程式以及部署至 GitHub Pages 的所有必要資訊。

## 本地端運行

**環境要求：** Node.js

1. 安裝依賴套件：
   `npm install`
2. 將 `.env.example` 複製一份並命名為 `.env.local`，接著將裡面的 `GEMINI_API_KEY` 換成你的 Gemini API key。
3. 啟動應用程式：
   `npm run dev`

## 部署上線

專案已在 `.github/workflows/deploy.yml` 配置好 GitHub Action。
部署步驟：
1. 將程式碼推送到 `main` 或 `master` 分支。
2. GitHub Action 會自動建置並發布到 GitHub Pages。
3. 請確保在儲存庫設定中（Settings > Pages），將來源 (Source) 設定為 **GitHub Actions** 即可。
