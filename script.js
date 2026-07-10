const { animate, stagger } = Motion;

var insideBlog = false;
var currentPage = null;

const themeToggle = document.getElementById("theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} mode`,
  );
  themeToggle.title = `Switch to ${isDark ? "light" : "dark"} mode`;
  themeColor.content = isDark ? "#1e1e2e" : "#fff0df";
}

applyTheme(document.documentElement.dataset.theme || "dark");

themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  try {
    localStorage.setItem("theme", nextTheme);
  } catch {
    // The active theme still works when storage is unavailable.
  }
});

// Page navigation
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');

function setActivePage(pageId) {
  currentPage = pageId;
  
  // Update nav links
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    // Extract page name from href (e.g., "/about.html" -> "about")
    const linkPage = href.replace(/^\/|\.html$/g, '');
    if (linkPage === pageId) {
      link.classList.add('active');
    }
  });
  
  // Update page sections
  pageSections.forEach(section => {
    section.classList.remove('active');
    if (section.id === pageId) {
      section.classList.add('active');
    }
  });
}

// Determine current page from URL
function getCurrentPageFromURL() {
  const path = window.location.pathname;
  const pageMatch = path.match(/\/([^\/]+)\.html$/);
  if (pageMatch) {
    return pageMatch[1]; // e.g., "about", "projects", "writing"
  }
  return 'about'; // default
}

// Initialize current page
currentPage = getCurrentPageFromURL();
setActivePage(currentPage);

// Handle nav link clicks - for single-page navigation
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    const pageName = href.replace(/^\/|\.html$/g, '');
    
    // If we're on the same page, just update the active state
    if (window.location.pathname.endsWith(`${pageName}.html`) || 
        (pageName === 'about' && window.location.pathname === '/')) {
      e.preventDefault();
      setActivePage(pageName);
    }
    // Otherwise, let the browser navigate
  });
});

async function animateAndOpenBlog(blogid, blogElem, fromLoad = false) {
  const blogParent = document.getElementById(`blog-${blogid}`);
  if (!blogElem || !blogParent) {
    return;
  }

  insideBlog = true;
  if (!fromLoad) {
    await animate("#footer", {
      opacity: [1, 0],
      y: [0, 20],
      blur: [0, 1],
    });
    await animate(
      "#about > *, #projects > *, #writing > *",
      {
        opacity: [1, 0],
        x: [0, -60],
        blur: [0, 1],
      },
      {
        delay: stagger(0.05),
      },
    );
  }
  document.getElementById("about").classList.add("hidden");
  document.getElementById("projects").classList.add("hidden");
  document.getElementById("writing").classList.add("hidden");
  document.getElementById("blog-space").classList.remove("hidden");
  const img =
    document.querySelector(`#blog-${blogid} > img`) ||
    document.querySelector(`#blog-${blogid} > video`);
  const title = blogElem.querySelector("h3").textContent;
  const content = [];
  for (const child of blogParent.children) {
    if (child.tagName === "IMG" || child.tagName === "VIDEO") {
      continue;
    }
    content.push(child.innerHTML);
  }
  const contentWrapper = document.getElementById("blog-content");
  contentWrapper.innerHTML = "";
  if (img) {
    contentWrapper.appendChild(img.cloneNode());
  }
  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  contentWrapper.appendChild(titleElement);
  for (const paragraph of content) {
    const paragraphElement = document.createElement("p");
    paragraphElement.innerHTML = paragraph;
    contentWrapper.appendChild(paragraphElement);
    const separator = document.createElement("div");
    separator.innerHTML = `
    <div class="line-holder">
      <div class="smallLine smallLine1"></div>
      <div class="smallLine smallLine2"></div>
    </div>`;
    if (paragraph !== content[content.length - 1]) {
      contentWrapper.appendChild(separator);
    }
  }
  await animate(
    "#back, #blog-content > *",
    {
      opacity: [0, 1],
      x: [-60, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.05),
    },
  );
  document.getElementById("footer").removeAttribute("style");
}

for (const blog of document.querySelectorAll("[blog]")) {
  blog.onclick = (event) => {
    event.preventDefault();
    const blogElem = event.target.closest("[blog]");
    const blogid = blogElem.getAttribute("blog");
    animateAndOpenBlog(blogid, blogElem);
    history.pushState({ blogid }, "", `?blog=${blogid}`);
  };
}

const urlParams = new URLSearchParams(window.location.search);
var beforeLoadBlog = urlParams.get("blog");

async function main() {
  // Animate in the current page's content
  const activeSection = document.querySelector('.page-section.active');
  if (activeSection) {
    await animate(
      "#logo > *, #links > *",
      {
        opacity: [0, 1],
        y: [20, 0],
        blur: [1, 0],
      },
      {
        delay: stagger(0.05),
      },
    );
    
    await animate(
      `#${activeSection.id} > *`,
      {
        opacity: [0, 1],
        y: [20, 0],
        blur: [1, 0],
      },
      {
        delay: stagger(0.05),
      },
    );
  }

  // Animate other sections if they exist on the page
  const otherSections = document.querySelectorAll('.page-section:not(.active)');
  for (const section of otherSections) {
    await animate(
      `#${section.id} > *`,
      {
        opacity: [0, 1],
        blur: [1, 0],
        x: [-20, 0],
      },
      {
        delay: stagger(0.05),
      },
    );
  }

  await animate(
    "footer > *",
    {
      opacity: [0, 1],
      y: [20, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.15),
      duration: 0.1,
    },
  );
}

async function closeBlog(updateUrl = true) {
  insideBlog = false;
  beforeLoadBlog = null;
  if (updateUrl) {
    history.replaceState({}, "", window.location.pathname + window.location.hash);
  }
  const elements = Array.from(
    document.querySelectorAll("#back, #blog-content > *"),
  ).reverse();
  await animate(
    elements,
    {
      opacity: [1, 0],
      x: [0, -50],
      blur: [0, 1],
    },
    {
      delay: stagger(0.05),
    },
  );
  document.getElementById("blog-space").classList.add("hidden");
  document.getElementById("projects").setAttribute("gone-back", "");
  document.getElementById("about").classList.remove("hidden");
  document.getElementById("projects").classList.remove("hidden");
  document.getElementById("writing").classList.remove("hidden");
  
  // Restore page state
  setActivePage(currentPage);
  
  await animate(
    "#about > *, #projects > *, #writing > *",
    {
      opacity: [0, 1],
      x: [-50, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.05),
    },
  );
}

document.getElementById("back").onclick = async (event) => {
  event.preventDefault();
  if (history.state && history.state.blogid) {
    history.back();
    return;
  }
  await closeBlog();
};

if (beforeLoadBlog) {
  const blogElem = document.querySelector(`[blog="${beforeLoadBlog}"]`);
  animateAndOpenBlog(beforeLoadBlog, blogElem, true);
} else {
  main();
}

window.addEventListener("popstate", (event) => {
  if (event.state && event.state.blogid) {
    const blogElem = document.querySelector(`[blog="${event.state.blogid}"]`);
    animateAndOpenBlog(event.state.blogid, blogElem, true);
  } else {
    if (insideBlog) {
      closeBlog(false);
    }
  }
});
