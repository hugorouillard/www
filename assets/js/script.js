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
let previousNavHref = null;

try {
  const storedNavHref = sessionStorage.getItem("nav-indicator-from");
  sessionStorage.removeItem("nav-indicator-from");
  if (!reducedMotion) previousNavHref = storedNavHref;
} catch {
  // Animate the full page when storage is unavailable.
}

const primaryNav = document.querySelector(".primary-nav");
const navIndicator = primaryNav?.querySelector(".primary-nav-indicator");
const currentNavLink = primaryNav?.querySelector('[aria-current="page"]');

function positionNavIndicator(link) {
  if (!navIndicator || !link) return;
  navIndicator.style.left = `${link.offsetLeft}px`;
  navIndicator.style.width = `${link.offsetWidth}px`;
}

if (primaryNav && navIndicator) {
  const previousNavLink = [...primaryNav.querySelectorAll("a")].find(
    (link) => link.href === previousNavHref,
  );

  if (currentNavLink) {
    positionNavIndicator(previousNavLink || currentNavLink);
    primaryNav.classList.add("is-enhanced");
    document.documentElement.classList.remove("has-pending-nav-transition");

    if (previousNavLink) {
      requestAnimationFrame(() => {
        primaryNav.classList.add("is-ready");
        requestAnimationFrame(() => positionNavIndicator(currentNavLink));
      });
    }
  }

  primaryNav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (
      reducedMotion ||
      !link ||
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

    try {
      sessionStorage.setItem(
        "nav-indicator-from",
        currentNavLink?.href || window.location.href,
      );
    } catch {
      // Fall back to the full-page animation when storage is unavailable.
    }
  });

  window.addEventListener("resize", () => {
    positionNavIndicator(currentNavLink);
  });
}

if (
  !reducedMotion &&
  !previousNavHref &&
  window.Motion?.animate &&
  window.Motion?.stagger
) {
  const { animate, stagger } = window.Motion;
  const headerOpening = [
    ".brand",
    ".site-nav",
    ".primary-nav",
  ].join(", ");
  const pageOpening = [
    ".intro > :first-child",
    ".page-header > *",
    ".article > .back-link",
    ".article-header > *",
  ].join(", ");
  const introRemainder = ".intro > :not(:first-child)";
  const introRemainderCount = document.querySelectorAll(introRemainder).length;
  const content = [
    ".curated-section .section-heading",
    ".entry .entry-heading",
    ".entry > p",
    ".entry .entry-action",
    ".entry .entry-action > span",
    ".article-content > *",
  ].join(", ");
  const footer = ".site-footer > *";
  const revealTargets = document.querySelectorAll(
    `${headerOpening}, ${pageOpening}, ${introRemainder}, ${content}, ${footer}`,
  );

  (async () => {
    const revealAnimations = [];

    try {
      const openingAnimations = [
        animate(
          headerOpening,
          {
            "--reveal-opacity": [0, 1],
            y: [20, 0],
            blur: [1, 0],
          },
          { delay: stagger(0.05) },
        ),
        animate(
          pageOpening,
          {
            "--reveal-opacity": [0, 1],
            y: [20, 0],
            blur: [1, 0],
          },
          { delay: stagger(0.05, { startDelay: 0.25 }) },
        ),
      ];
      revealAnimations.push(...openingAnimations);
      await Promise.all(openingAnimations);

      const continuationAnimations = [
        animate(
          introRemainder,
          {
            "--reveal-opacity": [0, 1],
            y: [20, 0],
            blur: [1, 0],
          },
          { delay: stagger(0.05, { startDelay: 0.1 }) },
        ),
        animate(
          content,
          {
            "--reveal-opacity": [0, 1],
            x: [-20, 0],
            blur: [1, 0],
          },
          {
            delay: stagger(0.05, {
              startDelay: 0.1 + introRemainderCount * 0.05,
            }),
          },
        ),
      ];
      revealAnimations.push(...continuationAnimations);
      await Promise.all(continuationAnimations);

      revealAnimations.push(
        animate(
          footer,
          {
            "--reveal-opacity": [0, 1],
            y: [20, 0],
            blur: [1, 0],
          },
          { delay: stagger(0.15), duration: 0.1 },
        ),
      );
      await revealAnimations.at(-1);
    } finally {
      document.documentElement.classList.remove("has-pending-page-animation");
      revealAnimations.forEach((animation) => animation.cancel());
      revealTargets.forEach((element) => {
        element.style.removeProperty("--reveal-opacity");
        element.style.removeProperty("filter");
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      });
    }
  })();
} else {
  document.documentElement.classList.remove("has-pending-page-animation");
}
