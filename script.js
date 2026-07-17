const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav-links");

function updateHeader() {
  header?.setAttribute("data-elevated", String(window.scrollY > 12));
}

function closeNav() {
  nav?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
}

toggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = nav?.classList.toggle("is-open") ?? false;
  toggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

document.addEventListener("click", (event) => {
  if (nav?.classList.contains("is-open") && !nav.contains(event.target)) {
    closeNav();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* Highlight the nav link for the section currently in view */
const navLinks = [...(nav?.querySelectorAll('a[href^="#"]') ?? [])];
const sections = navLinks
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);

function setCurrentSection(id) {
  navLinks.forEach((link) => {
    if (link.hash === `#${id}`) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentSection(entry.target.id);
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );
  sections.forEach((section) => spy.observe(section));

  // The last section may be too short to reach the observer band.
  window.addEventListener(
    "scroll",
    () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        setCurrentSection(sections[sections.length - 1].id);
      }
    },
    { passive: true }
  );
}

/* Gentle fade-up as sections scroll into view (skipped for reduced motion) */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Twinkling starfield: each star gets its own size, brightness, and rhythm,
   and drifts to a fresh spot between twinkles so the pattern never repeats.
   Under reduced motion the stars still render, just without the twinkle. */
function placeStar(star) {
  const size = 1 + Math.random() * 1.6;
  star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
  star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
  star.style.width = `${size.toFixed(2)}px`;
  star.style.height = `${size.toFixed(2)}px`;
  star.style.setProperty("--star-max", (0.3 + Math.random() * 0.55).toFixed(2));
  star.classList.toggle("gold", Math.random() < 0.18);
}

const starfield = document.createElement("div");
starfield.className = "starfield";
starfield.setAttribute("aria-hidden", "true");

for (let i = 0; i < 95; i += 1) {
  const star = document.createElement("span");
  placeStar(star);
  const isDrifter = i % 2 === 0;
  if (isDrifter) {
    // Drifters fade fully out, then are reborn somewhere new while invisible.
    star.classList.add("drift");
    star.style.setProperty("--twinkle-duration", `${(5 + Math.random() * 4.5).toFixed(2)}s`);
    star.addEventListener("animationiteration", () => placeStar(star));
  } else {
    star.style.setProperty("--twinkle-duration", `${(4 + Math.random() * 4).toFixed(2)}s`);
  }
  star.style.setProperty("--twinkle-delay", `${(-Math.random() * 9).toFixed(2)}s`);
  starfield.appendChild(star);
}

document.body.prepend(starfield);

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    [
      ".split-section > div",
      ".education-card",
      ".project-feature",
      ".project-grid > *",
      ".experience-grid > *",
      ".voluntary-feature",
      ".skills-grid > *",
      ".timeline > *",
      ".contact-section > div",
    ].join(", ")
  );

  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("is-visible");
          revealer.unobserve(el);
          // Clean up once done so hover transitions behave normally again.
          const delay = parseInt(el.style.getPropertyValue("--reveal-delay"), 10) || 0;
          setTimeout(() => {
            el.classList.remove("reveal", "is-visible");
            el.style.removeProperty("--reveal-delay");
          }, 900 + delay);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  revealTargets.forEach((target) => {
    // Skip anything already on screen so the initial view never flashes.
    if (target.getBoundingClientRect().top < window.innerHeight) {
      return;
    }
    // Stagger siblings inside the same grid for a smoother cascade.
    const siblingIndex = [...target.parentElement.children].indexOf(target);
    target.style.setProperty("--reveal-delay", `${Math.min(siblingIndex, 5) * 110}ms`);
    target.classList.add("reveal");
    revealer.observe(target);
  });
}
