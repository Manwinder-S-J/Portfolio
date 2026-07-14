const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Add definition to the fixed navigation only after the page begins moving.
    const siteNav = document.querySelector(".site-nav");
    const updateNav = () => siteNav.classList.toggle("scrolled", window.scrollY > 18);
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();

    // Reveal content once while it enters the viewport.
    if (!reducedMotion && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -45px" });
      document.querySelectorAll(".reveal, .role-card").forEach((element) => revealObserver.observe(element));
    } else {
      document.querySelectorAll(".reveal, .role-card").forEach((element) => element.classList.add("in-view"));
    }

    // Reveal skill badges row by row with a short left-to-right stagger.
    const skillRows = document.querySelectorAll(".skill-row");
    skillRows.forEach((row) => {
      row.querySelectorAll(".skill-items span").forEach((skill, index) => {
        skill.style.setProperty("--skill-index", index);
      });
    });

    if (!reducedMotion && "IntersectionObserver" in window) {
      document.documentElement.classList.add("skills-motion-ready");
      const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("skills-in-view");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.35, rootMargin: "0px 0px -20px" });
      skillRows.forEach((row) => skillObserver.observe(row));
    } else {
      skillRows.forEach((row) => row.classList.add("skills-in-view"));
    }

    // Fill the experience route as the reader moves through the timeline.
    const timeline = document.querySelector(".timeline");
    const timelineFill = document.getElementById("timeline-fill");
    let scrollFrame;
    function updateTimeline() {
      if (!timeline || !timelineFill) return;
      const rect = timeline.getBoundingClientRect();
      const trigger = window.innerHeight * 0.72;
      const progress = Math.max(0, Math.min(1, (trigger - rect.top) / rect.height));
      timelineFill.style.height = `${progress * 100}%`;
    }
    function requestTimelineUpdate() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        updateTimeline();
        scrollFrame = null;
      });
    }
    window.addEventListener("scroll", requestTimelineUpdate, { passive: true });
    window.addEventListener("resize", requestTimelineUpdate);
    updateTimeline();

    // A visible field of drifting, twinkling particles with short motion trails.
    if (!reducedMotion) {
      const canvas = document.getElementById("ambient-canvas");
      const context = canvas.getContext("2d");
      let width = 0;
      let height = 0;
      let dots = [];
      let lastTime = performance.now();

      function createDot() {
        const tintRoll = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.35 + 0.6,
          speed: Math.random() * 0.08 + 0.035,
          phase: Math.random() * Math.PI * 2,
          pulse: Math.random() * 0.0018 + 0.0008,
          tint: tintRoll > 0.8 ? "244,173,63" : tintRoll > 0.42 ? "99,217,202" : "142,163,184"
        };
      }

      function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.max(36, Math.min(110, Math.floor((width * height) / 15000)));
        dots = Array.from({ length: count }, createDot);
      }

      function drawDots(now) {
        const elapsed = Math.min(now - lastTime, 34);
        lastTime = now;
        context.clearRect(0, 0, width, height);
        dots.forEach((dot) => {
          dot.y -= dot.speed * elapsed;
          dot.x += Math.sin(now * 0.00012 + dot.phase) * 0.012 * elapsed;
          if (dot.y < -5) { dot.y = height + 5; dot.x = Math.random() * width; }
          const alpha = 0.12 + ((Math.sin(now * dot.pulse + dot.phase) + 1) / 2) * 0.38;
          context.beginPath();
          context.moveTo(dot.x, dot.y + dot.speed * 95);
          context.lineTo(dot.x, dot.y + dot.radius);
          context.strokeStyle = `rgba(${dot.tint},${alpha * 0.22})`;
          context.lineWidth = Math.max(0.45, dot.radius * 0.45);
          context.stroke();
          context.beginPath();
          context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(${dot.tint},${alpha})`;
          context.fill();
        });
        requestAnimationFrame(drawDots);
      }

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      requestAnimationFrame(drawDots);
    }
