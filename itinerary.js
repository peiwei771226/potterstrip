// 行程資料：直接改這個檔案就能更新網站內容。
// 雙語：文字欄位可以寫 { zh: "中文", en: "English" }；只寫字串或沒填 en 時，英文模式會顯示中文。
// hidden: true 的那一天不會出現在網站上（還沒規劃好時用）。
// query：Google 地圖搜尋字串（右側地圖用它定位），寫越完整越準，不用翻譯。
// lat / lng：選填。只有填了 API 金鑰的「完整地圖」模式會用到，沒填會自動用 query 查座標。
// transit：從這一站到下一站的交通說明。
// pills：{ text, warn } warn 為 true 顯示橘色警示。
// img：卡片右側插畫（img/ 資料夾內檔名，不含 .png）；沒有插畫可改填 emoji。
const TRIP = {
  eyebrow: "ITINERARY · 2026–2027",
  title: "Potter's Taiwan Trip",
  subtitle: {
    zh: "給從馬來西亞來的 Potter　·小過 飲食禁忌:不吃牛肉",
    en: "For Potter from Malaysia · 小過 · Dietary restriction: no beef"
  },
  footer: "MADE FOR POTTER　·　TAIWAN 2026",
  days: [
    {
      tab: { zh: "12/31 四", en: "Dec 31 Thu" },
      label: "DAY 01",
      title: { zh: "台中 → 嘉義 → 阿里山", en: "Taichung → Chiayi → Alishan" },
      subtitle: { zh: "嘉義市美食文青 + 山區民宿入住", en: "Chiayi food & culture + a mountain B&B stay" },
      stats: [
        { icon: "📍", num: "6", label: "Stops" },
        { icon: "🛣️", num: "~200", label: "km" },
        { icon: "🚗", num: "~4h", label: "Drive" },
        { icon: "🏡", num: "19:45", label: "Check-in" }
      ],
      stops: [
        {
          time: "08:30", kind: { zh: "出發點", en: "Start" },
          name: { zh: "台中火車站", en: "Taichung Station" },
          desc: {
            zh: "走國道 1 號南下，車程約 2 小時。建議前一晚加滿油，早點出發避開跨年連假車潮。",
            en: "Head south on National Freeway 1, about 2 hours. Fill up the tank the night before and leave early to beat New Year's Eve traffic."
          },
          img: "train", query: "台中火車站", lat: 24.1372, lng: 120.6869,
          transit: { zh: "國道 1 號　·　約 2 小時　·　110 km", en: "Freeway 1 · ~2 hrs · 110 km" }
        },
        {
          time: "11:00–12:30", kind: { zh: "午餐", en: "Lunch" },
          name: { zh: "心宜草堂", en: "Xinyi Caotang (herbal cuisine)" },
          desc: {
            zh: "中藥行二樓的養生藥膳餐廳，招牌雞湯清爽不燥，適合當作進入嘉義的第一站。",
            en: "A herbal-cuisine restaurant above a traditional Chinese medicine shop. Its signature chicken soup is light and soothing — a gentle first stop in Chiayi."
          },
          pills: [{ text: { zh: "MON / TUE 公休", en: "Closed MON / TUE" }, warn: true }, { text: { zh: "建議先訂位", en: "Book ahead" } }],
          img: "bowl", query: "心宜草堂 嘉義市",
          transit: { zh: "開車 5 分鐘　·　1 km", en: "5 min drive · 1 km" }
        },
        {
          time: "12:45–15:45", kind: { zh: "景點", en: "Sightseeing" },
          name: { zh: "檜意森活村", en: "Hinoki Village" },
          desc: {
            zh: "日治時期林務局木造宿舍群，全台最大檜木日式建築聚落。29 棟老屋文創商店、和服體驗、庭園拍照，慢慢逛 2.5–3 小時。",
            en: "Japanese-era forestry staff quarters — Taiwan's largest cluster of cypress-wood Japanese buildings. 29 old houses with craft shops, kimono rental and gardens. Allow 2.5–3 hours."
          },
          pills: [{ text: { zh: "10:00–18:00 全年開放", en: "Open daily 10:00–18:00" } }],
          img: "fox", query: "檜意森活村 嘉義市",
          transit: { zh: "開車 10 分鐘　·　2 km（返回市區）", en: "10 min drive · 2 km (back downtown)" }
        },
        {
          time: "16:00–17:15", kind: { zh: "早鳥晚餐", en: "Early dinner" },
          name: { zh: "林聰明砂鍋魚頭（中正創始店）", en: "Lin Tsung-Ming Fish Head Casserole (original shop)" },
          desc: {
            zh: "嘉義必吃第一名。招牌砂鍋魚頭湯免費續加，另可加點火雞肉飯、滷豆腐蛋。此時段避開排隊尖峰。",
            en: "Chiayi's must-eat. Free refills of the signature fish-head casserole soup; add turkey rice and braised tofu & egg. Going early avoids the peak queue."
          },
          pills: [{ text: { zh: "TUE 公休", en: "Closed TUE" }, warn: true }, { text: { zh: "不接受訂位", en: "No reservations" }, warn: true }],
          img: "chef", query: "林聰明沙鍋魚頭 中正路 嘉義市",
          transit: { zh: "步行 1 分鐘　·　70 m（同一條中正路）", en: "1 min walk · 70 m (same street)" }
        },
        {
          time: "17:20–17:40", kind: { zh: "外帶飲料", en: "Drinks to go" },
          name: { zh: "源興御香屋（中正路二店）", en: "Yuan Xing Yu Xiang Wu (Zhongzheng Rd. branch)" },
          desc: {
            zh: "嘉義人氣飲品店。招牌葡萄柚綠茶、翠翠檸檬綠茶，買一杯上山車上慢慢喝。",
            en: "A popular local drink shop. Try the signature grapefruit green tea or lemon green tea for the drive up the mountain."
          },
          pills: [{ text: { zh: "MON / TUE 公休", en: "Closed MON / TUE" }, warn: true }],
          img: "drink", query: "源興御香屋 中正 嘉義市",
          transit: { zh: "台 18 阿里山公路　·　山路約 2 小時　·　55 km", en: "Hwy 18 Alishan Road · ~2 hrs mountain road · 55 km" }
        },
        {
          time: "19:45", kind: { zh: "抵達 Check-in", en: "Check-in" },
          name: { zh: "宣信民宿", en: "Xuanxin B&B" }, final: true,
          desc: {
            zh: "位於竹崎鄉中和村，距奮起湖車程 10 分鐘。周邊茶園環繞，夜晚可觀星——跨年夜就在山上看星星倒數。",
            en: "In Zhonghe Village, Zhuqi — 10 minutes' drive from Fenqihu. Surrounded by tea gardens; count down to the New Year under the stars."
          },
          pills: [{ text: { zh: "21:00 前入住 · 已預留緩衝", en: "Check in by 21:00 · buffer included" } }],
          img: "cabin", query: "宣信民宿 竹崎鄉中和村"
        }
      ],
      warnings: [
        {
          zh: "心宜草堂、源興御香屋都是<strong>週一、週二公休</strong>——12/31 是週四，不受影響",
          en: "Xinyi Caotang and Yuan Xing are <strong>closed Mon & Tue</strong> — Dec 31 is a Thursday, so we're fine"
        },
        {
          zh: "林聰明創始店<strong>不接受訂位</strong>，跨年當天人潮可能比平常多，早鳥時段更重要",
          en: "Lin Tsung-Ming <strong>takes no reservations</strong>; New Year's Eve may be busier than usual, so the early slot matters"
        },
        {
          zh: "台 18 阿里山公路夜間彎多、山霧多，<strong>建議天黑前上山</strong>；若延誤到 18:30 後仍未出發，請聯絡民宿說明晚到",
          en: "Highway 18 is winding and foggy at night — <strong>drive up before dark</strong>. If we still haven't left by 18:30, call the B&B about a late arrival"
        },
        {
          zh: "檜意森活村假日停車位緊張，可停在附近「嘉義文化創意產業園區」再步行 5 分鐘過來",
          en: "Parking at Hinoki Village is tight on holidays; park at the nearby Chiayi Cultural and Creative Industries Park and walk 5 minutes"
        }
      ]
    },
    {
      hidden: true, // 還沒規劃好，先不顯示
      tab: "1/1 五",
      label: "DAY 02",
      title: "阿里山元旦日出 → 奮起湖 → 台中",
      subtitle: "山上迎接 2027 第一道曙光，下山吃便當逛老街",
      stats: [
        { icon: "📍", num: "5", label: "Stops" },
        { icon: "🛣️", num: "~160", label: "km" },
        { icon: "🚗", num: "~4h", label: "Drive" },
        { icon: "🌇", num: "~18:00", label: "回台中" }
      ],
      stops: [
        {
          time: "05:40", kind: "摸黑出發", name: "宣信民宿",
          desc: "帶頭燈或手機手電筒、穿最厚的外套。元旦清晨山上氣溫可能只有個位數。",
          emoji: "🌙", query: "宣信民宿 竹崎鄉中和村",
          transit: "169 縣道 → 台 18　·　約 30–40 分鐘"
        },
        {
          time: "06:30–07:30", kind: "日出", name: "二延平步道",
          desc: "觀日、雲海、茶園景觀的平台步道，比祝山好到達。從停車場步行約 15 分鐘到觀景台，等 2027 年第一道日出。",
          pills: [{ text: "元旦人潮多 · 提早到", warn: true }],
          emoji: "🌄", query: "二延平步道",
          transit: "約 30–40 分鐘　·　回民宿"
        },
        {
          time: "08:15–09:45", kind: "早餐・退房", name: "宣信民宿",
          desc: "回民宿吃早餐、補眠一下再退房。退房時間請先跟民宿確認。",
          img: "bird", query: "宣信民宿 竹崎鄉中和村",
          transit: "開車 10 分鐘"
        },
        {
          time: "10:00–13:00", kind: "老街・午餐", name: "奮起湖老街",
          desc: "阿里山小火車中途站的山城老街。午餐吃奮起湖便當（排骨／雞腿，不含牛），逛車站、老街小吃與糕餅。",
          pills: [{ text: "便當無牛肉" }, { text: "假日停車較難", warn: true }],
          img: "train", query: "奮起湖老街",
          transit: "169 縣道下山 → 國道 3 號　·　約 2.5 小時　·　120 km"
        },
        {
          time: "~18:00", kind: "回到台中", name: "台中火車站", final: true,
          desc: "元旦收假車潮，國道 3 號北上傍晚可能回堵，時間抓寬一點。晚餐回台中再決定。",
          img: "station", query: "台中火車站", lat: 24.1372, lng: 120.6869
        }
      ],
      warnings: [
        "<strong>元旦阿里山會有交通管制</strong>，出發前一週查「阿里山國家森林遊樂區」與公路局的管制公告，確認台 18 線往石棹方向能否自駕通行",
        "二延平步道元旦也是熱門觀日點，停車位有限，<strong>越早到越好</strong>；若無法上去，民宿附近茶園也能看日出",
        "山上清晨很冷，<strong>馬來西亞來的朋友可能沒有厚外套</strong>——出發前確認 Potter 有羽絨衣、帽子、手套",
        "Potter 不吃牛：點餐時說「<strong>不要牛肉</strong>」，湯頭、滷味若不確定可以先問店家"
      ]
    }
  ]
};

// 選填：填入 Google Maps JavaScript API 金鑰，就能在同一張地圖上
// 同時顯示所有景點標記與你的即時位置。留空則使用免金鑰的嵌入地圖。
const GOOGLE_MAPS_API_KEY = "";
