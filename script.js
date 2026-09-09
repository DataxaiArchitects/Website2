/* =========================================================================
   DataXAI — ArchitectXperience
   Interaction + purposeful motion. No external dependencies.
   ========================================================================= */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  document.documentElement.classList.add("js");

  /* ---------------------------------------------------------------
     Header: compact / blurred state on scroll
     --------------------------------------------------------------- */
  const header = $("[data-header]");
  const scrollBar = $("[data-scroll-bar]");
  const onScroll = () => {
    if (header) header.toggleAttribute("data-scrolled", window.scrollY > 8);
    if (scrollBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ---------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------- */
  const menuButton = $(".menu-toggle");
  const mobileNav = $("#mobile-nav");

  function setMenuOpen(open) {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileNav.hidden = !open;
  }
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () =>
      setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true"));
    $$("a", mobileNav).forEach(link => link.addEventListener("click", () => setMenuOpen(false)));
    window.addEventListener("resize", () => { if (window.innerWidth > 860) setMenuOpen(false); });
  }

  /* ---------------------------------------------------------------
     "Request a demo" style links → jump to the enquiry section
     --------------------------------------------------------------- */
  const enquirySection = $("#partnership");
  $$(".js-contact").forEach(link => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
      if (!enquirySection) return;
      // after the browser settles the hash-scroll, put the cursor in the form
      setTimeout(() => {
        const first = $("#contact-name", enquirySection);
        if (first) first.focus({ preventScroll: true });
      }, 500);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && mobileNav && !mobileNav.hidden) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  /* ---------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------------- */
  const revealTargets = $$("[data-reveal]");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(el => el.classList.add("is-visible"));
  } else {
    $$(".hero-title .w").forEach((el, i) => el.style.setProperty("--i", i % 5));
    $$(".value-v2-cards [data-reveal]").forEach((el, i) => el.style.setProperty("--i", i));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    revealTargets.forEach(el => io.observe(el));

    // Safety net: never let content stay hidden if the observer misfires.
    window.addEventListener("load", () => {
      setTimeout(() => {
        revealTargets.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-visible");
        });
      }, 900);
    });
  }

  /* ---------------------------------------------------------------
     Hero grid parallax (pointer)
     --------------------------------------------------------------- */
  const heroGrid = $(".hero-grid");
  if (heroGrid && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const hero = $(".hero");
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroGrid.style.setProperty("--px", `${x * -18}px`);
      heroGrid.style.setProperty("--py", `${y * -18}px`);
    });
    hero.addEventListener("pointerleave", () => {
      heroGrid.style.setProperty("--px", "0px");
      heroGrid.style.setProperty("--py", "0px");
    });
  }

  /* ---------------------------------------------------------------
     Stage images: hide the frame if an image is missing/broken
     so the panel stays clean until every asset is in place.
     --------------------------------------------------------------- */
  $$("[data-stage-img]").forEach(img => {
    const drop = () => { const fig = img.closest(".stage-media"); if (fig) fig.hidden = true; };
    img.addEventListener("error", drop);
    if (img.complete && img.naturalWidth === 0) drop();
    // add a decorative light-sweep layer (never covers the image)
    if (!prefersReducedMotion) {
      const fig = img.closest(".stage-media");
      if (fig && !$(".stage-sheen", fig)) {
        const s = document.createElement("span");
        s.className = "stage-sheen";
        s.setAttribute("aria-hidden", "true");
        fig.appendChild(s);
      }
    }
  });

  /* ---------------------------------------------------------------
     Journey tabs — accessible tablist + progress bar + auto-advance
     --------------------------------------------------------------- */
  const tabs = $$('[role="tab"][data-stage]');
  const bar = $("[data-journey-bar]");
  const timer = $("[data-journey-timer]");
  const stageCount = $("[data-journey-count]");
  const panel = $(".journey-panel");
  let autoTimer = null;
  const AUTO_MS = 6000;

  function runTimerBar() {
    if (!timer || prefersReducedMotion) return;
    timer.style.transition = "none";
    timer.style.width = "0%";
    void timer.offsetWidth;               // reflow so the reset takes hold
    timer.style.transition = `width ${AUTO_MS}ms linear`;
    timer.style.width = "100%";
  }
  function clearTimerBar() {
    if (!timer) return;
    timer.style.transition = "none";
    timer.style.width = "0%";
  }

  function selectStage(tab, focus) {
    if (!tab) return;
    const index = tabs.indexOf(tab);
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      const p = $("#" + item.getAttribute("aria-controls"));
      if (p) p.hidden = !active;
    });
    if (bar) bar.style.width = `${((index + 1) / tabs.length) * 100}%`;
    if (stageCount) stageCount.textContent = `Stage ${index + 1} of ${tabs.length}`;

    // stagger the deliverable chips in + run the light sweep for the shown stage
    const shown = $("#" + tab.getAttribute("aria-controls"));
    if (shown && !prefersReducedMotion) {
      const chips = $$(".chips li", shown);
      chips.forEach((c, i) => { c.style.transitionDelay = `${i * 70}ms`; c.classList.add("enter"); });
      const clear = () => chips.forEach(c => c.classList.remove("enter"));
      requestAnimationFrame(() => requestAnimationFrame(clear));
      setTimeout(clear, 140);                 // guaranteed: chips end up visible
      const sheen = $(".stage-sheen", shown);
      if (sheen) { sheen.classList.remove("run"); void sheen.offsetWidth; sheen.classList.add("run"); }
    }
    if (autoTimer) runTimerBar();
    if (focus) tab.focus();
  }

  function advance() {
    const current = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
    selectStage(tabs[(current + 1) % tabs.length], false);
  }

  function startAuto() {
    if (prefersReducedMotion || autoTimer) return;
    autoTimer = window.setInterval(advance, AUTO_MS);
    runTimerBar();
  }
  function stopAuto() {
    window.clearInterval(autoTimer);
    autoTimer = null;
    clearTimerBar();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => { stopAuto(); selectStage(tab, false); });
    tab.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      stopAuto();
      selectStage(tabs[next], true);
    });
  });

  if (panel && tabs.length) {
    selectStage(tabs[0], false);
    panel.addEventListener("pointerenter", stopAuto);
    panel.addEventListener("pointerleave", startAuto);
    panel.addEventListener("focusin", stopAuto);

    // only auto-advance once the panel has been seen
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      const seen = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { startAuto(); }
          else { stopAuto(); }
        });
      }, { threshold: 0.4 });
      seen.observe(panel);
    }
  }

  /* ---------------------------------------------------------------
     Hero: count-up proof stats
     --------------------------------------------------------------- */
  const counters = $$(".hero-proof dt[data-count]");
  if (counters.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    counters.forEach(el => { el.textContent = "0" + (el.dataset.suffix || ""); });
  }
  if (counters.length) {
    const runCount = el => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || "";
      if (prefersReducedMotion) { el.textContent = target + suffix; return; }
      const dur = 1100, start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const co = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(el => co.observe(el));
    } else counters.forEach(runCount);
  }

  /* ---------------------------------------------------------------
     Hero: 3D tilt on the visual
     --------------------------------------------------------------- */
  const heroVisual = $("[data-tilt-visual]");
  if (heroVisual && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const frame = $(".hero-visual-frame", heroVisual);
    const heroEl = $(".hero");
    heroEl.addEventListener("pointermove", e => {
      const r = heroVisual.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (frame) {
        frame.style.setProperty("--ry", `${x * 6}deg`);
        frame.style.setProperty("--rx", `${y * -6}deg`);
      }
    });
    heroEl.addEventListener("pointerleave", () => {
      if (frame) { frame.style.setProperty("--ry", "0deg"); frame.style.setProperty("--rx", "0deg"); }
    });
  }

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------
     Enquiry form — submit to Netlify Forms via fetch (no page reload),
     then send the visitor to the thank-you page. Falls back to a native
     submit if fetch fails.
     --------------------------------------------------------------- */
  const form = $('form[name="corporate-enquiry"]');
  if (form) {
    const submitBtn = $(".form-submit", form);
    const successUrl = form.getAttribute("action") || "/thank-you.html";
    const isLocal = location.protocol === "file:" ||
      ["localhost", "127.0.0.1", "[::1]", ""].includes(location.hostname);

    const setStatus = (msg, kind) => {
      let status = $(".form-status", form);
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        status.setAttribute("role", "status");
        form.appendChild(status);
      }
      status.dataset.kind = kind || "info";
      status.textContent = msg;
      status.scrollIntoView({ block: "nearest" });
    };

    form.addEventListener("submit", async event => {
      if (!form.reportValidity()) { event.preventDefault(); return; }
      event.preventDefault();

      // Netlify Forms expects a urlencoded body that includes form-name.
      const body = new URLSearchParams(new FormData(form)).toString();

      if (isLocal) {
        setStatus("Local preview — this enquiry submits to Netlify on the deployed site.", "info");
        return;
      }

      const original = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      setStatus("Sending your enquiry…", "info");

      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        window.location.assign(successUrl);
      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = original; }
        setStatus("Something went wrong sending your enquiry. Please try again, or email hello@dataxai.in.", "error");
      }
    });
  }
})();
