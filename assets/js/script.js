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

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("[data-animate]").forEach((element, index) => {
    element.animate(
      [
        { opacity: 0, transform: "translateY(12px)", filter: "blur(2px)" },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
      ],
      {
        duration: 350,
        delay: Math.min(index * 55, 275),
        easing: "ease-out",
        fill: "both",
      },
    );
  });
}
