const themeToggle = document.getElementById("theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    const target = isDark ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Switch to ${target} mode`);
    themeToggle.title = `Switch to ${target} mode`;
  }

  if (themeColor) {
    themeColor.content = isDark ? "#1e1e2e" : "#fff0df";
  }
}

applyTheme(document.documentElement.dataset.theme || "dark");

themeToggle?.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);

  try {
    localStorage.setItem("theme", nextTheme);
  } catch {
    // The selected theme still works when storage is unavailable.
  }
});

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const primaryNav = document.querySelector(".primary-nav");
const navIndicator = primaryNav?.querySelector(".primary-nav-indicator");
const currentNavLink = primaryNav?.querySelector('[aria-current="page"]');

function positionNavIndicator(link) {
  if (!navIndicator || !link) return;
  navIndicator.style.left = `${link.offsetLeft}px`;
  navIndicator.style.width = `${link.offsetWidth}px`;
}

if (primaryNav && navIndicator && currentNavLink) {
  positionNavIndicator(currentNavLink);
  primaryNav.classList.add("is-enhanced");

  requestAnimationFrame(() => {
    primaryNav.classList.add("is-ready");
  });

  primaryNav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (
      reducedMotion ||
      !link ||
      primaryNav.classList.contains("is-navigating") ||
      link === currentNavLink ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    primaryNav.classList.add("is-navigating");
    link.classList.add("is-pending");
    positionNavIndicator(link);

    window.setTimeout(() => {
      try {
        sessionStorage.setItem("animate-content-only", "true");
      } catch {
        // Fall back to the full-page animation when storage is unavailable.
      }
      window.location.assign(link.href);
    }, 380);
  });

  window.addEventListener("resize", () => {
    primaryNav.classList.remove("is-ready");
    positionNavIndicator(
      primaryNav.querySelector(".is-pending") || currentNavLink,
    );
    requestAnimationFrame(() => primaryNav.classList.add("is-ready"));
  });
}

if (!reducedMotion) {
  let contentOnly = false;
  try {
    contentOnly = sessionStorage.getItem("animate-content-only") === "true";
    sessionStorage.removeItem("animate-content-only");
  } catch {
    // Animate the full page when storage is unavailable.
  }

  const { animate, stagger } = Motion;
  const intro = ".intro > *";
  const featured = [
    ".curated-section .section-heading",
    ".curated-section .entry-heading",
    ".curated-section .entry > p",
    ".curated-section .entry-action",
    ".curated-section .entry-action > span",
  ].join(", ");
  const page = [
    ".page-header",
    ".entry-list--index > .entry",
    ".empty-state",
    ".article",
  ].join(", ");

  (async () => {
    if (!contentOnly) {
      animate(".primary-nav", {
        opacity: [0, 1],
        y: [20, 0],
        blur: [1, 0],
      });
    }

    await animate(
      contentOnly ? `${intro}, ${page}` : `.brand, .site-nav > *, ${intro}, ${page}`,
      {
        opacity: [0, 1],
        y: [20, 0],
        blur: [1, 0],
      },
      { delay: stagger(0.05) },
    );

    await animate(
      featured,
      {
        opacity: [0, 1],
        x: [-20, 0],
        blur: [1, 0],
      },
      { delay: stagger(0.05) },
    );

    if (!contentOnly) {
      await animate(
        ".site-footer > *",
        {
          opacity: [0, 1],
          y: [20, 0],
          blur: [1, 0],
        },
        { delay: 0.3, duration: 0.1 },
      );
    }
  })();
}
