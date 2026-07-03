// ---------- Mobile nav ----------
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

const closeNav = () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});

// Close the panel when a nav link is clicked
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

// Close on Escape (returning focus to the toggle) or a click outside the nav
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks.classList.contains("open")) {
    closeNav();
    navToggle.focus();
  }
});

document.addEventListener("click", (e) => {
  if (navLinks.classList.contains("open") && !e.target.closest(".nav")) {
    closeNav();
  }
});

// ---------- Video playback ----------
// The projects section sits below a full-height hero, so autoplaying every
// card video on load would start 9 videos at once. Instead, play/pause each
// one as it scrolls into/out of view (muted + playsinline satisfy browser
// autoplay policies). Skipped entirely when the visitor prefers reduced motion.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cardVideos = document.querySelectorAll(".card-media video");

if (!reducedMotion) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!video.userPaused) video.play().catch(() => {});
        } else if (!video.paused) {
          video.autoPaused = true;
          video.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  cardVideos.forEach((video) => {
    // Distinguish scroll-out pauses from the visitor hitting pause on the
    // controls — only a deliberate pause should survive re-entering the
    // viewport, and pressing play clears it again.
    video.addEventListener("pause", () => {
      video.userPaused = !video.autoPaused;
      video.autoPaused = false;
    });
    video.addEventListener("play", () => {
      video.userPaused = false;
    });
    videoObserver.observe(video);
  });
}

// ---------- Particle background ----------
// Flow-field particle trails on a fixed full-viewport canvas. Each frame the
// previous image is faded slightly (destination-out) instead of cleared, so
// the short stroke each particle draws accumulates into a streak. Particles
// drift along a sin/cos vector field; the pointer adds a swirl within a
// radius. Tuning constants ported from mos.caldis.me.
const particleCanvas = document.querySelector(".particles");
const saveData = navigator.connection?.saveData ?? false;

if (particleCanvas && !reducedMotion && !saveData) {
  const ctx = particleCanvas.getContext("2d", { alpha: true });
  if (ctx) initParticles(ctx);
}

function initParticles(ctx) {
  const cfg = {
    densityDesktop: 2, // particles per 5000px² of viewport
    densityCoarse: 1, // touch devices get half the density
    countMin: 800,
    countMax: 1000,
    damping: 0.8, // velocity retained per frame
    dampingScroll: 0, // extra damping as the page scrolls down
    accel: 1.15, // pull toward the field direction
    speedBase: 0.2,
    fieldScaleX: 0.003, // spatial frequency of the flow field
    fieldScaleY: 0.002,
    fieldScaleXY: 0.001,
    angleMul: 0.1, // limits field angles to a gentle horizontal drift
    timeY: 0.0002, // how fast the field itself evolves
    timeXY: 0.00035,
    influenceR: 490, // pointer swirl radius (px)
    swirl: 3,
    fade: .5, // trail fade per frame; higher = shorter trails
    fadeScroll: 0.3, // trails shorten while scrolled down the page
    lineWidth: 1,
    opacities: [.75, .4, .5],
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  // Deterministic pseudo-random in [0,1) so respawned particles reappear at
  // a stable position for their seed instead of visibly popping around
  const hash = (t) => {
    const x = Math.sin(t) * 10000;
    return x - Math.floor(x);
  };

  // --accent (#22d3ee) at three opacity tiers
  const colors = cfg.opacities.map((o) => `rgba(255, 255, 255, ${o})`);
  const mouse = { x: -10000, y: -10000, active: false };
  let width = 1;
  let height = 1;
  let particles = [];
  let rafId = null;
  let running = true;
  let lastTime = performance.now();

  const spawn = (i) => {
    const t = 12.345 * i;
    return {
      x: hash(t) * width,
      y: hash(t + 1) * height,
      vx: 0,
      vy: 0,
      seed: 1000 * hash(t + 2),
      color: i % 3,
    };
  };

  const targetCount = () => {
    const density = window.matchMedia("(pointer: coarse)").matches
      ? cfg.densityCoarse
      : cfg.densityDesktop;
    return clamp(Math.floor(((width * height) / 5000) * density), cfg.countMin, cfg.countMax);
  };

  const resize = () => {
    const rect = particleCanvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    particleCanvas.width = Math.floor(width * dpr);
    particleCanvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: targetCount() }, (_, i) => spawn(i));
    ctx.clearRect(0, 0, width, height);
  };

  // Direction of the flow field at a point; each particle's seed offsets the
  // time terms so the swarm doesn't move in lockstep
  const fieldAngle = (x, y, time, seed) =>
    ((Math.sin(x * cfg.fieldScaleX) +
      Math.cos(y * cfg.fieldScaleY - (time - seed) * cfg.timeY) +
      Math.sin((x + y) * cfg.fieldScaleXY + (time + seed) * cfg.timeXY)) /
      3) *
    Math.PI *
    cfg.angleMul;

  const frame = (now) => {
    if (!running) return;
    // Clamp the timestep so a dropped frame doesn't teleport particles
    const dt = clamp(now - lastTime, 6, 28);
    lastTime = now;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scroll = clamp(window.scrollY / maxScroll, 0, 1);

    const fade = clamp(cfg.fade + scroll * cfg.fadeScroll, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = cfg.lineWidth;

    const damping = clamp(cfg.damping + scroll * cfg.dampingScroll, 0, 0.99);

    for (const p of particles) {
      const { x, y } = p;
      const angle = fieldAngle(x, y, now, p.seed);
      p.vx = p.vx * damping + Math.cos(angle) * cfg.accel;
      p.vy = p.vy * damping + Math.sin(angle) * cfg.accel;

      if (mouse.active) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < cfg.influenceR) {
          // Push perpendicular to the offset from the cursor → vortex
          const force = (1 - dist / cfg.influenceR) * cfg.swirl;
          p.vx += (-dy / dist) * force;
          p.vy += (dx / dist) * force;
        }
      }

      const nx = x + p.vx * cfg.speedBase * (dt / 16);
      const ny = y + p.vy * cfg.speedBase * (dt / 16);
      p.x = nx;
      p.y = ny;

      ctx.strokeStyle = colors[p.color];
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      if (nx < -40 || nx > width + 40 || ny < -40 || ny > height + 40) {
        const t = p.seed + 0.001 * now;
        p.x = hash(t) * width;
        p.y = hash(t + 1) * height;
        p.vx = 0;
        p.vy = 0;
      }
    }
    ctx.restore();

    rafId = window.requestAnimationFrame(frame);
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      // Canvas is fixed at the viewport origin, so client coords map directly
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    },
    { passive: true }
  );
  window.addEventListener("blur", () => {
    mouse.active = false;
    mouse.x = -10000;
    mouse.y = -10000;
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!running) {
      running = true;
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(frame);
    }
  });

  resize();
  rafId = window.requestAnimationFrame(frame);
}
