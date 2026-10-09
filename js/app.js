(() => {
  const P = window.PARTY;
  const $ = (s, r = document) => r.querySelector(s);
  const pad = n => String(n).padStart(2, "0");
  const target = new Date(P.date);

  // ---------- Contenido desde config ----------
  $("#who").textContent = P.name;
  $("#age").textContent = P.age;
  document.title = `¡Cumple de ${P.name}! 🎂`;

  $("#d-when").textContent = new Intl.DateTimeFormat("es-AR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
  }).format(target) + " hs";
  $("#d-where").textContent = `${P.venue} — ${P.address}`;
  $("#d-map").href = P.mapUrl;
  P.bring.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    $("#d-bring").appendChild(li);
  });

  // ---------- Router ----------
  const routes = ["inicio", "fiesta", "rsvp"];
  function route() {
    const name = (location.hash.match(/^#\/(\w+)/) || [])[1];
    const current = routes.includes(name) ? name : "inicio";
    document.querySelectorAll(".screen").forEach(s => { s.hidden = s.dataset.route !== current; });
    document.querySelectorAll("[data-nav]").forEach(a => {
      if (a.dataset.nav === current) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    if (name) $(`#${current}`).focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);
  route();

  // ---------- Countdown ----------
  function tick() {
    const diff = target - Date.now();
    const msg = $("#cd-msg");
    if (diff <= 0) {
      const sameDay = Date.now() - target < 24 * 3600 * 1000;
      msg.textContent = sameDay ? "🎉 ¡ES HOY! ¡GAME ON! 🎉" : "GAME OVER... ¡pero la pasamos genial!";
      msg.hidden = false;
      ["d", "h", "m", "s"].forEach(k => ($(`#cd-${k}`).textContent = "00"));
      return;
    }
    const s = Math.floor(diff / 1000);
    $("#cd-d").textContent = pad(Math.floor(s / 86400));
    $("#cd-h").textContent = pad(Math.floor(s % 86400 / 3600));
    $("#cd-m").textContent = pad(Math.floor(s % 3600 / 60));
    $("#cd-s").textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  // ---------- RSVP ----------
  $("#rsvp-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    const name = f.elements.name.value.trim();
    $("#f-error").hidden = !!name;
    if (!name) { f.elements.name.focus(); return; }

    const going = f.going.value === "yes";
    const plus = Math.max(0, Math.min(5, parseInt(f.plus.value, 10) || 0));
    const note = f.note.value.trim();
    const lines = going
      ? [`¡Hola ${P.name}! Soy ${name} y CONFIRMO para tu cumple 🎉`,
         plus ? `Voy con ${plus} acompañante${plus > 1 ? "s" : ""}.` : "Voy solo/a."]
      : [`Hola ${P.name}, soy ${name}. Lamentablemente no puedo ir a tu cumple 😢`];
    if (note) lines.push(`Nota: ${note}`);

    if (going) confetti();
    const url = `https://wa.me/${P.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    setTimeout(() => window.open(url, "_blank", "noopener"), going ? 600 : 0);
  });

  // ---------- Confetti ----------
  const cvs = $("#confetti");
  const ctx = cvs.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pieces = [], raf = 0;
  const colors = ["#ff2ea6", "#2ef2ff", "#ffe94a", "#5cff8a", "#ffffff"];

  function resize() {
    const r = devicePixelRatio || 1;
    cvs.width = innerWidth * r; cvs.height = innerHeight * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  function confetti() {
    if (reduce) return;
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: innerWidth / 2, y: innerHeight * 0.6,
        vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 16 - 4,
        s: 5 + Math.random() * 6, c: colors[i % colors.length], life: 120 + Math.random() * 60
      });
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pieces = pieces.filter(p => p.life-- > 0 && p.y < innerHeight + 20);
    for (const p of pieces) {
      p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.vx *= 0.99;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    raf = pieces.length ? requestAnimationFrame(frame) : 0;
  }
  $("#start").addEventListener("click", confetti);
})();
