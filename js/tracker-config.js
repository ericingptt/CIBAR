// MindAR 設定。之後只要換掉 .mind 檔案、調整 TRACKER_TARGETS 這個清單就好，
// 不需要改 js/tracker.js 裡的任何邏輯。

// 編譯好的 .mind 檔案路徑（用 https://hiukim.github.io/mind-ar-js-doc/tools/compile 編譯）。
// 注意：MindAR 一個追蹤流程只能載入一個 .mind 檔案，多張圖要「一起」丟進同一次編譯，
// 不能個別分開編譯再各自指向不同檔案。目前 assets/targets/ 底下的 teacher.mind、
// Kline.mind 是兩個各自獨立編譯出來的檔案，還不能直接用；要把兩張原圖一起重新編譯成
// 一個檔案（丟圖順序：先 teacher 後 Kline，才會對到下面 index 0／1），存成
// assets/targets/targets.mind 覆蓋掉這個路徑對應的檔案即可，不用改這裡的程式碼。
const TRACKER_TARGET_SRC = 'assets/targets/targets.mind';

// 每個 target 對應到 .mind 檔案裡的第幾張圖（index 從 0 開始，跟編譯時丟圖的順序一致）。
// route：偵測到這個 target 時要跳轉的頁面；還沒有情境頁面的 target 先留 null，
// tracker.js 只會替 route 不是 null 的 target 觸發跳轉（且只觸發一次），除錯用的
// 找到／遺失狀態顯示則不受 route 影響，全部 target 都會顯示。之後情境二～五的頁面
// 準備好了，直接把對應 target 的 route 填上就會開通跳轉，不用改 js/tracker.js。
const TRACKER_TARGETS = [
  { index: 0, name: 'target0 / teacher', route: 'scenario01-investment/index.html', label: '假投資' },
  { index: 1, name: 'target1 / kline', route: 'scenario01-investment/index.html', label: '假投資' },
  { index: 2, name: 'target2', route: null, label: null },
  { index: 3, name: 'target3', route: null, label: null },
  { index: 4, name: 'target4', route: null, label: null },
  { index: 5, name: 'target5', route: null, label: null },
  { index: 6, name: 'target6', route: null, label: null }
];
