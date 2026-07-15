// MindAR 設定。之後只要換掉 .mind 檔案、調整 TRACKER_TARGETS 這個清單就好，
// 不需要改 js/tracker.js 裡的任何邏輯。

// 編譯好的 .mind 檔案路徑（用 https://hiukim.github.io/mind-ar-js-doc/tools/compile 編譯）。
// 注意：MindAR 一個追蹤流程只能載入一個 .mind 檔案，多張圖要「一起」丟進同一次編譯，
// 不能個別分開編譯再各自指向不同檔案。
const TRACKER_TARGET_SRC = 'assets/targets/targets.mind';

// 每個 target 對應到 .mind 檔案裡的第幾張圖（index 從 0 開始，跟編譯時丟圖的順序一致：
// teacher、kline、girl、girl1、girl2、girl3、express）。
// route：偵測到這個 target 時要跳轉的頁面；留 null 代表這個情境還不用跳轉，找到時只顯示
// 「偵測成功：xxx」文字。tracker.js 只看 route 是不是 null 來決定要不要跳轉，之後假交友、
// 假賣家的頁面做好了，直接把對應 target 的 route 填上就會開通跳轉，不用改 js/tracker.js。
const TRACKER_TARGETS = [
  { index: 0, name: 'target0 / teacher', scenario: 'investment', label: '假投資', route: 'scenario01-investment/index.html' },
  { index: 1, name: 'target1 / kline', scenario: 'investment', label: '假投資', route: 'scenario01-investment/index.html' },
  { index: 2, name: 'target2 / girl', scenario: 'romance', label: '假交友', route: null },
  { index: 3, name: 'target3 / girl1', scenario: 'romance', label: '假交友', route: null },
  { index: 4, name: 'target4 / girl2', scenario: 'romance', label: '假交友', route: null },
  { index: 5, name: 'target5 / girl3', scenario: 'romance', label: '假交友', route: null },
  { index: 6, name: 'target6 / express', scenario: 'shopping', label: '假賣家', route: null }
];
