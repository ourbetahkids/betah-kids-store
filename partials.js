// ============================================================
// BETAH KIDS — SHARED HEADER & FOOTER LOADER (partials.js)
// 1. Fetches header-partial.inc and footer-partial.inc
// 2. Swaps them in place of the placeholder <div>s
// 3. Highlights the active TOP-LEVEL nav link (never dropdown items)
// 4. Fires a "partialsLoaded" event so nav.js / cart.js can bind
//    their click handlers once the header actually exists
// ============================================================

const PARTIALS = [
  { placeholderId: "header-placeholder", file: "header-partial.inc" },
  { placeholderId: "footer-placeholder", file: "footer-partial.inc" }
];

async function injectPartial(partial) {
  const placeholder = document.getElementById(partial.placeholderId);
  if (!placeholder) return;

  try {
    const response = await fetch(partial.file);
    if (!response.ok) {
      throw new Error("HTTP " + response.status + " while loading " + partial.file);
    }
    const html = await response.text();
    placeholder.outerHTML = html;
  } catch (err) {
    console.error("[partials.js] Could not load " + partial.file + ":", err);
  }
}

function highlightActiveNavLink() {
  let currentPage = window.location.pathname.split("/").pop();
  if (!currentPage) currentPage = "index.html";
  if (!currentPage.includes(".")) currentPage += ".html";

  // Direct children only: top-level nav links, not dropdown items
  const topLevelLinks = document.querySelectorAll(
    ".nav-links > li > a, .mobile-menu-list > li > a"
  );

  topLevelLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkPage = href.split("?")[0].split("#")[0];
    link.classList.toggle("active-link", linkPage === currentPage);
  });
}

async function loadPartials() {
  await Promise.all(PARTIALS.map(injectPartial));
  highlightActiveNavLink();
  document.dispatchEvent(new CustomEvent("partialsLoaded"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPartials);
} else {
  loadPartials();
}
