// MindAR 設定。之後只要換掉 .mind 檔案、調整 TRACKER_TARGETS 這個清單就好，
// 不需要改 js/tracker.js 裡的任何邏輯。

// 編譯好的 .mind 檔案路徑（用 https://hiukim.github.io/mind-ar-js-doc/tools/compile 編譯）。
// 目前 assets/targets/ 底下還沒有真的檔案，等拿到編譯好的檔案直接覆蓋這個路徑對應的檔案即可。
const TRACKER_TARGET_SRC = 'assets/targets/targets.mind';

// 每個 target 對應到 .mind 檔案裡的第幾張圖（index 從 0 開始，跟編譯時丟圖的順序一致）。
// 之後擴充到 5 個情境、共 15 個 target時，依序在這個陣列補上 { index, name } 就好。
const TRACKER_TARGETS = [
  { index: 0, name: '測試 Target 0' }
];
