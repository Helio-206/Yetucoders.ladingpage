const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const lerp = (start, end, factor) => start + (end - start) * factor;

function setupSplash() {
  const splash = document.querySelector(".splash");
  if (!splash) {
    document.body.classList.add("is-ready");
    return;
  }

  document.body.classList.add("is-locked");
  requestAnimationFrame(() => splash.classList.add("is-active"));

  const revealDelay = prefersReducedMotion ? 50 : 1300;
  const hideDelay = prefersReducedMotion ? 80 : 400;

  window.setTimeout(() => {
    splash.classList.add("is-hidden");
    document.body.classList.add("is-ready");
    document.body.classList.remove("is-locked");
  }, revealDelay);

  window.setTimeout(() => {
    splash.remove();
  }, revealDelay + hideDelay + 120);
}

function setupNavbar() {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!nav) {
    return;
  }

  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  };

  const toggleNav = () => {
    nav.classList.toggle("is-visible", window.scrollY > 60);

    if (window.innerWidth >= 980) {
      closeNav();
    }
  };

  toggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) {
      closeNav();
    }
  });

  toggleNav();
  window.addEventListener("scroll", toggleNav, { passive: true });
  window.addEventListener("resize", toggleNav);
}

function setupCursor() {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  const cursor = document.querySelector(".cursor");
  if (!cursor) {
    return;
  }

  document.body.classList.add("cursor-enabled");

  const state = {
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
  };

  const animate = () => {
    state.currentX = lerp(state.currentX, state.targetX, 0.14);
    state.currentY = lerp(state.currentY, state.targetY, 0.14);
    cursor.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0) translate(-50%, -50%)`;
    window.requestAnimationFrame(animate);
  };

  window.addEventListener(
    "mousemove",
    (event) => {
      state.targetX = event.clientX;
      state.targetY = event.clientY;
    },
    { passive: true }
  );

  document.addEventListener("mouseover", (event) => {
    const interactive = event.target.closest("a, button, .service-card, .partner-card, .contact__item");
    cursor.classList.toggle("is-active", Boolean(interactive));
  });

  animate();
}

function setupParallax() {
  if (prefersReducedMotion) {
    return;
  }

  const root = document.querySelector("[data-parallax-root]");
  const layers = document.querySelectorAll("[data-parallax-layer]");
  if (!root || !layers.length) {
    return;
  }

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const animate = () => {
    currentX = lerp(currentX, targetX, 0.08);
    currentY = lerp(currentY, targetY, 0.08);

    layers.forEach((layer, index) => {
      const multiplier = index === 0 ? 1 : -0.55;
      layer.style.transform = `translate3d(${currentX * multiplier}px, ${currentY * multiplier}px, 0)`;
    });

    window.requestAnimationFrame(animate);
  };

  root.addEventListener("mousemove", (event) => {
    const bounds = root.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    targetX = x * 0.02;
    targetY = y * 0.02;
  });

  root.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  animate();
}

function setupScrollReveal() {
  const revealGroups = [
    [".section__heading", 0],
    [".about__text", 90],
    [".about__card", 150],
    [".service-card", 80],
    [".signal__panel", 100],
    [".partners__row", 120],
    [".contact__panel", 100],
    [".footer__content", 120],
  ];

  const revealTargets = [];

  revealGroups.forEach(([selector, stepDelay]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add("reveal-on-scroll");
      element.style.setProperty("--reveal-delay", `${index * stepDelay}ms`);
      revealTargets.push(element);
    });
  });

  if (!revealTargets.length || prefersReducedMotion) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

async function init() {
  setupSplash();
  setupNavbar();
  setupCursor();
  setupParallax();
  setupScrollReveal();
}

init();