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

**Google 地圖使用者照片（主要）**：在 `itinerary.js` 填入 `GOOGLE_MAPS_API_KEY`，並在 Google Cloud 同一個專案啟用 **Maps JavaScript API** 與 **Places API (New)**，網站就會用每一站的 `query` 即時向 Google 讀取該地點的照片（含評論照片），卡片右側放第一張，展開區放最多 6 張，並標示拍攝者。依 Google 條款，這些照片不能下載存進專案，只能這樣即時顯示。

**開放授權實景照（沒有金鑰時的備用）**：`img/photos/` 裡的照片來自 [Wikimedia Commons](https://commons.wikimedia.org/)（CC BY-SA / CC0），只收照片就是該地點本身的圖，網站上標有作者與授權。不要放 AI 圖或非該地點的示意照。

`img/` 其他圖（兩位主角、兔子、女孩）是使用者提供的插畫。
