# MindAR target 檔案

把用 [MindAR 線上編譯工具](https://hiukim.github.io/mind-ar-js-doc/tools/compile) 編譯好的
`.mind` 檔案放進這個資料夾，檔名要叫 `targets.mind`（對應 `js/tracker-config.js` 裡的
`TRACKER_TARGET_SRC` 常數）。放好之後不用改任何程式碼，重新整理 `scanner.html` 就會生效。

編譯工具會依照你丟圖的順序把每張圖編上 index（從 0 開始），這個 index 要跟
`js/tracker-config.js` 裡 `TRACKER_TARGETS` 陣列中每個 target 的 `index` 對上。之後要擴充到
5 個情境、共 15 個 target，就是把全部圖片一次編譯進同一個 `targets.mind`，再依序把
`TRACKER_TARGETS` 陣列補滿即可。
