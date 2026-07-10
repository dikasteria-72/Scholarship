(() => {
  "use strict";

  /* ---- Sticky nav ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
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
    const visuals = supportScroll.querySelectorAll(".support-visual-img");
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
      visuals.forEach((el, i) => el.classList.toggle("active", i === index));
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
