(() => {
  const daysEl = document.getElementById("days");
  const spotsEl = document.getElementById("spots");
  const mapEl = document.getElementById("map");
  const frameEl = document.getElementById("map-frame");
  const locateBtn = document.getElementById("locate-btn");
  const statusEl = document.getElementById("status");

  const useJsApi = Boolean(GOOGLE_MAPS_API_KEY);
  const SPOT_ZOOM = 16;

  let currentDay = 0;
  let activeSpotEl = null;
  let watchId = null;
  let lastPos = null;

  // JS API 模式才會用到
  let map = null;
  let infoWindow = null;
  let meMarker = null;
  let meAccuracy = null;
  const markers = new Map(); // spot -> google.maps.Marker

  document.getElementById("trip-title").textContent = TRIP.title;
  document.getElementById("trip-subtitle").textContent = TRIP.subtitle;
  document.title = TRIP.title;

  // ---------- 左側行程 ----------
  function renderDays() {
    daysEl.innerHTML = "";
    TRIP.days.forEach((day, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day-tab";
      btn.textContent = `${day.label}・${day.date}`;
      btn.setAttribute("aria-pressed", String(i === currentDay));
      btn.addEventListener("click", () => selectDay(i));
      daysEl.appendChild(btn);
    });
  }

  function renderSpots() {
    spotsEl.innerHTML = "";
    activeSpotEl = null;
    TRIP.days[currentDay].spots.forEach((spot) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spot";
      btn.innerHTML = `
        <span class="spot__time"></span>
        <span class="spot__name"></span>
        <span class="spot__note"></span>`;
      btn.querySelector(".spot__time").textContent = spot.time || "";
      btn.querySelector(".spot__name").textContent = spot.name;
      btn.querySelector(".spot__note").textContent = spot.note || "";
      btn.addEventListener("click", () => selectSpot(spot, btn));
      li.appendChild(btn);
      spotsEl.appendChild(li);
    });
  }

  function selectDay(i) {
    currentDay = i;
    renderDays();
    renderSpots();
    const first = spotsEl.querySelector(".spot");
    if (first) selectSpot(TRIP.days[i].spots[0], first);
  }

  function selectSpot(spot, btn) {
    if (activeSpotEl) activeSpotEl.classList.remove("is-active");
    activeSpotEl = btn;
    btn.classList.add("is-active");
    showSpotOnMap(spot);
  }

  // ---------- 右側地圖 ----------
  function embedUrl(lat, lng, zoom) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=zh-TW&output=embed`;
  }

  function showSpotOnMap(spot) {
    if (useJsApi) {
      if (!map) return;
      map.panTo({ lat: spot.lat, lng: spot.lng });
      map.setZoom(SPOT_ZOOM);
      openInfo(spot);
    } else {
      // 嵌入模式一次只能顯示一個點，點景點時先停止跟隨自己
      if (watchId !== null) stopTracking();
      frameEl.src = embedUrl(spot.lat, spot.lng, SPOT_ZOOM);
    }
  }

  function openInfo(spot) {
    const marker = markers.get(spot);
    if (!marker) return;
    const box = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = spot.name;
    const note = document.createElement("div");
    note.textContent = spot.note || "";
    const link = document.createElement("a");
    link.href = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "在 Google 地圖導航";
    box.append(title, note, link);
    infoWindow.setContent(box);
    infoWindow.open({ map, anchor: marker });
  }

  // 由 Google Maps script 的 callback 呼叫
  window.initMap = () => {
    const first = TRIP.days[0].spots[0];
    map = new google.maps.Map(mapEl, {
      center: { lat: first.lat, lng: first.lng },
      zoom: SPOT_ZOOM,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true
    });
    infoWindow = new google.maps.InfoWindow();

    TRIP.days.forEach((day, d) => {
      day.spots.forEach((spot) => {
        const marker = new google.maps.Marker({
          map,
          position: { lat: spot.lat, lng: spot.lng },
          title: spot.name,
          label: { text: String(d + 1), color: "#ffffff", fontWeight: "700" }
        });
        marker.addListener("click", () => {
          if (d !== currentDay) selectDay(d);
          const idx = TRIP.days[d].spots.indexOf(spot);
          const btn = spotsEl.querySelectorAll(".spot")[idx];
          if (btn) selectSpot(spot, btn);
        });
        markers.set(spot, marker);
      });
    });

    selectDay(0);
  };

  function loadJsApi() {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&language=zh-TW&callback=initMap`;
    s.async = true;
    s.onerror = () => setStatus("Google 地圖載入失敗，請檢查 API 金鑰");
    document.head.appendChild(s);
  }

  // ---------- 即時位置 ----------
  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function distanceMeters(a, b) {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function onPosition(pos) {
    const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    const accuracy = Math.round(pos.coords.accuracy);
    const isFirst = lastPos === null;
    setStatus(`定位中・精確度約 ${accuracy} 公尺`);

    if (useJsApi) {
      if (!meMarker) {
        meMarker = new google.maps.Marker({
          map,
          position: here,
          title: "我的位置",
          zIndex: 999,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#1a73e8",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3
          }
        });
        meAccuracy = new google.maps.Circle({
          map,
          center: here,
          radius: accuracy,
          fillColor: "#1a73e8",
          fillOpacity: 0.12,
          strokeOpacity: 0,
          clickable: false
        });
      } else {
        meMarker.setPosition(here);
        meAccuracy.setCenter(here);
        meAccuracy.setRadius(accuracy);
      }
      if (isFirst) {
        map.panTo(here);
        map.setZoom(SPOT_ZOOM);
      }
    } else if (isFirst || distanceMeters(lastPos, here) > 30) {
      // 嵌入地圖每次更新都會重新載入，移動超過 30 公尺才更新
      frameEl.src = embedUrl(here.lat, here.lng, 17);
    }
    lastPos = here;
  }

  function onPositionError(err) {
    const msgs = {
      1: "未允許定位，請在瀏覽器設定開啟位置權限",
      2: "目前無法取得位置",
      3: "定位逾時，請再試一次"
    };
    setStatus(msgs[err.code] || "定位失敗");
    stopTracking(false);
  }

  function startTracking() {
    if (!("geolocation" in navigator)) {
      setStatus("此瀏覽器不支援定位");
      return;
    }
    if (activeSpotEl && !useJsApi) {
      activeSpotEl.classList.remove("is-active");
      activeSpotEl = null;
    }
    setStatus("取得位置中…");
    lastPos = null;
    watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000
    });
    locateBtn.setAttribute("aria-pressed", "true");
    locateBtn.textContent = "📍 停止即時位置";
  }

  function stopTracking(clearStatus = true) {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    locateBtn.setAttribute("aria-pressed", "false");
    locateBtn.textContent = "📍 我的即時位置";
    if (clearStatus) setStatus("");
    if (meMarker) {
      meMarker.setMap(null);
      meAccuracy.setMap(null);
      meMarker = null;
      meAccuracy = null;
    }
  }

  locateBtn.addEventListener("click", () => {
    if (watchId === null) startTracking();
    else stopTracking();
  });

  // ---------- 啟動 ----------
  locateBtn.setAttribute("aria-pressed", "false");
  if (useJsApi) {
    loadJsApi();
    renderDays();
    renderSpots();
  } else {
    mapEl.hidden = true;
    frameEl.hidden = false;
    selectDay(0);
  }
})();
