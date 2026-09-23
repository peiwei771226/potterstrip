# Potter's Trip

旅遊行程網站：左側是行程，右側是 Google 地圖。點左邊的景點，右邊地圖會直接跳到該景點；按「📍 我的即時位置」會持續追蹤目前所在位置。

## 修改行程

只要改 `itinerary.js`：每一天是 `days` 裡的一筆，每個景點填 `name`、`time`、`note`、`lat`、`lng`。
座標取得方式：在 Google 地圖對景點按右鍵，點選第一行的數字即可複製。

## 兩種地圖模式

| 模式 | 條件 | 效果 |
| --- | --- | --- |
| 嵌入地圖（預設） | `GOOGLE_MAPS_API_KEY` 留空 | 免金鑰。一次顯示一個點：點景點看景點，開即時位置就跟著你走 |
| 完整地圖 | 在 `itinerary.js` 填入金鑰 | 所有景點標記＋藍色即時位置點同時顯示在同一張地圖，點標記也會同步左側 |

金鑰申請：Google Cloud Console → 啟用「Maps JavaScript API」→ 建立 API 金鑰，並在金鑰限制中設定「網站」只允許 `https://peiwei771226.github.io/*`，避免被盜用。

## 上線（GitHub Pages）

Repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`。
約一分鐘後網址為 `https://peiwei771226.github.io/potterstrip/`。

> 即時定位需要 HTTPS，GitHub Pages 已內建；直接雙擊本機的 `index.html` 開啟時，部分瀏覽器會擋定位。
