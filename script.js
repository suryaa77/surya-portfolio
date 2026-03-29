(function () {
  "use strict";

  /* Landing: show hero first (avoid restored scroll skipping past hero) */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  function scrollToTopIfNoHash() {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scrollToTopIfNoHash);
  } else {
    scrollToTopIfNoHash();
  }
  window.addEventListener("load", scrollToTopIfNoHash);

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Mobile nav */
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var header = document.querySelector(".site-header");
  var headerOffset = header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = this.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 10;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -40px 0px", threshold: 0.06 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Typing animation */
  var roles = ["Freelancer", "Developer", "Designer"];
  var typingEl = document.getElementById("typing-text");

  function startTyping() {
    if (!typingEl) return;
    if (reduceMotion) {
      typingEl.textContent = roles.join(" · ");
      return;
    }
    var wordIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var word = roles[wordIndex];
      if (!deleting) {
        charIndex += 1;
        typingEl.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          window.setTimeout(tick, 2000);
          return;
        }
        window.setTimeout(tick, 110);
      } else {
        charIndex -= 1;
        typingEl.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % roles.length;
          window.setTimeout(tick, 350);
          return;
        }
        window.setTimeout(tick, 45);
      }
    }

    window.setTimeout(tick, 600);
  }

  startTyping();

  /* Animated counters */
  function animateCounter(el, target, duration) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }
    window.requestAnimationFrame(step);
  }

  var statsSection = document.getElementById("stats");
  var countersStarted = false;
  var statValues = document.querySelectorAll(".stat-value[data-target]");

  function runCounters() {
    if (countersStarted) return;
    countersStarted = true;
    statValues.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-target"), 10);
      if (reduceMotion) {
        el.textContent = String(target);
        return;
      }
      el.textContent = "0";
      animateCounter(el, target, 1600);
    });
  }

  if (statsSection && statValues.length && "IntersectionObserver" in window) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounters();
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    statsObserver.observe(statsSection);
  } else {
    runCounters();
  }

  /* Background particles */
  var canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var particleCount = Math.min(55, Math.floor((window.innerWidth * window.innerHeight) / 18000));

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          a: Math.random() * 0.35 + 0.08,
          hue: Math.random() > 0.5 ? 265 : 210
        });
      }
    }

    resizeCanvas();
    initParticles();
    window.addEventListener(
      "resize",
      function () {
        resizeCanvas();
        initParticles();
      },
      { passive: true }
    );

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ", 85%, 70%, " + p.a + ")";
        ctx.fill();
      });
      window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
  }

  /* Toast notifications */
  var toastEl = document.getElementById("toast");
  var toastOverlayEl = document.getElementById("toast-overlay");
  var toastHideTimer = null;
  var toastExitTimer = null;

  function showToast(type, message) {
    if (!toastEl) return;
    var msgEl = toastEl.querySelector(".toast__message");
    if (msgEl) msgEl.textContent = message;
    toastEl.classList.remove("toast--success", "toast--error", "toast--visible");
    toastEl.classList.add("toast--" + type);
    toastEl.removeAttribute("hidden");
    if (toastOverlayEl) {
      toastOverlayEl.removeAttribute("hidden");
      toastOverlayEl.setAttribute("aria-hidden", "false");
      toastOverlayEl.classList.remove("toast-overlay--visible");
    }
    window.requestAnimationFrame(function () {
      if (toastOverlayEl) toastOverlayEl.classList.add("toast-overlay--visible");
      toastEl.classList.add("toast--visible");
    });
    if (toastHideTimer) window.clearTimeout(toastHideTimer);
    if (toastExitTimer) window.clearTimeout(toastExitTimer);
    toastHideTimer = window.setTimeout(function () {
      toastEl.classList.remove("toast--visible");
      if (toastOverlayEl) toastOverlayEl.classList.remove("toast-overlay--visible");
      toastExitTimer = window.setTimeout(function () {
        toastEl.setAttribute("hidden", "");
        if (toastOverlayEl) {
          toastOverlayEl.setAttribute("hidden", "");
          toastOverlayEl.setAttribute("aria-hidden", "true");
        }
      }, 450);
    }, 3000);
  }

  /* EmailJS — contact form */
  if (typeof emailjs !== "undefined") {
    emailjs.init("rzF_nQt6N3o9HPGC6");
  }

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (typeof emailjs === "undefined") {
        showToast("error", "Failed to send message. Try again.");
        return;
      }

      var name = contactForm.querySelector('[name="name"]').value.trim();
      var email = contactForm.querySelector('[name="email"]').value.trim();
      var message = contactForm.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        showToast("error", "Please fill in all fields.");
        return;
      }

      emailjs
        .send("service_su8yibk", "template_6402u7n", {
          name: name,
          email: email,
          message: message
        })
        .then(function () {
          showToast("success", "Message sent successfully 🚀");
          contactForm.reset();
        })
        .catch(function () {
          showToast("error", "Failed to send message. Try again.");
        });
    });
  }
})();
