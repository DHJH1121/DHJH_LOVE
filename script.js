/**
 * Simple & Clean Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  "use strict";

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? "오전" : "오후";
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : "";
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Loading
     ═══════════════════════════════════════════ */

  // Use an explicit list when available so missing sequence numbers do not
  // trigger a long chain of 404 requests on mobile.
  function getConfiguredImagePaths(folder) {
    const files = CONFIG.images?.[folder];
    if (!Array.isArray(files)) return null;
    return files.map((file) => `images/${folder}/${file}`);
  }

  // Backward-compatible fallback for folders not listed in config.js.
  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise((resolve) => {
      const images = [];
      let current = 1;
      let consecutiveFails = 0;

      function tryNext() {
        if (current > maxAttempts || consecutiveFails >= 3) {
          resolve(images);
          return;
        }
        const img = new Image();
        const path = `images/${folder}/${current}.jpg`;
        img.onload = function () {
          images.push(path);
          consecutiveFails = 0;
          current++;
          tryNext();
        };
        img.onerror = function () {
          consecutiveFails++;
          current++;
          tryNext();
        };
        img.src = path;
      }

      tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Pinch-Zoom Guard
     ═══════════════════════════════════════════ */

  // iOS Safari ignores user-scalable=no, and Samsung Internet can allow
  // pinch-zoom as well, so zooms are blocked at the event level too.
  function initZoomGuard() {
    const preventEvent = (event) => event.preventDefault();

    // Non-standard events fired only on iOS Safari.
    document.addEventListener("gesturestart", preventEvent);
    document.addEventListener("gesturechange", preventEvent);
    document.addEventListener("gestureend", preventEvent);

    // Stop pinch gestures before they start (capture phase, window first).
    const blockMultiTouch = (event) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    ["touchstart", "touchmove"].forEach((eventName) => {
      window.addEventListener(eventName, blockMultiTouch, {
        passive: false,
        capture: true,
      });
      document.addEventListener(eventName, blockMultiTouch, {
        passive: false,
        capture: true,
      });
    });

    // Trackpad pinch-zoom on desktop browsers.
    document.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey) event.preventDefault();
      },
      { passive: false },
    );

    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) event.preventDefault();
        lastTouchEnd = now;
      },
      { passive: false },
    );
  }

  /* ═══════════════════════════════════════════
     Image Save Protection (롱프레스 저장 방지)
     ═══════════════════════════════════════════ */

  // CSS(-webkit-touch-callout:none + 투명 실드)가 1차 방어,
  // 아래 JS가 우클릭/드래그/롱프레스 메뉴를 2차로 차단합니다.
  function initImageProtection() {
    // 우클릭 / 롱프레스 메뉴 차단 (이미지 영역만)
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest("img, .gallery, .story, .hero, .photo-modal, .location__map")) {
        e.preventDefault();
      }
    });

    // 이미지 드래그 저장 차단
    document.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    });

    // iOS Safari 롱프레스 콜아웃 억제 (선택 영역 생성 방지)
    document.addEventListener("selectstart", (e) => {
      if (e.target.closest("img, .gallery, .story, .hero, .photo-modal")) {
        e.preventDefault();
      }
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      showToast(successMsg || "복사되었습니다");
    } catch {
      showToast("복사에 실패했습니다");
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute("content", content);
    };
    const ogImage = new URL("images/og/1.jpg", document.baseURI).href;
    setMeta("property", "og:title", m.title);
    setMeta("property", "og:description", m.description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:width", "4000");
    setMeta("property", "og:image:height", "6000");
    setMeta("property", "og:image:alt", `${m.title} 사진`);
    setMeta("name", "description", m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain (Simple Overlay)
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $("#curtain");
    const btn = $("#curtainBtn");
    const namesEl = $("#curtainNames");

    if (CONFIG.useCurtain === false) {
      curtain.style.display = "none";
      initPetals();
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;
    document.body.classList.add("no-scroll");

    btn.addEventListener("click", () => {
      curtain.classList.add("is-open");
      document.body.classList.remove("no-scroll");
      initPetals();
      setTimeout(() => {
        curtain.classList.add("is-hidden");
      }, 500);
    });
  }

  /* ═══════════════════════════════════════════
     Background Music
     ═══════════════════════════════════════════ */

  function initBgm() {
    const audio = $("#bgmAudio");
    const toggle = $("#bgmToggle");
    const curtainBtn = $("#curtainBtn");

    if (!audio || !toggle || !CONFIG.bgm?.enabled || !CONFIG.bgm.src) {
      toggle?.remove();
      audio?.remove();
      return;
    }

    const STORAGE_KEY = "bgm-muted";
    audio.src = CONFIG.bgm.src;
    audio.volume = 0.55;

    let muted = false;
    try {
      muted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage may be unavailable in private browsing.
    }

    function updateToggle() {
      const isPlaying = !audio.paused && !audio.ended;
      toggle.classList.toggle("is-playing", isPlaying);
      toggle.classList.toggle("is-muted", !isPlaying);
      toggle.setAttribute("aria-label", isPlaying ? "배경음악 끄기" : "배경음악 켜기");
      toggle.setAttribute("aria-pressed", String(isPlaying));
    }

    function playBgm() {
      if (muted) return;
      audio.play().catch(() => {
        // Browsers can reject playback until a user gesture is received.
        updateToggle();
      });
    }

    function stopBgm() {
      audio.pause();
      updateToggle();
    }

    function saveMuted(value) {
      muted = value;
      try {
        localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
      } catch {
        // Ignore storage errors; playback still works for this visit.
      }
    }

    toggle.addEventListener("click", () => {
      if (audio.paused) {
        saveMuted(false);
        playBgm();
      } else {
        saveMuted(true);
        stopBgm();
      }
    });

    ["play", "pause", "ended"].forEach((eventName) => {
      audio.addEventListener(eventName, updateToggle);
    });

    // The opening button is an explicit gesture, so it is safe on mobile.
    curtainBtn?.addEventListener("click", playBgm);

    // Also support invitations without a curtain. Do not auto-start when
    // the user is directly pressing the music toggle.
    const startOnFirstInteraction = (event) => {
      if (!event.target.closest("#bgmToggle")) playBgm();
      document.removeEventListener("pointerdown", startOnFirstInteraction);
    };
    document.addEventListener("pointerdown", startOnFirstInteraction);

    audio.addEventListener("error", () => {
      toggle.remove();
      audio.remove();
    });

    toggle.classList.add("is-visible");
    updateToggle();
  }

  /* ═══════════════════════════════════════════
     Falling Petals
     ═══════════════════════════════════════════ */

  function initPetals() {
    const canvas = $("#petals-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width;
    let height;
    const petals = [];
    const PETAL_COUNT = 25;
    const petalColors = [
      "rgba(183, 110, 121, 0.5)",
      "rgba(212, 160, 168, 0.45)",
      "rgba(245, 190, 195, 0.4)",
      "rgba(240, 180, 170, 0.35)",
      "rgba(200, 140, 150, 0.4)",
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createPetal() {
      return {
        x: Math.random() * width,
        y: -20 - Math.random() * height * 0.3,
        size: 6 + Math.random() * 10,
        speedY: 0.4 + Math.random() * 0.8,
        speedX: -0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: 0.3 + Math.random() * 0.4,
      };
    }

    function drawPetal(petal) {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.globalAlpha = petal.opacity;
      ctx.fillStyle = petal.color;

      const size = petal.size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        size * 0.3,
        -size * 0.4,
        size * 0.8,
        -size * 0.3,
        size * 0.5,
        0,
      );
      ctx.bezierCurveTo(
        size * 0.8,
        size * 0.3,
        size * 0.3,
        size * 0.4,
        0,
        0,
      );
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((petal) => {
        petal.wobble += petal.wobbleSpeed;
        petal.x += petal.speedX + Math.sin(petal.wobble) * 0.5;
        petal.y += petal.speedY;
        petal.rotation += petal.rotSpeed;

        if (petal.y > height + 20) {
          petal.y = -20;
          petal.x = Math.random() * width;
        }
        if (petal.x < -20) petal.x = width + 20;
        if (petal.x > width + 20) petal.x = -20;

        drawPetal(petal);
      });

      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PETAL_COUNT; i += 1) {
      petals.push(createPetal());
    }
    animate();
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    const heroPhoto = $("#heroPhoto");
    heroPhoto.src = "images/hero/1.jpg";
    heroPhoto.setAttribute("draggable", "false");
    heroPhoto.addEventListener("contextmenu", (e) => e.preventDefault());
    $("#heroNames").textContent =
      `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    $("#heroDate").textContent = formatDate(
      CONFIG.wedding.date,
      CONFIG.wedding.time,
    );
    $("#heroVenue").textContent = CONFIG.wedding.venue;
    $("#heroHall").textContent = CONFIG.wedding.hall;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;
      const labelEl = $("#countdownLabel");

      if (diff <= 0) {
        $("#countDays").textContent = "0";
        $("#countHours").textContent = "00";
        $("#countMinutes").textContent = "00";
        $("#countSeconds").textContent = "00";
        labelEl.textContent = "결혼식이 시작되었습니다";
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $("#countDays").textContent = days;
      $("#countHours").textContent = String(hours).padStart(2, "0");
      $("#countMinutes").textContent = String(minutes).padStart(2, "0");
      $("#countSeconds").textContent = String(seconds).padStart(2, "0");
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    $("#greetingTitle").textContent = CONFIG.greeting.title;
    $("#greetingContent").textContent = CONFIG.greeting.content;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentLine(father, mother, fatherDeceased, motherDeceased) {
      const fd = fatherDeceased ? " deceased" : "";
      const md = motherDeceased ? " deceased" : "";
      return `<span class="${fd}">${father}</span> · <span class="${md}">${mother}</span>`;
    }

    const parentsHTML = `
      <div class="parent-row">
        ${parentLine(g.father, g.mother, g.fatherDeceased, g.motherDeceased)}
        의 아들 <span class="child-name">${g.name}</span>
      </div>
      <div class="parent-row">
        ${parentLine(b.father, b.mother, b.fatherDeceased, b.motherDeceased)}
        의 딸 <span class="child-name">${b.name}</span>
      </div>
    `;

    $("#greetingParents").innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();

    const grid = $("#calendarGrid");

    const monthNames = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    grid.innerHTML = `<div class="calendar__header">${year}년 ${monthNames[month]}</div>`;

    // Weekdays
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const wdRow = document.createElement("div");
    wdRow.className = "calendar__weekdays";
    weekdays.forEach((wd) => {
      const el = document.createElement("span");
      el.className = "calendar__weekday";
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    // Days
    const daysContainer = document.createElement("div");
    daysContainer.className = "calendar__days";

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("span");
      empty.className = "calendar__day is-empty";
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement("span");
      dayEl.className = "calendar__day";
      if (d === weddingDay) dayEl.classList.add("is-today");
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate =
      endDt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + " ♥ " + CONFIG.bride.name + " 결혼식")}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + " " + CONFIG.wedding.address)}&details=${encodeURIComponent("결혼식에 초대합니다.")}`;
    $("#googleCalBtn").href = gcalUrl;

    // ICS download (Apple Calendar)
    $("#icsDownloadBtn").addEventListener("click", () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wedding//Invitation//KO",
        "BEGIN:VEVENT",
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        "DESCRIPTION:결혼식에 초대합니다.",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wedding.ics";
      a.click();
      URL.revokeObjectURL(url);
      showToast("캘린더 파일이 다운로드됩니다");
    });
  }

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    const container = $("#storyPhotos");
    const placeholder = container.querySelector(".loading-placeholder");
    if (placeholder) placeholder.remove();

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement("div");
      div.className = "story__photo-item animate-item";
      div.setAttribute("data-animate", "fade-up");
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy" decoding="async" draggable="false" oncontextmenu="return false">`; 
      container.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $("#galleryGrid");
    const placeholder = grid.querySelector(".loading-placeholder");
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const gallerySection = $("#gallery");
      if (gallerySection) gallerySection.style.display = "none";
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement("div");
      div.className = "gallery__item animate-item";
      div.setAttribute("data-animate", "fade-up");
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy" decoding="async" draggable="false" oncontextmenu="return false">`; 
      div.addEventListener("click", () => openPhotoModal(galleryImages, i));
      grid.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();
    $("#photoModal").classList.add("is-open");
    document.body.classList.add("no-scroll");
  }

  function closePhotoModal() {
    $("#photoModal").classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  }

  function showModalImage() {
    const img = $("#modalImg");
    img.src = modalImages[modalIndex];
    $("#modalCounter").textContent =
      `${modalIndex + 1} / ${modalImages.length}`;
    $("#modalPrev").style.display = modalIndex > 0 ? "" : "none";
    $("#modalNext").style.display =
      modalIndex < modalImages.length - 1 ? "" : "none";
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    const modalImg = $("#modalImg");
    modalImg.addEventListener("contextmenu", (e) => e.preventDefault());
    modalImg.addEventListener("dragstart", (e) => e.preventDefault());

    $("#modalClose").addEventListener("click", closePhotoModal);
    $("#modalPrev").addEventListener("click", () => modalNavigate(-1));
    $("#modalNext").addEventListener("click", () => modalNavigate(1));

    const modal = $("#photoModal");
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.id === "modalContainer") {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closePhotoModal();
      if (e.key === "ArrowLeft") modalNavigate(-1);
      if (e.key === "ArrowRight") modalNavigate(1);
    });

    // Swipe support
    const container = $("#modalContainer");

    container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true },
    );

    container.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
      },
      { passive: true },
    );
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);
    } else {
      modalNavigate(-1);
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    $("#locationVenue").textContent = w.venue;
    $("#locationHall").textContent = w.hall;
    $("#locationAddress").textContent = w.address;
    $("#locationTel").textContent = w.tel ? `Tel. ${w.tel}` : "";
    $("#locationMapImg").src = "images/location/1.jpg";
    $("#locationMapImg").setAttribute("draggable", "false");
    $("#locationMapImg").addEventListener("contextmenu", (e) =>
      e.preventDefault(),
    );
    $("#kakaoMapBtn").href = w.mapLinks.kakao || "#";
    $("#naverMapBtn").href = w.mapLinks.naver || "#";

    $("#copyAddressBtn").addEventListener("click", () => {
      const copyAddress = w.address.replace(/\s*신도림테크노마트$/, "");
      copyToClipboard(copyAddress, "주소가 복사되었습니다");
    });
  }

  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement("div");
      item.className = "account-item";
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ""}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ""}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = "0";
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, "groomAccountList");
    renderAccounts(CONFIG.accounts.bride, "brideAccountList");

    initAccordion("groomAccordion", "groomAccordionPanel");
    initAccordion("brideAccordion", "brideAccordionPanel");

    // Copy account delegates
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".account-item__copy");
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, "계좌번호가 복사되었습니다");
    });
  }

  /* ═══════════════════════════════════════════
     Quick Section Navigation
     ═══════════════════════════════════════════ */

  function initQuickNav() {
    const nav = $("#quickNav");
    if (!nav) return;

    const items = $$(".quick-nav__item", nav);
    let frameId = null;

    function getEntries() {
      return items
        .map((item) => {
          const target = document.getElementById(item.dataset.navTarget);
          const isVisible = target && getComputedStyle(target).display !== "none";
          item.hidden = !isVisible;
          return isVisible ? { item, target } : null;
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.target.getBoundingClientRect().top -
            b.target.getBoundingClientRect().top,
        );
    }

    function setActive(targetId) {
      items.forEach((item) => {
        const isActive = item.dataset.navTarget === targetId && !item.hidden;
        item.classList.toggle("is-active", isActive);
        if (isActive) {
          item.setAttribute("aria-current", "true");
        } else {
          item.removeAttribute("aria-current");
        }
      });
    }

    function updateActive() {
      frameId = null;
      const entries = getEntries();
      if (entries.length === 0) return;

      const marker = window.scrollY + window.innerHeight * 0.35;
      let current = entries[0].target;

      entries.forEach(({ target }) => {
        const top = target.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = target;
      });

      setActive(current.id);
    }

    function scheduleUpdate() {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateActive);
    }

    items.forEach((item) => {
      item.addEventListener("click", () => {
        const target = document.getElementById(item.dataset.navTarget);
        if (!target || item.hidden) return;

        setActive(target.id);
        window.scrollTo({
          top: Math.max(
            0,
            target.getBoundingClientRect().top + window.scrollY - 8,
          ),
          behavior: "smooth",
        });
      });
    });

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate, { once: true });

    if ("ResizeObserver" in window) {
      const main = $("#mainContent");
      if (main) new ResizeObserver(scheduleUpdate).observe(main);
    }

    scheduleUpdate();
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    $("#footerText").textContent =
      `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const storyPhotos = $("#storyPhotos");
    const galleryGrid = $("#galleryGrid");

    const placeholderHTML =
      '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    $$(".animate-item").forEach((el) => observer.observe(el));

    // Re-observe dynamically added items
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains("animate-item")) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node
              .querySelectorAll(".animate-item")
              .forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initZoomGuard();
    initImageProtection();
    initCurtain();
    initBgm();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    showLoadingPlaceholders();

    initPhotoModal();
    initLocation();
    initAccounts();
    initFooter();
    initQuickNav();
    initScrollAnimations();

    // Auto-detect images in parallel
    const [storyImages, galleryImages] = await Promise.all([
      getConfiguredImagePaths("story") || loadImagesFromFolder("story"),
      getConfiguredImagePaths("gallery") || loadImagesFromFolder("gallery"),
    ]);

    initStory(storyImages);
    initGallery(galleryImages);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
