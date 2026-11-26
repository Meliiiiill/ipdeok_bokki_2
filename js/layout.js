(() => {
  const projectRoot = new URL("../", document.currentScript.src);
  const projectUrl = (path) => new URL(path, projectRoot).href;

  const loginPath = "sub/login/login.html";
  const mypagePath = "sub/mypage/mypage.html";

  const menuItems = [
    ["소개", "sub/about/about.html"],
    ["떡볶이 메뉴", "sub/lists/lists.html"],
    ["커뮤니티", "sub/community/community.html"],
    ["로그인/회원가입", loginPath]
  ];

  const headerSlot = document.querySelector("[data-site-header]");

  if (headerSlot) {
    const menuLinks = menuItems.map(([label, path]) => {
      const url = new URL(path, projectRoot);
      const current = url.pathname === location.pathname
        ? ' aria-current="page"'
        : "";
      const account = path === loginPath ? " data-account-link" : "";

      return `<li><a href="${url.href}"${current}${account}>${label}</a></li>`;
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
    const accountLink = headerSlot.querySelector("[data-account-link]");

    function updateAccountLink() {
      let user = null;

      try {
        user = window.IpdeokAuth?.currentUser() ?? null;
      } catch {
        // 저장소를 읽을 수 없으면 기본 로그인 링크를 표시합니다.
      }

      const url = new URL(user ? mypagePath : loginPath, projectRoot);

      accountLink.textContent = user ? "마이페이지" : "로그인/회원가입";
      accountLink.href = url.href;

      if (url.pathname === location.pathname) {
        accountLink.setAttribute("aria-current", "page");
      } else {
        accountLink.removeAttribute("aria-current");
      }
    }

    menuButton.addEventListener("click", () => {
      updateAccountLink();
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

    window.addEventListener("ipdeok:authchange", updateAccountLink);
    window.addEventListener("storage", updateAccountLink);
    window.addEventListener("pageshow", updateAccountLink);

    if (window.IpdeokAuth) {
      updateAccountLink();
    } else {
      const authScript = document.createElement("script");
      authScript.src = projectUrl("js/auth.js");
      authScript.addEventListener("load", updateAccountLink, { once: true });
      document.head.append(authScript);
    }
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

(() => {
  const menus = {
    original: { name: "첫입 오리지널 떡볶이", level: 2 },
    rose: { name: "최애 로제 떡볶이", level: 1 },
    spicy: { name: "불꽃 입덕 떡볶이", level: 3 },
    cheese: { name: "치즈 폭탄 떡볶이", level: 1 }
  };

  const descriptions = {
    1: "진순 정도",
    2: "신라면 정도",
    3: "불닭 정도"
  };

  function getMenu(key) {
    return Object.hasOwn(menus, key) ? menus[key] : null;
  }

  function render(element, key) {
    const level = getMenu(key)?.level ?? Number(key);

    if (!Object.hasOwn(descriptions, level)) {
      element.hidden = true;
      return;
    }

    const description = descriptions[level];

    if (element.hasAttribute("data-spice-description")) {
      element.textContent = `맵기 · ${description}`;
    } else {
      element.dataset.peppers = "🌶️".repeat(level);

      if (element.getAttribute("aria-hidden") !== "true") {
        element.setAttribute("role", "img");
        element.setAttribute("aria-label", `고추 ${level}개, ${description}`);
      }
    }

    element.hidden = false;
  }

  document.querySelectorAll("[data-spice]").forEach((element) => {
    render(element, element.dataset.spice);
  });

  window.IpdeokSpice = { getMenu, render };
})();