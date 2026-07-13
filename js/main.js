(() => {
  "use strict";

  /* ---- Sticky nav ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Hero text timed to video loop (0s ~ 11.5s / 12.5s ~ 14.5s) ---- */
  const heroVideo = document.querySelector(".hero-video");
  const heroContent = document.querySelector(".hero-content");
  const heroBrand = document.getElementById("heroBrand");
  if (heroContent || heroBrand) {
    const SHOW_START = 0;
    const SHOW_END = 11.5;
    const BRAND_START = 12.5;
    const BRAND_END = 14.5;
    const showHero = (on) => heroContent && heroContent.classList.toggle("show", on);
    const showBrand = (on) => heroBrand && heroBrand.classList.toggle("show", on);
    if (heroVideo) {
      // 영상이 loop 되며 매 사이클마다 0~11.5초에는 기존 문구, 12.5~14.5초에는 협회명을 노출
      heroVideo.addEventListener("timeupdate", () => {
        const t = heroVideo.currentTime;
        showHero(t >= SHOW_START && t < SHOW_END);
        showBrand(t >= BRAND_START && t < BRAND_END);
      });
      // 영상 로드/재생 불가 시 텍스트를 항상 표시(그라디언트 폴백 상황)
      heroVideo.addEventListener("error", () => { showHero(true); showBrand(true); });
      const heroSource = heroVideo.querySelector("source");
      if (heroSource) heroSource.addEventListener("error", () => { showHero(true); showBrand(true); });
    } else {
      showHero(true);
      showBrand(true);
    }
  }

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---- Stat counters ---- */
  const statNums = document.querySelectorAll(".stat-num");
  const animateCount = (el) => {
    const raw = el.dataset.target || "";
    const suffix = el.dataset.suffix || "";
    const target = parseFloat(raw) || 0;
    // data-target에 소수점이 있으면 그 자릿수를 유지 (예: "2.2" → 1자리)
    const decimals = (raw.split(".")[1] || "").length;
    const format = (n) =>
      n.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  statNums.forEach((el) => statObserver.observe(el));

  /* ---- Support scroll steps ---- */
  const supportScroll = document.getElementById("supportScroll");
  if (supportScroll) {
    const steps = supportScroll.querySelectorAll(".support-step");
    const dots = supportScroll.querySelectorAll(".support-dot");
    const total = steps.length;
    let activeIndex = -1;
    let ticking = false;

    const updateSupportStep = () => {
      ticking = false;
      const rect = supportScroll.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
      const index = Math.min(total - 1, Math.floor(progress * total));
      if (index === activeIndex) return;
      activeIndex = index;
      steps.forEach((el, i) => el.classList.toggle("active", i === index));
      dots.forEach((el, i) => el.classList.toggle("active", i === index));
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateSupportStep);
      }
    }, { passive: true });
    updateSupportStep();
  }

  /* ---- Gallery lightbox ---- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxVideo = document.getElementById("lightboxVideo");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxVideo.style.display = "none";
      lightboxVideo.innerHTML = "";
      lightboxImg.style.display = "block";
      lightboxImg.style.backgroundImage = item.style.backgroundImage;
      lightboxCaption.textContent = item.dataset.caption || "";
      lightbox.classList.add("open");
    });
  });

  /* ---- Video lightbox ---- */
  document.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      const videoId = card.dataset.videoId;
      lightboxImg.style.display = "none";
      lightboxVideo.style.display = "block";
      lightboxVideo.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + videoId +
        '?autoplay=1" title="' + (card.dataset.caption || "") +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      lightboxCaption.textContent = card.dataset.caption || "";
      lightbox.classList.add("open");
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightboxVideo.innerHTML = "";
  };
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
})();
