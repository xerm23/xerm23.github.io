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
// Videos autoplay via the HTML autoplay attribute (muted + playsinline
// satisfy browser autoplay policies). Skip it when the visitor prefers
// reduced motion.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
  document.querySelectorAll(".card-media video").forEach((video) => {
    video.removeAttribute("autoplay");
    video.pause();
  });
}
