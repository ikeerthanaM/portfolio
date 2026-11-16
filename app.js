/* ==========================================================================
   PORTFOLIO DATA STORE (Single Source of Truth)
   Swap with: const portfolioData = await fetch('/api/portfolio').then(r => r.json())
   ========================================================================== */
const portfolioData = {
  profile: {
    initials: "A.M.",
    name: "Aarav Mehta",
    eyebrow: "Full-Stack Engineer & Essayist",
    bio: "I build calm, resilient software systems and write long-form essays on craft, patience, and human-scale technology—from sunlit shores to deep-water engineering.",
    epigraph: "“Everything about him was old except his eyes and they were the same color as the sea.”",
    epigraphSub: "Out past the harbor swell · Sounding line below",
    footerNote: "Crafted in vanilla HTML, CSS & JS · Inspired by Hemingway & Hosseini",
    links: [
      { label: "Read Writing", href: "#articles", primary: true },
      { label: "GitHub", href: "https://github.com", primary: false },
      { label: "Email", href: "mailto:hello@example.com", primary: false }
    ]
  },

  education: [
    {
      year: "2020 — 2024",
      depth: "18m",
      degree: "B.Tech in Computer Science & Engineering",
      institution: "National Institute of Technology, Surathkal",
      focus: "Distributed systems, compilers, human-computer interaction, and editorial web typography."
    },
    {
      year: "2023",
      depth: "42m",
      degree: "Undergraduate Research Fellowship — Systems",
      institution: "Center for Networked Computing",
      focus: "Resilient local-first synchronization protocols and conflict-free replicated data structures."
    },
    {
      year: "2018 — 2020",
      depth: "68m",
      degree: "Higher Secondary — Mathematics & Literature",
      institution: "Delhi Public Academy",
      focus: "Classical calculus, algorithmic problem-solving, and literary editorial board."
    }
  ],

  skills: [
    "TypeScript",
    "JavaScript (ES2024)",
    "HTML5 & Semantic Accessibility",
    "Modern CSS / Grid / Motion",
    "GSAP & SVG Choreography",
    "Node.js & REST / GraphQL",
    "PostgreSQL & SQLite",
    "Distributed Systems",
    "React & Next.js",
    "Docker & CI/CD"
  ],

  interests: [
    "Literary Fiction",
    "Maritime History",
    "Fountain Pens & Analog Notebooks",
    "Editorial Typography",
    "Long-Distance Running",
    "Kite Aerodynamics",
    "Local-First Software",
    "Minimalist Cartography"
  ],

  projects: [
    {
      title: "Astrolabe DB",
      summary: "An embedded, local-first time-series engine designed for low-connectivity oceanographic sensors and field notebooks.",
      stack: ["TypeScript", "IndexedDB", "CRDTs", "Web Workers"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "Marginalia Reader",
      summary: "A distraction-free long-form reading environment with inline ink annotations, fluid optical sizing, and offline archival.",
      stack: ["Vanilla JS", "CSS Typography", "Service Workers"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "Tidegauge Telemetry",
      summary: "Real-time coastal buoy visualization dashboard rendering streaming pressure and swell vectors with sub-millisecond SVG diffs.",
      stack: ["Node.js", "WebSockets", "SVG", "PostgreSQL"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "Paperloom",
      summary: "A modular static essay publisher converting plain Markdown manuscripts into archival-grade digital chapbooks.",
      stack: ["Go", "Markdown AST", "HTML/CSS"],
      github: "https://github.com",
      live: "https://example.com"
    }
  ],

  articles: [
    {
      id: "patience-of-the-line",
      title: "On Holding a Taut Line: Patience in Software Architecture",
      date: "October 14, 2026",
      readTime: "6 min read",
      excerpt: "What an old fisherman eighty-four days without a catch teaches us about writing code meant to survive quiet years.",
      body: [
        "Most software advice optimizes for speed at the harbor: ship fast, break things, rewrite next quarter. Yet the systems we actually trust—compilers, filesystems, protocols—are built like Santiago’s fishing lines: kept precisely vertical, weighted cleanly, and checked by hand at every fathom.",
        "When we over-abstract too early, we tangle the line before it reaches deep water. Simplicity is not the absence of ambition; it is the discipline of keeping every joint inspectable under tension.",
        "<blockquote>A craftsman does not fight the current with noise; he learns where the current turns and places his line there.</blockquote>",
        "Next time you open a pull request or design a schema, ask what happens when the sea gets dark. Will a future engineer—or your future self—feel the pull of the system clearly, or lose themselves in tangled rigging?"
      ]
    },
    {
      id: "wind-and-string",
      title: "For You, a Thousand Times Over: Craft, Memory, and Small Interfaces",
      date: "August 29, 2026",
      readTime: "5 min read",
      excerpt: "Why the smallest interactions—a kite dipping in crosswind, a crisp page turn—carry more emotional weight than spectacle.",
      body: [
        "A kite flies only because two opposing forces agree to stay in dialogue: the wind lifting the paper frame and the string pulling back from a child’s hand. Remove either tension and the kite falls.",
        "Digital interfaces obey the same physics. Pure freedom without structure dissolves into confusion; rigid structure without play feels mechanical. The best tools offer just enough resistance to feel alive beneath your fingers.",
        "In an era of heavy animations and oversized theatrics, restraint has become radical. Give a reader clean margins, honest typography, and an interface that listens quietly to their intent."
      ]
    },
    {
      id: "notes-in-glass-bottles",
      title: "Writing Code Like Letters in Glass Bottles",
      date: "June 11, 2026",
      readTime: "4 min read",
      excerpt: "Treat every module and essay as a message sealed for an unknown reader across time.",
      body: [
        "Every codebase is a correspondence with strangers. Even if no one else joins your repository, the person reading your functions six months from now is effectively someone else.",
        "Naming variables honestly, keeping state in one predictable shape, and separating data from rendering are acts of hospitality. They turn murky water clear so another traveler can take the helm without fear."
      ]
    }
  ]
};

/* ==========================================================================
   DYNAMIC DOM RENDERING LAYER
   ========================================================================== */
function renderPortfolio(data) {
  renderProfile(data.profile);
  renderEducation(data.education);
  renderNetLists(data.skills, data.interests);
  renderProjects(data.projects);
  renderArticles(data.articles);
}

function renderProfile(profile) {
  document.getElementById("nav-brand").textContent = profile.initials;
  document.getElementById("footer-note").textContent = profile.footerNote;

  const bioContainer = document.getElementById("shore-bio");
  const linksHtml = profile.links
    .map((link) => {
      const external = link.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
      const cls = link.primary ? "shore-link" : "shore-link is-secondary";
      return `<a href="${link.href}" class="${cls}"${external}>${link.label}</a>`;
    })
    .join("");

  bioContainer.innerHTML = `
    <span class="shore-eyebrow">${profile.eyebrow}</span>
    <h1>${profile.name}</h1>
    <p>${profile.bio}</p>
    <div class="shore-actions">${linksHtml}</div>
  `;

  document.getElementById("sea-caption").innerHTML = `
    <p class="sea-epigraph">${profile.epigraph}</p>
    <span class="sea-sub">${profile.epigraphSub}</span>
  `;

  document.getElementById("footer-links").innerHTML = profile.links
    .map((link) => {
      const external = link.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${link.href}"${external}>${link.label}</a>`;
    })
    .join("");
}

function renderEducation(items) {
  document.getElementById("education-list").innerHTML = items
    .map(
      (item) => `
      <li class="edu-milestone">
        <span class="edu-knot" aria-hidden="true"></span>
        <div class="edu-meta">
          <span class="edu-year">${item.year}</span>
          <span class="edu-depth-mark">Sounding &middot; ${item.depth}</span>
        </div>
        <h3>${item.degree}</h3>
        <div class="edu-institution">${item.institution}</div>
        <p class="edu-focus">${item.focus}</p>
      </li>
    `
    )
    .join("");
}

function renderNetLists(skills, interests) {
  document.getElementById("skills-list").innerHTML = skills
    .map((s) => `<li class="net-pill">${s}</li>`)
    .join("");
  document.getElementById("interests-list").innerHTML = interests
    .map((i) => `<li class="net-pill">${i}</li>`)
    .join("");
}

function renderProjects(projects) {
  document.getElementById("projects-grid").innerHTML = projects
    .map(
      (proj) => `
      <article class="project-card">
        <div>
          <h3>${proj.title}</h3>
          <p class="project-summary">${proj.summary}</p>
          <div class="project-stack">
            ${proj.stack.map((tech) => `<span class="stack-tag">${tech}</span>`).join("")}
          </div>
        </div>
        <div class="project-links">
          <a href="${proj.github}" class="project-link" target="_blank" rel="noopener noreferrer">
            ${iconCode()} Source Code
          </a>
          <a href="${proj.live}" class="project-link" target="_blank" rel="noopener noreferrer">
            ${iconExternal()} Live Vessel
          </a>
        </div>
      </article>
    `
    )
    .join("");
}

function renderArticles(articles) {
  document.getElementById("articles-grid").innerHTML = articles
    .map(
      (article) => `
      <article class="article-card" data-article-id="${article.id}" tabindex="0" role="button" aria-label="Read ${article.title}">
        <div>
          <div class="article-bottle-head">
            <span class="article-meta">${article.date} &middot; ${article.readTime}</span>
            ${iconBottle()}
          </div>
          <h3>${article.title}</h3>
          <p class="article-excerpt">${article.excerpt}</p>
        </div>
        <span class="read-trigger">Uncork &amp; Read &rarr;</span>
      </article>
    `
    )
    .join("");
}

function iconCode() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
}

function iconExternal() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
}

function iconBottle() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2h4v3l3 4v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l3-4V2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>`;
}

/* ==========================================================================
   UNIFIED COASTLINE LAYOUT + INTERACTIVE KITE PHYSICS
   Keeps 1:1 proportions across the entire continuous golden-sand-to-sea SVG.
   ========================================================================== */
const coastSceneState = {
  spoolX: 300,
  spoolY: 420,
  kiteBaseX: 520,
  kiteBaseY: 180,
  boatX: 1600,
  waterY: 500
};

function layoutCoastWorld() {
  const track = document.getElementById("coast-track");
  const svg = document.getElementById("unified-coast-svg");
  const W = track.offsetWidth;
  const H = track.offsetHeight;
  const viewW = window.innerWidth;

  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const waterY = Math.round(H * 0.71);
  coastSceneState.waterY = waterY;

  // Sky & Water Backdrop
  const skyRect = document.getElementById("sky-rect");
  skyRect.setAttribute("width", W);
  skyRect.setAttribute("height", waterY + 2);

  const waterRect = document.getElementById("water-rect");
  waterRect.setAttribute("y", waterY);
  waterRect.setAttribute("width", W);
  waterRect.setAttribute("height", H - waterY);

  const waterDepthOverlay = document.getElementById("water-depth-overlay");
  waterDepthOverlay.setAttribute("y", waterY);
  waterDepthOverlay.setAttribute("width", W);
  waterDepthOverlay.setAttribute("height", H - waterY);

  // Sun, Clouds & Distant Seabirds Distributed Naturally Along Coastline
  document.getElementById("sky-details").innerHTML = `
    <circle cx="${Math.round(W * 0.34)}" cy="${Math.round(H * 0.17)}" r="36" fill="#FEF3C7" opacity="0.88" />
    <path d="M${W * 0.08} ${H * 0.18} Q${W * 0.095} ${H * 0.15} ${W * 0.115} ${H * 0.17} Q${W * 0.13} ${H * 0.15} ${W * 0.145} ${H * 0.175} L${W * 0.075} ${H * 0.185} Z" fill="#FFFFFF" opacity="0.58" />
    <path d="M${W * 0.56} ${H * 0.22} Q${W * 0.575} ${H * 0.195} ${W * 0.595} ${H * 0.21} Q${W * 0.61} ${H * 0.195} ${W * 0.625} ${H * 0.22} L${W * 0.555} ${H * 0.225} Z" fill="#FFFFFF" opacity="0.5" />
    <path d="M${W * 0.72} ${H * 0.24} Q${W * 0.72 + 6} ${H * 0.24 - 6} ${W * 0.72 + 12} ${H * 0.24} Q${W * 0.72 + 18} ${H * 0.24 - 6} ${W * 0.72 + 24} ${H * 0.24}" fill="none" stroke="#475569" stroke-width="1.1" stroke-linecap="round" opacity="0.55" />
    <path d="M${W * 0.75} ${H * 0.27} Q${W * 0.75 + 5} ${H * 0.27 - 5} ${W * 0.75 + 10} ${H * 0.27} Q${W * 0.75 + 15} ${H * 0.27 - 5} ${W * 0.75 + 20} ${H * 0.27}" fill="none" stroke="#475569" stroke-width="1" stroke-linecap="round" opacity="0.42" />
  `;

  // Boy & Kite Positioning (Avoids Bio Card on Both Desktop and Mobile)
  const boyX = viewW >= 900 ? Math.round(viewW * 0.56) : Math.round(viewW * 0.54);
  const boySandY = waterY - 14;
  const boyScale = viewW >= 900 ? 1.05 : 0.92;
  const boyOffsetY = boySandY - 64 * boyScale;

  document.getElementById("boy-anchor").setAttribute(
    "transform",
    `translate(${boyX}, ${boyOffsetY}) scale(${boyScale})`
  );

  // Boy's Spool Coordinates in SVG Space (Local x=26.5, y=9.5)
  coastSceneState.spoolX = boyX + 26.5 * boyScale;
  coastSceneState.spoolY = boyOffsetY + 9.5 * boyScale;
  coastSceneState.kiteBaseX = viewW >= 900 ? Math.round(viewW * 0.78) : Math.round(viewW * 0.79);
  coastSceneState.kiteBaseY = viewW >= 900 ? Math.round(H * 0.24) : Math.round(H * 0.43);

  // Seamless Golden-Sand Slope Flowing Gently Into the Waterline
  const shoreWaterMeetX = Math.max(boyX + 180, Math.round(W * 0.46));
  const deepSandEndX = Math.min(W * 0.65, shoreWaterMeetX + 340);

  document.getElementById("sand-underwater-path").setAttribute(
    "d",
    `M0 ${waterY - 40} Q${boyX * 0.6} ${waterY - 46} ${boyX + 40} ${waterY - 12} Q${shoreWaterMeetX} ${waterY + 12} ${deepSandEndX} ${waterY + 115} L${deepSandEndX} ${H} L0 ${H} Z`
  );

  document.getElementById("sand-shore-path").setAttribute(
    "d",
    `M0 ${waterY - 54} C${boyX * 0.45} ${waterY - 62}, ${boyX * 0.78} ${waterY - 26}, ${boyX + 45} ${waterY - 10} C${boyX + 120} ${waterY + 2}, ${shoreWaterMeetX - 40} ${waterY - 2}, ${shoreWaterMeetX + 55} ${waterY + 26} L${shoreWaterMeetX + 55} ${H} L0 ${H} Z`
  );

  document.getElementById("sand-ridge-path").setAttribute(
    "d",
    `M0 ${waterY - 16} Q${boyX * 0.55} ${waterY - 22} ${boyX + 25} ${waterY + 6} Q${shoreWaterMeetX * 0.85} ${waterY + 24} ${shoreWaterMeetX} ${waterY + 48} L0 ${H} Z`
  );

  // Gentle Surf Foam Along the Connected Sand-Sea Edge
  document.getElementById("surf-foam-path").setAttribute(
    "d",
    `M${shoreWaterMeetX - 95} ${waterY + 1} Q${shoreWaterMeetX - 30} ${waterY + 6} ${shoreWaterMeetX + 45} ${waterY + 2}`
  );

  // Dune Grass Blades on the Upper Sandy Slope
  const grassX1 = Math.max(36, Math.round(boyX * 0.25));
  const grassX2 = Math.max(90, Math.round(boyX * 0.48));
  const grassY1 = waterY - 46;
  const grassY2 = waterY - 36;
  document.getElementById("dune-grass").innerHTML = `
    <g stroke="#8A9E79" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.72">
      <path d="M${grassX1} ${grassY1} Q${grassX1 - 4} ${grassY1 - 18} ${grassX1 - 10} ${grassY1 - 26}" />
      <path d="M${grassX1 + 4} ${grassY1} Q${grassX1 + 8} ${grassY1 - 20} ${grassX1 + 14} ${grassY1 - 27}" />
      <path d="M${grassX2} ${grassY2} Q${grassX2 - 3} ${grassY2 - 15} ${grassX2 - 8} ${grassY2 - 22}" />
      <path d="M${grassX2 + 4} ${grassY2} Q${grassX2 + 8} ${grassY2 - 16} ${grassX2 + 13} ${grassY2 - 21}" />
    </g>
  `;

  // Continuous Wave Paths Spanning Full Coast Width (from Surf Edge to Open Sea)
  function buildWavePath(startX, endX, baseY, amp, step, closeToBottom) {
    let d = `M${startX} ${baseY}`;
    for (let x = startX; x < endX; x += step) {
      const mid = x + step * 0.5;
      d += ` Q${mid} ${baseY - amp} ${x + step} ${baseY}`;
      amp = -amp;
    }
    if (closeToBottom) {
      d += ` L${endX} ${baseY + 46} L${startX} ${baseY + 46} Z`;
    }
    return d;
  }

  const waveStart = shoreWaterMeetX - 80;
  document.getElementById("waves-back").setAttribute("d", buildWavePath(waveStart, W + 160, waterY, 5, 110, true));
  document.getElementById("waves-front").setAttribute("d", buildWavePath(waveStart - 30, W + 160, waterY + 4, 4.5, 90, true));
  document.getElementById("waves-glint").setAttribute("d", buildWavePath(waveStart - 30, W + 160, waterY + 5, 4.5, 90, false));

  // Boat Centered at Exact 50vw When Horizontal Camera Reaches End of Track
  const boatX = Math.round(W - viewW * 0.5);
  coastSceneState.boatX = boatX;
  document.getElementById("skiff-anchor").setAttribute("transform", `translate(${boatX}, ${waterY - 5})`);
  document.getElementById("shark-anchor").setAttribute("transform", `translate(${boatX}, ${waterY + 76})`);

  // Taut Brass Sounding Line Dropping Directly Beneath Boat Hull to Bottom Edge
  const soundingLine = document.getElementById("boat-sounding-line");
  soundingLine.setAttribute("x1", boatX);
  soundingLine.setAttribute("y1", waterY + 8);
  soundingLine.setAttribute("x2", boatX);
  soundingLine.setAttribute("y2", H);
}

function initKitePhysics() {
  const svg = document.getElementById("unified-coast-svg");
  const kiteGroup = document.getElementById("kite-group");
  const kiteString = document.getElementById("kite-string");
  const kiteTail = document.getElementById("kite-tail");
  if (!svg || !kiteGroup || !kiteString) return;

  const state = {
    x: coastSceneState.kiteBaseX,
    y: coastSceneState.kiteBaseY,
    rot: -14,
    vx: 0,
    vy: 0,
    vrot: 0,
    targetDx: 0,
    targetDy: 0,
    targetDrot: 0
  };

  function pointerToSvg(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    return ctm ? pt.matrixTransform(ctm.inverse()) : { x: state.x, y: state.y };
  }

  function applyWind(clientX, clientY) {
    const p = pointerToSvg(clientX, clientY);
    const dx = p.x - state.x;
    const dy = p.y - state.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 240) {
      const strength = Math.max(0, 1 - dist / 240);
      state.targetDx = Math.max(-30, Math.min(30, -dx * 0.22 * strength));
      state.targetDy = Math.max(-22, Math.min(28, (dy > 0 ? 16 : -14) * strength + 8 * strength));
      state.targetDrot = Math.max(-24, Math.min(24, dx * 0.16 * strength));
    } else {
      state.targetDx = 0;
      state.targetDy = 0;
      state.targetDrot = 0;
    }
  }

  svg.addEventListener("pointermove", (e) => applyWind(e.clientX, e.clientY));
  svg.addEventListener("pointerdown", (e) => {
    applyWind(e.clientX, e.clientY);
    state.vy += 2.1;
    state.vrot += (Math.random() - 0.5) * 9;
  });
  svg.addEventListener("pointerleave", () => {
    state.targetDx = 0;
    state.targetDy = 0;
    state.targetDrot = 0;
  });

  let t = 0;
  function tick() {
    t += 0.025;
    const breezeX = Math.sin(t * 0.9) * 5 + Math.cos(t * 1.7) * 2.5;
    const breezeY = Math.cos(t * 1.1) * 4.5 + Math.sin(t * 2.1) * 1.8;
    const breezeRot = Math.sin(t * 1.3) * 4.5;

    const goalX = coastSceneState.kiteBaseX + breezeX + state.targetDx;
    const goalY = coastSceneState.kiteBaseY + breezeY + state.targetDy;
    const goalRot = -14 + breezeRot + state.targetDrot;

    const stiffness = 0.085;
    const damping = 0.84;

    state.vx = (state.vx + (goalX - state.x) * stiffness) * damping;
    state.vy = (state.vy + (goalY - state.y) * stiffness) * damping;
    state.vrot = (state.vrot + (goalRot - state.rot) * stiffness) * damping;

    state.x += state.vx;
    state.y += state.vy;
    state.rot += state.vrot;

    kiteGroup.setAttribute(
      "transform",
      `translate(${state.x.toFixed(2)}, ${state.y.toFixed(2)}) rotate(${state.rot.toFixed(2)})`
    );

    const sx = coastSceneState.spoolX;
    const sy = coastSceneState.spoolY;
    const midX = (sx + state.x) * 0.5 - 12 + breezeX * 0.6;
    const midY = (sy + state.y) * 0.5 + 18 + Math.abs(state.vy) * 2;
    kiteString.setAttribute(
      "d",
      `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${midX.toFixed(1)} ${midY.toFixed(1)} ${state.x.toFixed(1)} ${state.y.toFixed(1)}`
    );

    const tailSway = Math.sin(t * 2.8) * 4 + state.vx * 1.8;
    kiteTail.setAttribute(
      "d",
      `M0 18 Q${(-6 + tailSway * 0.5).toFixed(1)} 30 ${(-2 + tailSway).toFixed(1)} 42 Q${(4 - tailSway * 0.4).toFixed(1)} 52 ${(-3 + tailSway * 1.2).toFixed(1)} 62`
    );

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ==========================================================================
   GSAP SEAMLESS SCROLL CAMERA (Shore -> Boat -> Ocean Depths)
   ========================================================================== */
function initScrollCamera() {
  gsap.registerPlugin(ScrollTrigger);

  const stage = document.getElementById("surface-stage");
  const track = document.getElementById("coast-track");
  const scrollCue = document.getElementById("scroll-cue");
  const seaCaption = document.getElementById("sea-caption");

  // 1. Continuous Horizontal Camera Glide Across the Unified Coastline
  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: () => `+=${Math.max(900, track.scrollWidth - window.innerWidth)}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true
    }
  });

  // Gentle Fade-In of Santiago Epigraph as Camera Approaches the Boat
  gsap.fromTo(
    seaCaption,
    { opacity: 0, y: 14 },
    {
      opacity: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${Math.max(900, track.scrollWidth - window.innerWidth)}`,
        scrub: true
      }
    }
  );

  // Fade Out Surface Scroll Cue Once Diving Below
  gsap.to(scrollCue, {
    opacity: 0,
    scrollTrigger: {
      trigger: "#descent-world",
      start: "top 95%",
      end: "top 70%",
      scrub: true
    }
  });

  // 2. Ambient Skiff Rocking, Waves & Shark Circling Beneath Boat
  gsap.to("#skiff-group", {
    y: 4,
    rotation: 1.7,
    transformOrigin: "center center",
    duration: 2.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to("#waves-front, #waves-glint", {
    x: -36,
    duration: 4.4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to("#waves-back", {
    x: 28,
    duration: 5.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap
    .timeline({ repeat: -1 })
    .to("#shark-swim", { x: 85, y: 8, duration: 5.8, ease: "sine.inOut" })
    .set("#shark-swim", { scaleX: -1 })
    .to("#shark-swim", { x: -85, y: -4, duration: 5.8, ease: "sine.inOut" })
    .set("#shark-swim", { scaleX: 1 });

  // 3. Smooth Underwater Color Gradient Transitions
  // Shallow Reef (#0284C7) -> Pelagic Blue (#0369A1) -> Midnight Abyss (#0F172A) -> Seabed (#020617)
  const descent = document.getElementById("descent-world");
  gsap
    .timeline({
      scrollTrigger: {
        trigger: descent,
        start: "top 65%",
        end: "bottom bottom",
        scrub: true
      }
    })
    .fromTo(descent, { backgroundColor: "#0284C7" }, { backgroundColor: "#0369A1", duration: 1 })
    .to(descent, { backgroundColor: "#0F172A", duration: 1.2 })
    .to(descent, { backgroundColor: "#020617", duration: 1.2 });

  // 4. Floating Nav Theme & Depth Meter
  const nav = document.getElementById("site-nav");
  const depthReadout = document.getElementById("depth-readout");
  ScrollTrigger.create({
    trigger: descent,
    start: "top 80px",
    end: "bottom bottom",
    onEnter: () => nav.classList.add("is-submerged"),
    onLeaveBack: () => nav.classList.remove("is-submerged"),
    onUpdate: (self) => {
      depthReadout.textContent = `${Math.round(self.progress * 4000).toLocaleString()}m`;
    }
  });

  // 5. Sounding Line & Depth Section Reveals
  gsap.from("#sounding-line", {
    scaleY: 0,
    duration: 1.1,
    ease: "power2.out",
    scrollTrigger: { trigger: "#education", start: "top 78%", once: true }
  });

  gsap.from(".edu-milestone", {
    opacity: 0,
    y: 26,
    duration: 0.7,
    stagger: 0.16,
    ease: "power2.out",
    scrollTrigger: { trigger: ".education-list", start: "top 82%", once: true }
  });

  gsap.to(".shoal-left", {
    x: 110,
    ease: "none",
    scrollTrigger: { trigger: "#skills", start: "top bottom", end: "bottom top", scrub: 1.2 }
  });

  gsap.to(".shoal-right", {
    x: -110,
    ease: "none",
    scrollTrigger: { trigger: "#skills", start: "top bottom", end: "bottom top", scrub: 1.2 }
  });

  gsap.from(".project-card", {
    opacity: 0,
    y: 28,
    duration: 0.65,
    stagger: 0.14,
    ease: "power2.out",
    scrollTrigger: { trigger: "#projects-grid", start: "top 82%", once: true }
  });

  gsap.from(".article-card", {
    opacity: 0,
    y: 24,
    duration: 0.65,
    stagger: 0.14,
    ease: "power2.out",
    scrollTrigger: { trigger: "#articles-grid", start: "top 84%", once: true }
  });
}

/* ==========================================================================
   DISTRACTION-FREE ARTICLE READER MODAL
   ========================================================================== */
function initArticleModal(articles) {
  const modal = document.getElementById("article-modal");
  const backdrop = document.getElementById("modal-backdrop");
  const closeBtn = document.getElementById("modal-close");
  const metaEl = document.getElementById("modal-meta");
  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");
  let lastFocused = null;

  function openArticle(articleId) {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    lastFocused = document.activeElement;
    metaEl.textContent = `${article.date} · ${article.readTime}`;
    titleEl.textContent = article.title;
    bodyEl.innerHTML = article.body
      .map((block) => (block.startsWith("<blockquote") ? block : `<p>${block}</p>`))
      .join("");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.getElementById("articles-grid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-article-id]");
    if (card) openArticle(card.dataset.articleId);
  });

  document.getElementById("articles-grid").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const card = e.target.closest("[data-article-id]");
      if (card) {
        e.preventDefault();
        openArticle(card.dataset.articleId);
      }
    }
  });

  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}

/* ==========================================================================
   BOOTSTRAPPING & RESIZE SYNC
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderPortfolio(portfolioData);
  layoutCoastWorld();
  initKitePhysics();
  initScrollCamera();
  initArticleModal(portfolioData.articles);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layoutCoastWorld();
      ScrollTrigger.refresh();
    }, 120);
  });
});
