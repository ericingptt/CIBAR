# Changelog

## Sprint 0.2

- 移除首頁「開始調查」按鈕，首頁僅保留標題、簡短說明與語言選擇。
- 語言選擇後直接儲存語言代碼並進入 `scanner.html`。
- `scanner.html` 加入語言檢查，未選語言時自動導回首頁。
- `scanner.html` 加入約 1 秒 AI 初始化動畫。
- `scene01_line_teacher.html` 對話加入 typing indicator，並改為逐句顯示。
- LINE 對話速度調整為每則訊息約 1.5～2 秒，typing indicator 約 0.8～1 秒。
- 預留 FB / LINE / 廣告圖片路徑：
  - `assets/scenario01-investment/images/feed_bg.png`
  - `assets/scenario01-investment/images/ad_investment_01.png`
  - `assets/scenario01-investment/images/line_bg.png`
- 建立 `scenario01-investment` 素材資料夾，包含 `images/`、`audio/`、`video/`、`prompt/`。
