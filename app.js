(() => {
  const $ = (id) => document.getElementById(id);
  const daysEl = $("days");
  const stopsEl = $("stops");
  const mapEl = $("map");
  const frameEl = $("map-frame");
  const locateBtn = $("locate-btn");
  const openLink = $("open-link");
  const statusEl = $("status");

  const useJsApi = Boolean(GOOGLE_MAPS_API_KEY);
  const SPOT_ZOOM = 16;

  let currentDay = 0;
  let activeStopEl = null;
  let watchId = null;
  let lastPos = null;
  let lastAccuracy = 0;

  // JS API 模式才會用到
  let map = null;
  let infoWindow = null;
  let geocoder = null;
  let meMarker = null;
  let meAccuracy = null;
  const markers = new Map(); // searchTerm -> google.maps.Marker（同一地點只放一個標記）

  // hidden: true 的天數（還沒規劃好）不顯示
  const DAYS = TRIP.days.filter((d) => !d.hidden);
  const expanded = new Set(); // 已展開的卡片 "天數:站序"，切換語言時保留

  // ---------- 雙語 ----------
  const UI = {
    zh: {
      htmlLang: "zh-Hant", mapHl: "zh-TW",
      days: "選擇日期", warnings: "⚠︎ 出發前必看", resizer: "拖曳調整行程與地圖寬度",
      mapTitle: "Google 地圖", openMap: "在 Google 地圖開啟", navigate: "在 Google 地圖導航",
      locate: "📍 我的即時位置", stopLocate: "📍 停止即時位置",
      locating: "取得位置中…", tracking: (m) => `定位中・精確度約 ${m} 公尺`,
      noGeo: "此瀏覽器不支援定位", geoFail: "定位失敗",
      geoErr: { 1: "未允許定位，請在瀏覽器設定開啟位置權限", 2: "目前無法取得位置", 3: "定位逾時，請再試一次" },
      notFound: (n) => `找不到「${n}」的位置，請在行程檔補上 lat / lng`,
      mapLoadFail: "Google 地圖載入失敗，請檢查 API 金鑰", me: "我的位置", stops: "STOPS",
      more: "更多介紹 ▾", less: "收起 ▴", morePhotos: "📸 到 Google 地圖看更多實拍照片 ↗"
    },
    en: {
      htmlLang: "en", mapHl: "en",
      days: "Choose a day", warnings: "⚠︎ Before you go", resizer: "Drag to resize the itinerary and map",
      mapTitle: "Google Maps", openMap: "Open in Google Maps", navigate: "Navigate in Google Maps",
      locate: "📍 My live location", stopLocate: "📍 Stop live location",
      locating: "Finding your location…", tracking: (m) => `Live · accurate to ~${m} m`,
      noGeo: "This browser doesn't support location", geoFail: "Couldn't get your location",
      geoErr: { 1: "Location permission denied — enable it in browser settings", 2: "Location unavailable right now", 3: "Location timed out, please try again" },
      notFound: (n) => `Couldn't find "${n}" — add lat / lng in the itinerary file`,
      mapLoadFail: "Google Maps failed to load — check the API key", me: "My location", stops: "STOPS",
      more: "More details ▾", less: "Show less ▴", morePhotos: "📸 See more real photos on Google Maps ↗"
    }
  };
  const LANG_KEY = "potterstrip.lang";
  let lang = "zh";
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "zh" || saved === "en") lang = saved;
  } catch (e) { /* 無痕模式等情況讀不到，用預設中文 */ }

  // 資料欄位可以是字串或 { zh, en }；英文沒填就顯示中文
  function t(v) {
    if (v && typeof v === "object") return v[lang] || v.zh || "";
    return v || "";
  }
  const ui = (key) => UI[lang][key];

  function applyStaticText() {
    document.documentElement.lang = ui("htmlLang");
    $("trip-eyebrow").textContent = t(TRIP.eyebrow);
    $("trip-title").textContent = t(TRIP.title);
    $("trip-subtitle").textContent = t(TRIP.subtitle);
    $("trip-footer").textContent = t(TRIP.footer);
    document.title = t(TRIP.title);
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = ui(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-label]").forEach((n) => n.setAttribute("aria-label", ui(n.dataset.i18nLabel)));
    document.querySelectorAll("[data-i18n-title]").forEach((n) => n.setAttribute("title", ui(n.dataset.i18nTitle)));
    locateBtn.textContent = ui(watchId === null ? "locate" : "stopLocate");
    document.querySelectorAll(".lang__btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* 同上 */ }
    const activeIdx = activeStopEl ? [...stopsEl.querySelectorAll(".stop")].indexOf(activeStopEl) : -1;
    applyStaticText();
    renderDays();
    renderDay();
    // 保留原本選中的景點，不重新載入地圖
    const again = stopsEl.querySelectorAll(".stop")[activeIdx];
    if (again) { activeStopEl = again; again.classList.add("is-active"); }
    if (watchId !== null && lastPos) setStatus(ui("tracking")(lastAccuracy));
  }

  document.querySelectorAll(".lang__btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  // ---------- 左側行程 ----------
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderDays() {
    daysEl.innerHTML = "";
    DAYS.forEach((day, i) => {
      const btn = el("button", "day-tab", t(day.tab));
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(i === currentDay));
      btn.addEventListener("click", () => selectDay(i));
      daysEl.appendChild(btn);
    });
  }

  function renderDay() {
    const day = DAYS[currentDay];
    $("day-label").textContent = `${t(day.label)} · ${day.stops.length} ${ui("stops")}`;
    $("day-title").textContent = t(day.title);
    $("day-subtitle").textContent = t(day.subtitle);

    const statsEl = $("stats");
    statsEl.innerHTML = "";
    (day.stats || []).forEach((s) => {
      const li = el("li", "stat");
      const icon = el("span", "stat-icon", s.icon || "");
      icon.setAttribute("aria-hidden", "true");
      li.append(icon, el("span", "stat-num", t(s.num)), el("span", "stat-label", t(s.label)));
      statsEl.appendChild(li);
    });

    stopsEl.innerHTML = "";
    activeStopEl = null;
    day.stops.forEach((stop, i) => {
      const li = el("li");
      const card = el("div", stop.final ? "stop final" : "stop");
      card.dataset.num = String(i + 1);

      // 卡片主體：點了右側地圖跳到該地點
      const main = el("button", "stop-main");
      main.type = "button";
      const body = el("span", "stop-body");
      body.append(
        el("span", "stop-time", `${t(stop.time)}　·　${t(stop.kind)}`),
        el("span", "stop-name", t(stop.name)),
        el("span", "stop-desc", t(stop.desc))
      );
      if (stop.pills && stop.pills.length) {
        const meta = el("span", "stop-meta");
        stop.pills.forEach((p) => {
          meta.appendChild(el("span", p.warn ? "pill pill--warn" : "pill", p.warn ? `⚠︎ ${t(p.text)}` : t(p.text)));
        });
        body.appendChild(meta);
      }
      main.appendChild(body);
      // 插畫純裝飾，alt 留空
      if (stop.img) {
        const art = el("img", "stop-art");
        art.src = `img/${stop.img}.png`;
        art.alt = "";
        art.loading = "lazy";
        main.appendChild(art);
      } else if (stop.emoji) {
        const art = el("span", "stop-emoji stop-art", stop.emoji);
        art.setAttribute("aria-hidden", "true");
        main.appendChild(art);
      }
      main.addEventListener("click", () => selectStop(stop, card));
      card.appendChild(main);

      // 展開區：更多介紹＋名店清單，不影響地圖
      const hasMore = (stop.more && stop.more.length) || (stop.highlights && stop.highlights.length) ||
        (stop.photos && stop.photos.length) || stop.query;
      if (hasMore) {
        const key = `${currentDay}:${i}`;
        const panelId = `more-${currentDay}-${i}`;
        const toggle = el("button", "stop-toggle");
        toggle.type = "button";
        toggle.setAttribute("aria-controls", panelId);

        const panel = el("div", "stop-more");
        panel.id = panelId;
        const inner = el("div", "stop-more__inner");
        if (stop.more && stop.more.length) {
          const list = el("ul", "stop-more__list");
          stop.more.forEach((m) => {
            const item = el("li");
            item.innerHTML = t(m); // 行程檔是自己維護的，允許 <strong> 粗體
            list.appendChild(item);
          });
          inner.appendChild(list);
        }
        if (stop.highlights && stop.highlights.length) {
          const box = el("div", "stop-shops");
          box.appendChild(el("h3", "stop-shops__title", `🛍️ ${t(stop.highlightsTitle)}`));
          const rows = el("ul", "stop-shops__list");
          stop.highlights.forEach((h) => {
            const row = el("li", "stop-shops__row");
            row.append(el("span", "stop-shops__name", t(h.name)), el("span", "stop-shops__item", t(h.item)));
            rows.appendChild(row);
          });
          box.appendChild(rows);
          inner.appendChild(box);
        }
        if (stop.photos && stop.photos.length) {
          const gallery = el("ul", "stop-photos");
          stop.photos.forEach((ph) => {
            const item = el("li", "stop-photo");
            const fig = el("figure");
            const img = el("img");
            img.src = ph.src;
            img.alt = t(ph.caption);
            img.loading = "lazy";
            const cap = el("figcaption");
            const credit = el("a", "stop-photo__credit", `📷 ${ph.author} · ${ph.license}`);
            credit.href = ph.page;
            credit.target = "_blank";
            credit.rel = "noopener";
            cap.append(el("span", "stop-photo__caption", t(ph.caption)), credit);
            fig.append(img, cap);
            item.appendChild(fig);
            gallery.appendChild(item);
          });
          inner.appendChild(gallery);
        }
        if (stop.query) {
          const gmaps = el("a", "stop-gmaps", ui("morePhotos"));
          gmaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.query)}`;
          gmaps.target = "_blank";
          gmaps.rel = "noopener";
          inner.appendChild(gmaps);
        }
        panel.appendChild(inner);

        const setOpen = (open) => {
          card.classList.toggle("is-open", open);
          toggle.setAttribute("aria-expanded", String(open));
          toggle.textContent = open ? ui("less") : ui("more");
          panel.inert = !open;
          if (open) expanded.add(key);
          else expanded.delete(key);
        };
        toggle.addEventListener("click", () => setOpen(!card.classList.contains("is-open")));
        setOpen(expanded.has(key));
        card.append(toggle, panel);
      }

      li.appendChild(card);
      if (stop.transit) li.appendChild(el("div", "transit", t(stop.transit)));
      stopsEl.appendChild(li);
    });

    const warnEl = $("warnings");
    warnEl.innerHTML = "";
    (day.warnings || []).forEach((w) => {
      const li = el("li");
      li.innerHTML = t(w); // 行程檔是自己維護的，允許 <strong> 粗體
      warnEl.appendChild(li);
    });
    $("warnings-box").hidden = !(day.warnings && day.warnings.length);
  }

  function selectDay(i) {
    currentDay = i;
    renderDays();
    renderDay();
    const first = stopsEl.querySelector(".stop");
    if (first) selectStop(DAYS[i].stops[0], first);
  }

  function selectStop(stop, btn) {
    if (activeStopEl) activeStopEl.classList.remove("is-active");
    activeStopEl = btn;
    btn.classList.add("is-active");
    showStopOnMap(stop);
  }

  // ---------- 右側地圖 ----------
  function searchTerm(stop) {
    return stop.query || (stop.lat !== undefined ? `${stop.lat},${stop.lng}` : t(stop.name));
  }

  function embedUrl(q, zoom) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=${ui("mapHl")}&output=embed`;
  }

  function setOpenLink(q) {
    openLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }

  function showStopOnMap(stop) {
    setOpenLink(searchTerm(stop));
    if (useJsApi) {
      if (!map) return;
      locate(stop).then((pos) => {
        if (!pos) {
          setStatus(ui("notFound")(t(stop.name)));
          return;
        }
        map.panTo(pos);
        map.setZoom(SPOT_ZOOM);
        openInfo(stop);
      });
    } else {
      // 嵌入模式一次只能顯示一個點，點景點時先停止跟隨自己
      if (watchId !== null) stopTracking();
      frameEl.src = embedUrl(searchTerm(stop), SPOT_ZOOM);
    }
  }

  // 取得景點座標：有 lat/lng 直接用，沒有就用 query 查一次並快取
  const geoCache = new Map();
  function locate(stop) {
    if (stop.lat !== undefined) return Promise.resolve({ lat: stop.lat, lng: stop.lng });
    const q = searchTerm(stop);
    if (!geoCache.has(q)) {
      geoCache.set(q, geocoder.geocode({ address: q, region: "tw" })
        .then((res) => {
          const loc = res.results[0].geometry.location;
          return { lat: loc.lat(), lng: loc.lng() };
        })
        .catch(() => null));
    }
    return geoCache.get(q);
  }

  function openInfo(stop) {
    const marker = markers.get(searchTerm(stop));
    if (!marker) return;
    const box = el("div");
    box.style.color = "#111111";
    const link = el("a", "", ui("navigate"));
    link.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchTerm(stop))}`;
    link.target = "_blank";
    link.rel = "noopener";
    box.append(el("strong", "", t(stop.name)), el("div", "", `${t(stop.time)}　·　${t(stop.kind)}`), link);
    infoWindow.setContent(box);
    infoWindow.open({ map, anchor: marker });
  }

  // 由 Google Maps script 的 callback 呼叫
  window.initMap = () => {
    map = new google.maps.Map(mapEl, {
      center: { lat: 23.7, lng: 120.9 },
      zoom: 8,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true
    });
    infoWindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();

    DAYS.forEach((day, d) => {
      day.stops.forEach((stop, i) => {
        locate(stop).then((pos) => {
          if (!pos) return;
          const key = searchTerm(stop);
          if (markers.has(key)) return;
          const marker = new google.maps.Marker({
            map,
            position: pos,
            title: t(stop.name),
            label: { text: String(d + 1), color: "#080809", fontWeight: "700" }
          });
          marker.addListener("click", () => {
            if (d !== currentDay) selectDay(d);
            const btn = stopsEl.querySelectorAll(".stop")[i];
            if (btn) selectStop(stop, btn);
          });
          markers.set(key, marker);
        });
      });
    });

    selectDay(0);
  };

  function loadJsApi() {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&language=${ui("mapHl")}&region=TW&callback=initMap`;
    s.async = true;
    s.onerror = () => setStatus(ui("mapLoadFail"));
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
    lastAccuracy = accuracy;
    setStatus(ui("tracking")(accuracy));
    setOpenLink(`${here.lat},${here.lng}`);

    if (useJsApi) {
      if (!meMarker) {
        meMarker = new google.maps.Marker({
          map,
          position: here,
          title: ui("me"),
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
      frameEl.src = embedUrl(`${here.lat},${here.lng}`, 17);
    }
    lastPos = here;
  }

  function onPositionError(err) {
    stopTracking();
    setStatus(ui("geoErr")[err.code] || ui("geoFail"));
  }

  function startTracking() {
    if (!("geolocation" in navigator)) {
      setStatus(ui("noGeo"));
      return;
    }
    if (activeStopEl && !useJsApi) {
      activeStopEl.classList.remove("is-active");
      activeStopEl = null;
    }
    setStatus(ui("locating"));
    lastPos = null;
    watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000
    });
    locateBtn.setAttribute("aria-pressed", "true");
    locateBtn.textContent = ui("stopLocate");
  }

  function stopTracking() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    locateBtn.setAttribute("aria-pressed", "false");
    locateBtn.textContent = ui("locate");
    setStatus("");
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

  // ---------- 拖曳調整寬度 ----------
  const layoutEl = $("layout");
  const resizer = $("resizer");
  const PANEL_MIN = 300;
  const MAP_MIN = 320;
  const PANEL_DEFAULT = 460;
  const WIDTH_KEY = "potterstrip.panelWidth";

  function clampWidth(w) {
    const max = Math.max(PANEL_MIN, window.innerWidth - MAP_MIN);
    return Math.round(Math.min(Math.max(w, PANEL_MIN), max));
  }

  let panelWidth = PANEL_DEFAULT;

  function setPanelWidth(w, save) {
    const width = clampWidth(w);
    panelWidth = width;
    layoutEl.style.setProperty("--panel-w", `${width}px`);
    resizer.setAttribute("aria-valuenow", String(width));
    resizer.setAttribute("aria-valuemin", String(PANEL_MIN));
    resizer.setAttribute("aria-valuemax", String(clampWidth(Infinity)));
    if (save) {
      try { localStorage.setItem(WIDTH_KEY, String(width)); } catch (e) { /* 無痕模式等情況存不了，忽略 */ }
    }
  }

  function currentPanelWidth() {
    return $("panel").getBoundingClientRect().width;
  }

  resizer.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    resizer.setPointerCapture(e.pointerId);
    layoutEl.classList.add("is-resizing");
    const startX = e.clientX;
    const startW = currentPanelWidth();
    const onMove = (ev) => setPanelWidth(startW + ev.clientX - startX, false);
    const onUp = () => {
      layoutEl.classList.remove("is-resizing");
      resizer.removeEventListener("pointermove", onMove);
      resizer.removeEventListener("pointerup", onUp);
      resizer.removeEventListener("pointercancel", onUp);
      setPanelWidth(panelWidth, true);
    };
    resizer.addEventListener("pointermove", onMove);
    resizer.addEventListener("pointerup", onUp);
    resizer.addEventListener("pointercancel", onUp);
  });

  // 雙擊還原預設寬度
  resizer.addEventListener("dblclick", () => setPanelWidth(PANEL_DEFAULT, true));

  // 鍵盤：左右鍵微調，Shift 加大步距
  resizer.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 60 : 20;
    if (e.key === "ArrowLeft") setPanelWidth(panelWidth - step, true);
    else if (e.key === "ArrowRight") setPanelWidth(panelWidth + step, true);
    else if (e.key === "Home") setPanelWidth(PANEL_MIN, true);
    else if (e.key === "End") setPanelWidth(Infinity, true);
    else return;
    e.preventDefault();
  });

  window.addEventListener("resize", () => setPanelWidth(panelWidth, false));

  let savedWidth = PANEL_DEFAULT;
  try { savedWidth = Number(localStorage.getItem(WIDTH_KEY)) || PANEL_DEFAULT; } catch (e) { /* 同上 */ }
  setPanelWidth(savedWidth, false);

  // ---------- 啟動 ----------
  locateBtn.setAttribute("aria-pressed", "false");
  applyStaticText();
  if (useJsApi) {
    loadJsApi();
    renderDays();
    renderDay();
  } else {
    mapEl.hidden = true;
    frameEl.hidden = false;
    selectDay(0);
  }
})();
