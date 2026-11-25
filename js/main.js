const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopHover = window.matchMedia("(hover: hover) and (pointer: fine)");

/* 햄버거 메뉴와 전화 주문 */
const menuButton = document.querySelector(".menu-button");
const siteMenu = document.querySelector("#site-menu");
const phoneOrderButton = document.querySelector("#phone-order-button");
const phoneOrderDialog = document.querySelector("#phone-order-dialog");

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

phoneOrderButton.addEventListener("click", () => {
  phoneOrderDialog.showModal();
});

/* 히어로 슬라이드와 진행선 */
const heroTrack = document.querySelector(".hero-track");
const heroSlides = Array.from(heroTrack.querySelectorAll(".hero-slide"));
const heroProgress = document.querySelector(".hero-timeline__fill");
const heroPause = document.querySelector(".hero-pause");
const heroInterval = 8000;

let heroIndex = 0;
let heroPaused = reduceMotion.matches;
let heroProgressAnimation;

function updateHeroPause() {
  heroPause.dataset.paused = String(heroPaused);
  heroPause.setAttribute(
    "aria-label",
    heroPaused ? "슬라이드 재생" : "슬라이드 일시정지"
  );
}

function startHeroClock() {
  heroProgressAnimation?.cancel();

  if (heroPaused) return;

  heroProgressAnimation = heroProgress.animate(
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    { duration: heroInterval, easing: "linear", fill: "forwards" }
  );

  heroProgressAnimation.onfinish = () => {
    if (!heroPaused) moveHero(1);
  };
}

function moveHero(direction) {
  const count = heroSlides.length;
  heroIndex = (heroIndex + direction + count) % count;
  heroTrack.style.setProperty("--hero-offset", `${-heroIndex * 100}%`);
  startHeroClock();
}

document.querySelector(".hero-arrow--prev").addEventListener("click", () => moveHero(-1));
document.querySelector(".hero-arrow--next").addEventListener("click", () => moveHero(1));

heroPause.addEventListener("click", () => {
  heroPaused = !heroPaused;
  updateHeroPause();

  if (heroPaused) {
    heroProgressAnimation?.pause();
  } else if (heroProgressAnimation?.playState === "paused") {
    heroProgressAnimation.play();
  } else {
    startHeroClock();
  }
});

updateHeroPause();
startHeroClock();

/* 추천 메뉴 캐러셀 */
const featured = document.querySelector(".featured");
const featuredButtons = Array.from(featured.querySelectorAll(".pill"));
const featuredCards = featuredButtons.map((button) => {
  return document.getElementById(button.getAttribute("aria-controls"));
});

let featuredIndex = 0;
let featuredAnimations = [];
let featuredTimer;

function getCardOffset(index, center) {
  const count = featuredCards.length;
  const distance = (index - center + count) % count;
  return distance > Math.floor(count / 2) ? distance - count : distance;
}

function cardPosition(offset) {
  const y = offset === 0 ? "0px" : "-36px";
  return { transform: `translate(calc(${offset} * (100% + 18px)), ${y})` };
}

function selectFeatured(nextIndex) {
  if (nextIndex === featuredIndex) return;

  featuredAnimations.forEach((animation) => animation.cancel());
  featuredAnimations = [];

  const previousIndex = featuredIndex;
  const direction = getCardOffset(nextIndex, previousIndex);
  featuredIndex = nextIndex;

  featuredCards.forEach((card, index) => {
    const oldOffset = getCardOffset(index, previousIndex);
    const newOffset = getCardOffset(index, nextIndex);
    const isCurrent = newOffset === 0;

    featuredButtons[index].classList.toggle("is-current", isCurrent);
    featuredButtons[index].setAttribute("aria-pressed", String(isCurrent));
    card.classList.toggle("is-current", isCurrent);
    card.inert = !isCurrent;
    card.style.setProperty("--card-offset", newOffset);

    if (reduceMotion.matches) return;

    const frames = Math.abs(newOffset - oldOffset) > 1
      ? [
          cardPosition(oldOffset),
          { ...cardPosition(-2 * direction), offset: 0.5 },
          { ...cardPosition(2 * direction), offset: 0.5 },
          cardPosition(newOffset)
        ]
      : [cardPosition(oldOffset), cardPosition(newOffset)];

    featuredAnimations.push(card.animate(frames, {
      duration: 280,
      easing: "ease-out"
    }));
  });
}

function restartFeaturedClock() {
  window.clearTimeout(featuredTimer);

  const isHovered = desktopHover.matches && featured.matches(":hover");
  if (reduceMotion.matches || isHovered || featured.contains(document.activeElement)) return;

  featuredTimer = window.setTimeout(() => moveFeatured(1), 3000);
}

function moveFeatured(direction) {
  const count = featuredCards.length;
  selectFeatured((featuredIndex + direction + count) % count);
  restartFeaturedClock();
}

featuredButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    selectFeatured(index);
    restartFeaturedClock();
  });
});

featured.querySelector(".featured-arrow--prev").addEventListener("click", () => moveFeatured(-1));
featured.querySelector(".featured-arrow--next").addEventListener("click", () => moveFeatured(1));
featured.addEventListener("mouseenter", restartFeaturedClock);
featured.addEventListener("mouseleave", restartFeaturedClock);
featured.addEventListener("focusin", restartFeaturedClock);
featured.addEventListener("focusout", () => window.setTimeout(restartFeaturedClock, 0));

restartFeaturedClock();

/* 입덕 메뉴 분류 */
const menuCategories = document.querySelectorAll(".menu-categories button");

menuCategories.forEach((selected) => {
  selected.addEventListener("click", () => {
    menuCategories.forEach((button) => {
      const isCurrent = button === selected;
      button.classList.toggle("is-current", isCurrent);
      button.setAttribute("aria-pressed", String(isCurrent));
    });
  });
});

/* 이벤트 필터와 가로 이동 */
const eventFilters = document.querySelectorAll(".event-filters button");
const eventTrack = document.querySelector("#event-track");
const eventCards = eventTrack.querySelectorAll(".story-card");
const eventPrevious = document.querySelector(".event-arrow--prev");
const eventNext = document.querySelector(".event-arrow--next");

function updateEventArrows() {
  const remaining = eventTrack.scrollWidth - eventTrack.clientWidth - eventTrack.scrollLeft;

  eventPrevious.disabled = eventTrack.scrollLeft <= 1;
  eventNext.disabled = remaining <= 1;
}

function moveEventCards(direction) {
  const firstCard = eventCards[0].getBoundingClientRect();
  const secondCard = eventCards[1].getBoundingClientRect();
  const cardStep = secondCard.left - firstCard.left;

  eventTrack.scrollBy({
    left: cardStep * direction,
    behavior: reduceMotion.matches ? "instant" : "smooth"
  });
}

eventFilters.forEach((selected) => {
  selected.addEventListener("click", () => {
    eventFilters.forEach((button) => {
      const isCurrent = button === selected;
      const panel = document.getElementById(button.getAttribute("aria-controls"));

      button.setAttribute("aria-pressed", String(isCurrent));
      panel.hidden = !isCurrent;
    });

    updateEventArrows();
  });
});

eventPrevious.addEventListener("click", () => moveEventCards(-1));
eventNext.addEventListener("click", () => moveEventCards(1));
eventTrack.addEventListener("scroll", updateEventArrows, { passive: true });

const eventTrackObserver = new ResizeObserver(updateEventArrows);
eventTrackObserver.observe(eventTrack);
updateEventArrows();


window.lucide?.createIcons();