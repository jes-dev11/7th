(function () {
  "use strict";

  /* ---------------------------------------------------------
     CONFIG — edit these values
  --------------------------------------------------------- */
  var ENABLE_PASSWORD = false; // set true to require a password
  var SITE_PASSWORD = "monthsary"; // EDIT ME: the password / nickname / date
  var START_DATE = new Date("2025-12-30T00:00:00"); // EDIT ME: relationship start date
  var LETTER_TEXT =
    "Thank you for everything, especially sa pag-intindi mo sa'kin palagi. I know minsan e hindi ako madali intindihin, pero nandiyan ka pa rin no matter what, and sobrang thankful ako for that. Thank you for making me feel loved, safe, and happy. Every moment with you is something I truly cherish, whether we're doing something special or just spending time together. You always make even the simplest days feel better. I'm really grateful na ikaw ang partner ko. Kahit may mga challenges tayo, I'm happy because we always choose each other and keep moving forward together. I hope we continue to grow, support each other, and celebrate more milestones together.";
  var MEMORIES = [
    "Our first picture together.",
    "That day we laughed for hours.",
    "Our late-night calls.",
    "The first time you held my hand.",
    "Watching movies together.",
    "The silly nickname only we know.",
    "That random Tuesday that felt perfect.",
  ];
  var LOVE_NOTES = [
    "you're my favorite person 💗",
    "still falling for you",
    "lucky to call you mine",
    "my heart smiles for you",
    "forever grateful for us",
  ];

  /* ---------------------------------------------------------
     LOADING SCREEN
  --------------------------------------------------------- */
  window.addEventListener("load", function () {
    setTimeout(function () {
      document.getElementById("loading-screen").classList.add("hidden");
      document.body.classList.remove("locked");
      if (!ENABLE_PASSWORD) {
        document.getElementById("password-screen").classList.add("hidden");
        fireConfetti();
      } else {
        document.getElementById("password-screen").classList.remove("hidden");
        document.body.classList.add("locked");
      }
    }, 1200);
  });

  /* ---------------------------------------------------------
     PASSWORD GATE
  --------------------------------------------------------- */
  var pwInput = document.getElementById("password-input");
  var pwSubmit = document.getElementById("password-submit");
  var pwError = document.getElementById("password-error");
  function tryUnlock() {
    var val = (pwInput.value || "").trim().toLowerCase();
    if (val === SITE_PASSWORD.toLowerCase()) {
      document.getElementById("password-screen").classList.add("hidden");
      document.body.classList.remove("locked");
      fireConfetti();
    } else {
      pwError.textContent = "Not quite — try again, my love 💗";
    }
  }
  pwSubmit.addEventListener("click", tryUnlock);
  pwInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tryUnlock();
  });

  /* ---------------------------------------------------------
     DARK MODE TOGGLE
  --------------------------------------------------------- */
  var darkToggle = document.getElementById("dark-toggle");
  function setDark(on) {
    document.documentElement.classList.toggle("dark", on);
    darkToggle.textContent = on ? "☀️" : "🌙";
    buildStars(on);
  }
  darkToggle.addEventListener("click", function () {
    setDark(!document.documentElement.classList.contains("dark"));
  });

  /* ---------------------------------------------------------
     STICKY NAV — smooth scroll + active link highlighting
  --------------------------------------------------------- */
  var navLinks = document.querySelectorAll("#site-nav a");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section, #hero"),
  );
  function updateActiveNav() {
    var pos = window.scrollY + window.innerHeight / 3;
    sections.forEach(function (sec) {
      var link = document.querySelector('#site-nav a[href="#' + sec.id + '"]');
      if (!link) return;
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(function (l) {
          l.classList.remove("active");
        });
        link.classList.add("active");
      }
    });
  }

  /* ---------------------------------------------------------
     SCROLL TO TOP + nav highlight + reveal-on-scroll
  --------------------------------------------------------- */
  var scrollTopBtn = document.getElementById("scroll-top");
  var revealEls = document.querySelectorAll(".reveal");
  function onScroll() {
    if (window.scrollY > 500) scrollTopBtn.classList.add("show");
    else scrollTopBtn.classList.remove("show");
    updateActiveNav();
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) el.classList.add("visible");
    });
    maybeShowLoveNote();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     LAZY LOAD GALLERY IMAGES (placeholder-aware)
  --------------------------------------------------------- */
  var lazyImgs = document.querySelectorAll("img.lazy-img");
  function loadImg(img) {
    var src = img.getAttribute("data-src");
    var testImg = new Image();
    testImg.onload = function () {
      img.src = src;
      img.classList.add("loaded");
    };
    testImg.onerror = function () {
      // no real photo found yet — show a clean soft placeholder instead of a
      // broken-image icon. We keep the <img> in place (so it still reserves
      // its sized box for layout) but make it invisible, and paint the
      // gradient + label onto the parent card behind it instead.
      img.removeAttribute("src");
      img.removeAttribute("alt");
      img.style.visibility = "hidden";
      img.classList.add("loaded");
      var card = img.parentElement;
      card.style.position = "relative";
      card.classList.add("gallery-placeholder");
      var label = document.createElement("div");
      label.className = "gallery-placeholder-label";
      label.textContent = "📷 " + src.split("/").pop();
      card.appendChild(label);
    };
    testImg.src = src;
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadImg(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "150px" },
    );
    lazyImgs.forEach(function (img) {
      io.observe(img);
    });
  } else {
    lazyImgs.forEach(loadImg);
  }

  /* ---------------------------------------------------------
     LIGHTBOX
  --------------------------------------------------------- */
  var galleryItems = Array.prototype.slice.call(
    document.querySelectorAll(".gallery-item"),
  );
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxPlaceholder = document.getElementById("lightbox-placeholder");
  var currentIndex = 0;
  function openLightbox(i) {
    currentIndex = i;
    var card = galleryItems[i];
    var img = card.querySelector("img");
    if (card.classList.contains("gallery-placeholder")) {
      // no real photo added yet — show a friendly placeholder instead of
      // a broken image icon
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
      lightboxImg.style.display = "none";
      lightboxPlaceholder.textContent =
        "📷 Add your photo here\n(" + img.getAttribute("data-src") + ")";
      lightboxPlaceholder.style.display = "flex";
    } else {
      lightboxImg.style.display = "block";
      lightboxPlaceholder.style.display = "none";
      lightboxImg.src = img.src;
      lightboxImg.alt = img.getAttribute("data-cap") || "";
    }
    lightbox.classList.add("open");
  }
  galleryItems.forEach(function (item, i) {
    item.addEventListener("click", function () {
      openLightbox(i);
    });
  });
  document
    .getElementById("lightbox-close")
    .addEventListener("click", function () {
      lightbox.classList.remove("open");
    });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) lightbox.classList.remove("open");
  });
  document
    .getElementById("lightbox-prev")
    .addEventListener("click", function () {
      openLightbox(
        (currentIndex - 1 + galleryItems.length) % galleryItems.length,
      );
    });
  document
    .getElementById("lightbox-next")
    .addEventListener("click", function () {
      openLightbox((currentIndex + 1) % galleryItems.length);
    });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") lightbox.classList.remove("open");
    if (e.key === "ArrowLeft")
      openLightbox(
        (currentIndex - 1 + galleryItems.length) % galleryItems.length,
      );
    if (e.key === "ArrowRight")
      openLightbox((currentIndex + 1) % galleryItems.length);
  });

  /* ---------------------------------------------------------
     LOVE LETTER — typewriter effect (plays once visible)
  --------------------------------------------------------- */
  var letterEl = document.getElementById("letter-text");
  var letterTyped = false;
  function typeLetter() {
    if (letterTyped) return;
    var rect = letterEl.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.85) return;
    letterTyped = true;
    var i = 0;
    var cursor = document.createElement("span");
    cursor.className = "cursor-blink";
    function type() {
      if (i <= LETTER_TEXT.length) {
        letterEl.textContent = LETTER_TEXT.slice(0, i);
        letterEl.appendChild(cursor);
        i++;
        setTimeout(type, 22);
      } else {
        cursor.remove();
      }
    }
    type();
  }
  window.addEventListener("scroll", typeLetter, { passive: true });
  typeLetter();

  /* ---------------------------------------------------------
     MEMORY JAR
  --------------------------------------------------------- */
  var jar = document.getElementById("jar-icon");
  var memoryText = document.getElementById("memory-text");
  var jarHint = document.getElementById("jar-hint");
  function pullMemory() {
    var idx = Math.floor(Math.random() * MEMORIES.length);
    memoryText.textContent = "💭 " + MEMORIES[idx];
    jarHint.textContent = "tap again for another memory ✨";
    burstHeartsAt(jar.getBoundingClientRect());
  }
  jar.addEventListener("click", pullMemory);
  jar.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pullMemory();
    }
  });
  function updateCounter() {
    var START_DATE = new Date("2025-11-03T00:00:00");
    var now = new Date();
    var diffMs = now - START_DATE;
    if (diffMs < 0) diffMs = 0;
    var totalSeconds = Math.floor(diffMs / 1000);
    var months =
      (now.getFullYear() - START_DATE.getFullYear()) * 12 +
      (now.getMonth() - START_DATE.getMonth());
    if (now.getDate() < START_DATE.getDate()) months--;
    if (months < 0) months = 0;
    var monthAnchor = new Date(START_DATE);
    monthAnchor.setMonth(monthAnchor.getMonth() + months);
    var remainderMs = now - monthAnchor;
    var days = Math.floor(remainderMs / 86400000);
    var hours = Math.floor((remainderMs % 86400000) / 3600000);
    var minutes = Math.floor((remainderMs % 3600000) / 60000);
    var seconds = Math.floor((remainderMs % 60000) / 1000);
    document.getElementById("c-months").textContent = months;
    document.getElementById("c-days").textContent = days;
    document.getElementById("c-hours").textContent = hours;
    document.getElementById("c-minutes").textContent = minutes;
    document.getElementById("c-seconds").textContent = seconds;
  }
  updateCounter();
  setInterval(updateCounter, 1000);

  /* ---------------------------------------------------------
     SECRET BUTTON
  --------------------------------------------------------- */
  var secretBtn = document.getElementById("secret-btn");
  var secretReveal = document.getElementById("secret-reveal");
  secretBtn.addEventListener("click", function () {
    secretReveal.classList.toggle("show");
    burstHeartsAt(secretBtn.getBoundingClientRect());
  });

  /* ---------------------------------------------------------
     MUSIC PLAYER
  --------------------------------------------------------- */
  var audio = document.getElementById("bg-audio");
  var musicToggle = document.getElementById("music-toggle");
  var musicPlayer = document.getElementById("music-player");
  var musicEq = document.getElementById("music-eq");
  musicToggle.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().catch(function () {
        /* file likely not replaced yet */
      });
      musicToggle.textContent = "⏸";
      musicPlayer.classList.add("playing");
      musicEq.style.display = "flex";
    } else {
      audio.pause();
      musicToggle.textContent = "▶";
      musicPlayer.classList.remove("playing");
      musicEq.style.display = "none";
    }
  });

  /* ---------------------------------------------------------
     AMBIENT LAYER: floating hearts / petals + cursor sparkles + stars
  --------------------------------------------------------- */
  var ambient = document.getElementById("ambient-layer");
  var floatieChars = ["💗", "💕", "💖", "🌸", "💮", "✨"];
  function spawnFloatie() {
    var el = document.createElement("div");
    el.className = "floatie";
    el.textContent =
      floatieChars[Math.floor(Math.random() * floatieChars.length)];
    var size = 14 + Math.random() * 18;
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = size + "px";
    el.style.setProperty("--drift", Math.random() * 120 - 60 + "px");
    var duration = 9 + Math.random() * 10;
    el.style.animationDuration = duration + "s";
    ambient.appendChild(el);
    setTimeout(
      function () {
        el.remove();
      },
      duration * 1000 + 500,
    );
  }
  setInterval(spawnFloatie, 900);
  for (var k = 0; k < 6; k++) setTimeout(spawnFloatie, k * 300);

  // cursor sparkles (desktop only, throttled)
  var lastSparkle = 0;
  document.addEventListener("mousemove", function (e) {
    var now = Date.now();
    if (now - lastSparkle < 60) return;
    lastSparkle = now;
    var s = document.createElement("div");
    s.className = "sparkle-cursor";
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    document.body.appendChild(s);
    setTimeout(function () {
      s.remove();
    }, 900);
  });

  // click heart-burst anywhere
  document.addEventListener("click", function (e) {
    if (e.target.closest("button, a, input")) {
      // still allow burst on the buttons themselves, just lighter
    }
    burstHeartsAt({ left: e.clientX, top: e.clientY, width: 0, height: 0 });
  });
  function burstHeartsAt(rect) {
    var cx = rect.left + (rect.width || 0) / 2;
    var cy = rect.top + (rect.height || 0) / 2;
    for (var i = 0; i < 6; i++) {
      var h = document.createElement("div");
      h.className = "burst-heart";
      h.textContent = "❤";
      h.style.left = cx + "px";
      h.style.top = cy + "px";
      var angle = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 50;
      h.style.setProperty("--bx", Math.cos(angle) * dist + "px");
      h.style.setProperty("--by", Math.sin(angle) * dist - 30 + "px");
      document.body.appendChild(h);
      setTimeout(
        (function (el) {
          return function () {
            el.remove();
          };
        })(h),
        850,
      );
    }
  }

  // night sky stars (dark mode)
  function buildStars(on) {
    var existing = ambient.querySelectorAll(".star");
    existing.forEach(function (s) {
      s.remove();
    });
    if (!on) return;
    for (var i = 0; i < 60; i++) {
      var star = document.createElement("div");
      star.className = "star";
      star.style.left = Math.random() * 100 + "vw";
      star.style.top = Math.random() * 100 + "vh";
      star.style.animationDelay = Math.random() * 3 + "s";
      ambient.appendChild(star);
    }
  }

  /* ---------------------------------------------------------
     CONFETTI ON LOAD
  --------------------------------------------------------- */
  function fireConfetti() {
    var colors = ["#ff9bc0", "#ffd6e6", "#c9b6f2", "#ffe2cf", "#ff6f9c"];
    for (var i = 0; i < 40; i++) {
      (function () {
        var c = document.createElement("div");
        var size = 6 + Math.random() * 6;
        c.style.cssText =
          "position:fixed;top:-20px;z-index:9500;border-radius:2px;pointer-events:none;";
        c.style.left = Math.random() * 100 + "vw";
        c.style.width = size + "px";
        c.style.height = size + "px";
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.opacity = "0.9";
        document.body.appendChild(c);
        var duration = 2200 + Math.random() * 1600;
        var rotate = Math.random() * 720 - 360;
        c.animate(
          [
            { transform: "translateY(0) rotate(0deg)", opacity: 1 },
            {
              transform: "translateY(100vh) rotate(" + rotate + "deg)",
              opacity: 0.3,
            },
          ],
          { duration: duration, easing: "ease-in" },
        );
        setTimeout(function () {
          c.remove();
        }, duration);
      })();
    }
  }

  /* ---------------------------------------------------------
     LOVE NOTES — appear randomly while scrolling
  --------------------------------------------------------- */
  var lastNoteTime = 0;
  function maybeShowLoveNote() {
    var now = Date.now();
    if (now - lastNoteTime < 6000) return;
    if (Math.random() < 0.04) {
      lastNoteTime = now;
      var note = document.createElement("div");
      note.className = "love-note";
      note.textContent =
        LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)];
      note.style.left = 10 + Math.random() * 70 + "vw";
      note.style.top = 20 + Math.random() * 50 + "vh";
      document.body.appendChild(note);
      setTimeout(function () {
        note.remove();
      }, 4200);
    }
  }

  /* ---------------------------------------------------------
     INITIAL CALLS
  --------------------------------------------------------- */
  onScroll();
})();
