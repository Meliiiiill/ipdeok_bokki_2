(() => {
  const projectRoot = new URL("../", document.currentScript.src);
  const projectUrl = (path) => new URL(path, projectRoot).href;

  const menuItems = [
    ["소개", "sub/about/about.html"],
    ["떡볶이 메뉴", "sub/lists/lists.html"],
    ["커뮤니티", "sub/community/community.html"],
    ["로그인/회원가입", "sub/login/login.html"]
  ];

  const headerSlot = document.querySelector("[data-site-header]");

  if (headerSlot) {
    const menuLinks = menuItems.map(([label, path]) => {
      const url = new URL(path, projectRoot);
      const current = url.pathname === location.pathname
        ? ' aria-current="page"'
        : "";

      return `<li><a href="${url.href}"${current}>${label}</a></li>`;
    }).join("");

    headerSlot.innerHTML = `
      <header class="site-header">
        <a class="site-home" href="${projectUrl("index.html")}" aria-label="입덕볶이 홈">
          <img class="site-logo" src="${projectUrl("img/logo.png")}" alt="입덕볶이">
        </a>
        <button class="menu-button" type="button" aria-label="메뉴"
                aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false">
          <i data-lucide="menu" aria-hidden="true"></i>
        </button>
      </header>
      <dialog id="site-menu" class="menu-drawer" aria-label="사이트 메뉴">
        <div class="menu-drawer__panel">
          <form method="dialog" class="menu-drawer__controls">
            <button class="menu-close" type="submit" aria-label="메뉴 닫기" autofocus>
              <i data-lucide="x" aria-hidden="true"></i>
            </button>
          </form>
          <nav aria-label="페이지 이동">
            <ul class="menu-links">${menuLinks}</ul>
          </nav>
        </div>
      </dialog>
    `;

    const menuButton = headerSlot.querySelector(".menu-button");
    const siteMenu = headerSlot.querySelector("#site-menu");

    menuButton.addEventListener("click", () => {
      siteMenu.showModal();
      menuButton.setAttribute("aria-expanded", "true");
    });

    siteMenu.addEventListener("click", (event) => {
      if (event.target === siteMenu || event.target.closest("a")) {
        siteMenu.close();
      }
    });

    siteMenu.addEventListener("close", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.focus();
    });
  }

  const footerSlot = document.querySelector("[data-site-footer]");

  if (footerSlot) {
    const iconRoot = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/icons/";
    const socialItems = [
      ["Facebook", "facebook"],
      ["X", "twitter-x"],
      ["Instagram", "instagram"],
      ["YouTube", "youtube"]
    ];

    const socialLinks = socialItems.map(([label, icon]) => `
      <a href="#" aria-label="${label}">
        <img src="${iconRoot}${icon}.svg" width="20" height="20" alt="" loading="lazy">
      </a>
    `).join("");

    footerSlot.innerHTML = `
      <footer class="site-footer">
        <nav class="footer-social" aria-label="입덕볶이 SNS">
          ${socialLinks}
        </nav>
        <address class="footer-address">서울특별시 강남구 입덕로 3456</address>
        <p class="footer-copyright">&copy; 2026 입덕볶이. All rights reserved.</p>
      </footer>
    `;
  }

  window.lucide?.createIcons();
})();