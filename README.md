# Potter's Taiwan Trip

幫馬來西亞朋友 Potter 規劃的台灣行程網站：左側是行程，右側是 Google 地圖。點左邊的景點，右邊地圖會直接跳到該景點；按「📍 我的即時位置」會持續追蹤目前所在位置。

## 修改行程

只要改 `itinerary.js`：每一天是 `days` 裡的一筆（上方日期分頁、統計列、出發前必看），每一站填 `time`、`kind`、`name`、`desc`、`query`，選填 `pills`（標籤）、`transit`（到下一站的交通）、`final`（當天終點打勾）。

**雙語**：左上角可切換中文 / EN。文字欄位寫成 `{ zh: "中文", en: "English" }`，沒寫英文的會直接顯示中文。

**先不顯示某天**：在那一天加 `hidden: true`（例如還沒規劃好的 1/1）。

右側地圖用 `query` 搜尋定位，寫「店名＋城市」最準。`lat` / `lng` 選填，只有完整地圖模式會用；沒填會自動用 `query` 查（需在金鑰啟用 Geocoding API）。

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

## 照片來源

`img/photos/` 裡的實拍照片都來自 [Wikimedia Commons](https://commons.wikimedia.org/)，授權為 CC BY-SA / CC0 / 公有領域。每張照片在網站上都標有作者與授權，點擊可到原始頁面。標「示意照」的不是該店家本身的照片。新增照片時請同樣只用開放授權的圖，不要直接抓部落格或店家照片。

`img/` 其他插畫取自使用者提供的 AI 生成圖。
