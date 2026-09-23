// 行程資料：直接改這個檔案就能更新網站內容。
// lat / lng 可在 Google 地圖上對景點按右鍵，點第一行的座標即可複製。
const TRIP = {
  title: "Potter's Trip",
  subtitle: "英國哈利波特朝聖之旅",
  days: [
    {
      label: "Day 1",
      date: "倫敦",
      spots: [
        { name: "King's Cross 9¾ 月台", time: "09:00", note: "推車穿牆拍照點，旁邊是官方商店。", lat: 51.5322, lng: -0.1240 },
        { name: "Leadenhall Market", time: "11:00", note: "電影中破釜酒吧、斜角巷的取景地。", lat: 51.5128, lng: -0.0835 },
        { name: "Millennium Bridge", time: "14:00", note: "《混血王子》食死人摧毀的那座橋。", lat: 51.5095, lng: -0.0985 },
        { name: "Palace Theatre", time: "19:00", note: "《被詛咒的孩子》舞台劇。", lat: 51.5129, lng: -0.1291 }
      ]
    },
    {
      label: "Day 2",
      date: "Leavesden",
      spots: [
        { name: "Warner Bros. Studio Tour London", time: "10:00", note: "片場導覽，建議預留 4–5 小時。", lat: 51.6906, lng: -0.4180 }
      ]
    },
    {
      label: "Day 3",
      date: "牛津",
      spots: [
        { name: "Christ Church", time: "10:00", note: "大廳樓梯是霍格華茲迎新場景。", lat: 51.7500, lng: -1.2555 },
        { name: "Bodleian Library・Divinity School", time: "13:00", note: "霍格華茲醫護室與圖書館取景地。", lat: 51.7540, lng: -1.2544 }
      ]
    },
    {
      label: "Day 4",
      date: "愛丁堡",
      spots: [
        { name: "Victoria Street", time: "09:30", note: "傳說中斜角巷的靈感來源。", lat: 55.9486, lng: -3.1935 },
        { name: "Greyfriars Kirkyard", time: "11:00", note: "找找 Tom Riddle 的墓碑。", lat: 55.9467, lng: -3.1920 },
        { name: "The Elephant House", time: "12:30", note: "J.K. 羅琳寫作的咖啡館（外觀）。", lat: 55.9474, lng: -3.1917 },
        { name: "The Balmoral Hotel", time: "15:00", note: "羅琳完成《死神的聖物》的飯店。", lat: 55.9533, lng: -3.1893 }
      ]
    },
    {
      label: "Day 5",
      date: "蘇格蘭高地",
      spots: [
        { name: "Glenfinnan Viaduct", time: "10:45", note: "霍格華茲特快車經過的高架橋。", lat: 56.8762, lng: -5.4321 }
      ]
    }
  ]
};

// 選填：填入 Google Maps JavaScript API 金鑰，就能在同一張地圖上
// 同時顯示所有景點標記與你的即時位置。留空則使用免金鑰的嵌入地圖。
const GOOGLE_MAPS_API_KEY = "";
