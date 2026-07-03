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
