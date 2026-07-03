// ---------- Mobile nav ----------
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});

// Close the panel when a nav link is clicked
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

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
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  cardVideos.forEach((video) => videoObserver.observe(video));
}
