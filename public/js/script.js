/* =========================================================
   Nex Aura — script.js (vanilla, no dependencies)
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 20);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = ((y / h) * 100).toFixed(2) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const toggle = $("#navToggle");
  const mobile = $("#navMobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      const open = mobile.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        mobile.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }


  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  const cIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.getAttribute("data-count") || "0", 10);
      const dur = 1600;
      const start = performance.now();
      const fmt = (n) => n >= 1000 ? n.toLocaleString() : String(n);
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cIo.unobserve(el);
    });
  }, { threshold: 0.4 });
  $$("[data-count]").forEach(el => cIo.observe(el));

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && !("ontouchstart" in window)) {
    $$("[data-magnetic]").forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.15}px, ${my * 0.2}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Tilt on cards ---------- */
  if (!reduceMotion && !("ontouchstart" in window)) {
    $$(".tilt").forEach(card => {
      let raf = 0;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
        });
      });
      card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        card.style.transform = "";
      });
    });
  }

  /* ---------- Particles (neural network) ---------- */
  const canvas = $("#particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, pts;
    const COUNT = window.innerWidth < 640 ? 32 : window.innerWidth < 1200 ? 58 : 90;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    const init = () => {
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r: (Math.random() * 1.4 + 0.4) * dpr
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,210,255,.55)";
        ctx.fill();
      }
      const maxD = 140 * dpr;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD * maxD) {
            const alpha = 1 - Math.sqrt(d2) / maxD;
            ctx.strokeStyle = `rgba(124,180,255,${alpha * 0.22})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    resize(); init();
    window.addEventListener("resize", () => { resize(); init(); });
    draw();
  }

  /* ---------- Terminal ---------- */
  const term = $("#terminal");
  const body = $("#termBody");
  const input = $("#termInput");
  if (term && body && input) {
    const print = (html, cls = "term-out") => {
      const div = document.createElement("div");
      div.className = "term-line " + cls;
      div.innerHTML = html;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    };
    const echo = (cmd) => {
      const div = document.createElement("div");
      div.className = "term-line";
      div.innerHTML = `<span class="term-prompt">nexaura@grid:~$</span> ${escapeHTML(cmd)}`;
      body.appendChild(div);
    };
    const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));

    const banner = `███╗   ██╗███████╗██╗  ██╗    █████╗ ██╗   ██╗██████╗  █████╗ 
████╗  ██║██╔════╝╚██╗██╔╝   ██╔══██╗██║   ██║██╔══██╗██╔══██╗
██╔██╗ ██║█████╗   ╚███╔╝    ███████║██║   ██║██████╔╝███████║
██║╚██╗██║██╔══╝   ██╔██╗    ██╔══██║██║   ██║██╔══██╗██╔══██║
██║ ╚████║███████╗██╔╝ ██╗   ██║  ██║╚██████╔╝██║  ██║██║  ██║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`;

    const commands = {
      help() {
        print(`Available commands:
  <b>help</b>       — show this menu
  <b>about</b>      — what is Nex Aura
  <b>platform</b>   — upcoming competitive platform
  <b>community</b>  — what the community offers
  <b>join</b>       — how to join us
  <b>projects</b>   — featured open-source projects
  <b>events</b>     — upcoming events and CTFs
  <b>whoami</b>     — identify yourself
  <b>sudo</b>       — attempt privilege escalation
  <b>flag</b>       — retrieve the CTF flag
  <b>clear</b>      — clear the terminal`);
      },
      about() { print("Nex Aura is a global community of hackers, researchers and builders — evolving into a competitive cybersecurity platform."); },
      platform() { print("The Nex Aura Platform: Battlefields, CTFs, Ranked Mode, AI Security, Championships and more. Alpha launching soon."); },
      community() { print("Weekly CTFs, writeups, mentorship, hackathons, open source projects, and a Discord command center."); },
      join() { print("Head to #join on this page, or hit the <b>Join Community</b> button in the nav."); },
      projects() { print("Featured: AuraRecon, Nyx Sandbox, PromptForge, Wraith, BlueRunner, Aurora Academy. See the Projects section."); },
      events() { print("Next up: Nex Aura Championship — Qualifier I. See the Events section for the full schedule."); },
      whoami() { print(`guest — anonymous operator @ ${location.hostname || "nexaura.local"}`); },
      sudo() {
        print("[sudo] password for guest: ****************", "term-out");
        setTimeout(() => print("Access granted. Welcome, operator.", "term-out flag"), 350);
        setTimeout(() => print(banner, "term-out ascii"), 700);
        setTimeout(() => print("System: <b>NexAura-OS v0.7.3</b> · Kernel: <b>aurora-lts</b> · Uptime: <b>∞</b>"), 1200);
      },
      flag() { print("flag{n3x_4ur4_1s_r1s1ng_2026}", "term-out flag"); },
      clear() { body.innerHTML = ""; },
      "": () => {},
    };

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const raw = input.value.trim();
      const cmd = raw.toLowerCase();
      echo(raw);
      input.value = "";
      if (commands[cmd]) commands[cmd]();
      else if (cmd) print(`command not found: <b>${escapeHTML(cmd)}</b> — type <b>help</b>`, "term-out err");
      body.scrollTop = body.scrollHeight;
    });
    term.addEventListener("click", () => input.focus());
  }

  /* ---------- Global easter egg: type "flag" anywhere ---------- */
  let buffer = "";
  window.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-6);
    if (buffer.endsWith("flag")) {
      showToast("🚩 flag{n3x_4ur4_1s_r1s1ng_2026}");
      buffer = "";
    } else if (buffer.endsWith("sudo")) {
      showToast("Access granted. Welcome, operator.");
      buffer = "";
    }
  });
  function showToast(text) {
    let t = document.getElementById("__toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "__toast";
      Object.assign(t.style, {
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%) translateY(20px)",
        padding: "14px 22px", borderRadius: "999px", zIndex: 9999,
        background: "linear-gradient(135deg,rgba(0,229,255,.2),rgba(124,77,255,.2))",
        border: "1px solid rgba(255,255,255,.15)", color: "#FFC65C",
        fontFamily: '"JetBrains Mono",monospace', fontSize: "14px",
        backdropFilter: "blur(14px)", opacity: "0",
        transition: "opacity .3s ease, transform .3s ease",
        boxShadow: "0 10px 40px -10px rgba(124,77,255,.6)"
      });
      document.body.appendChild(t);
    }
    t.textContent = text;
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(t.__timer);
    t.__timer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(20px)";
    }, 3200);
  }
})();
