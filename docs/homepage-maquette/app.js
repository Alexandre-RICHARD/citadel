/* Maquette de la homepage : routes (dans le hash), ambiances, transitions, intro, thème et variantes. */
(function () {
	"use strict";

	const M = window.MOCK;
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));

	const app = $("#app");
	const stage = $("#stage");
	const main = $("#main");
	const showcase = $("#showcase");
	const pageView = $("#page");
	const host = $("#presentHost");
	const fake = $("#fakeProject");
	const tip = $("#loadingTip");

	const IRIGO_LINES = ["#312783", "#94499a", "#009fe3", "#c3d600", "#ffe600", "#f39200", "#e30613"];

	const SVG = (body) =>
		`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
	const ICON = {
		sun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
		moon: SVG('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
		arrowRight: SVG('<path d="M5 12h14M13 6l6 6-6 6"/>'),
		arrowLeft: SVG('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
		lock: SVG('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
		user: SVG('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
		logout: SVG('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
	};

	// ---------- Stockage, toujours protégé (navigation privée, stockage bloqué) ----------

	function safeStorage(area) {
		return {
			get(k) {
				try {
					return window[area].getItem(k);
				} catch {
					return null;
				}
			},
			set(k, v) {
				try {
					window[area].setItem(k, v);
				} catch {}
			},
			del(k) {
				try {
					window[area].removeItem(k);
				} catch {}
			},
		};
	}
	const local = safeStorage("localStorage");
	const session = safeStorage("sessionStorage");

	// ---------- Variantes de la maquette ----------

	const VARIANTS_KEY = "maquette:variants";
	const variants = {
		slowLoad: false,
		many: false,
		logged: false,
		phone: false,
		reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
	};
	try {
		const saved = JSON.parse(local.get(VARIANTS_KEY) || "{}");
		for (const k of Object.keys(variants)) if (k in saved) variants[k] = saved[k];
	} catch {}

	// ---------- Thème : la préférence du système, sauf choix contraire enregistré ----------

	const darkQuery = matchMedia("(prefers-color-scheme: dark)");
	const THEME_KEY = "citadel:homepage:theme";
	const systemTheme = () => (darkQuery.matches ? "dark" : "light");
	let theme = local.get(THEME_KEY);
	if (theme !== "dark" && theme !== "light") theme = systemTheme();

	// ---------- Fonds, logo, roue, transitions ----------

	// Sans WebGL, des halos flous en CSS remplacent la lampe à lave
	const lava = Lava.create($("#lava"));
	if (!lava) app.classList.add("bg-css");
	const overlays = Overlays.create($("#overlayBack"), $("#overlayFront"));
	const transitions = Transitions.create($("#transition"));

	// Le logo hexagonal : 6 barres qui dépassent chacune d'un sommet, et un « A » dessiné, centré sur l'hexagone
	function buildLogo(svg) {
		const s = 7;
		const B = 1.45;
		const L = s + 2.5;
		const V = Array.from({ length: 6 }, (_, k) => [s * Math.cos((Math.PI / 3) * k), s * Math.sin((Math.PI / 3) * k)]);
		let html = "";
		for (let k = 0; k < 6; k++) {
			const [x1, y1] = V[k];
			const [x2, y2] = V[(k + 1) % 6];
			const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
			const pts = [[0, -B / 2], [L, -B / 2], [L + B / 2, 0], [L, B / 2], [0, B / 2]]
				.map((p) => p.map((n) => n.toFixed(3)).join(","))
				.join(" ");
			html += `<g transform="translate(${x1.toFixed(3)} ${y1.toFixed(3)}) rotate(${ang.toFixed(2)})"><polygon class="logo-bar" points="${pts}"/></g>`;
		}
		html +=
			'<path class="logo-a" fill-rule="evenodd" d="M-0.75 -3.5H0.75L3.3 3.5H1.8L1.254 2H-1.254L-1.8 3.5H-3.3Z M0 -1.44L0.798 0.75H-0.798Z"/>';
		svg.setAttribute("viewBox", "-10.5 -10.5 21 21");
		svg.innerHTML = html;
	}
	buildLogo($("#headerLogo"));
	buildLogo($("#introLogo"));

	function projectList() {
		return variants.many ? M.projects.concat(M.fakeProjects) : M.projects;
	}

	function go(slug) {
		const h = `#/${slug}`;
		if (location.hash !== h) location.hash = h;
	}

	const wheel = new Wheel($("#wheel"), {
		onSelect: (p) => go(p.slug),
		onClear: () => go(""),
	});

	// ---------- Ambiances ----------

	let ambKey = null;
	let fontsKey = null;

	function setColors(key, dur) {
		const a = M.ambiances[key];
		const p = a[theme];
		app.style.setProperty("--dur", `${dur}s`);
		const vars = {
			"--bg": p.bg,
			"--text": p.text,
			"--muted": p.muted,
			"--accent": p.accent,
			"--accent-text": p.accentText,
			"--surface": p.surface,
			"--line": p.line,
			"--b1": p.blobs[0],
			"--b2": p.blobs[1],
			"--b3": p.blobs[2],
			"--b4": p.blobs[3],
			"--radius": `${a.radius}px`,
			"--cut": `${a.cut}px`,
			"--weight": String(a.weight),
			"--tracking": String(a.tracking),
		};
		for (const [k, v] of Object.entries(vars)) app.style.setProperty(k, v);
		if (lava) lava.setPalette(p.blobs, dur, theme === "dark");
		overlays.set(a.overlay, p, theme === "dark");
	}

	function setFonts(key) {
		const a = M.ambiances[key];
		fontsKey = a.fonts.display + a.fonts.body;
		app.style.setProperty("--font-display", a.fonts.display);
		app.style.setProperty("--font-body", a.fonts.body);
		app.style.setProperty("--title-case", a.titleCase);
	}

	// Les couleurs glissent en quelques secondes ; les polices, elles, changent pendant un bref fondu
	function changeAmbiance(key, { instant = false } = {}) {
		if (key === ambKey && !instant) return;
		ambKey = key;
		setColors(key, instant ? 0.01 : variants.reduced ? 0.6 : 2.4);
		const a = M.ambiances[key];
		const els = $$("[data-reskin]", app);
		if (instant || fontsKey === a.fonts.display + a.fonts.body) {
			if (instant) {
				gsap.killTweensOf(els);
				gsap.set(els, { opacity: 1 });
				setFonts(key);
			}
			return;
		}
		gsap.to(els, {
			opacity: 0,
			duration: 0.18,
			ease: "power1.in",
			overwrite: true,
			onComplete() {
				setFonts(ambKey);
				gsap.to($$("[data-reskin]", app), { opacity: 1, duration: 0.4, ease: "power1.out", overwrite: true });
			},
		});
	}

	// ---------- Contenu ----------

	function el(html) {
		const t = document.createElement("template");
		t.innerHTML = html.trim();
		return t.content.firstElementChild;
	}

	function buildWelcome() {
		const w = M.welcome;
		return el(`
			<article class="panel panel-welcome">
				<p class="kicker" data-anim>${w.kicker}</p>
				<h1 class="title" data-anim>${w.title}</h1>
				<p class="lead" data-anim>${w.lead}</p>
				<p class="hint" data-anim><span class="hint-arrow">${ICON.arrowLeft}</span>${w.hint}</p>
			</article>`);
	}

	function buildProject(p) {
		const facts = p.facts
			.map((f) => `<section class="fact" data-anim><h2>${f.title}</h2><p>${f.text}</p></section>`)
			.join("");
		return el(`
			<article class="panel panel-project">
				<div class="panel-head">
					<div>
						<p class="kicker" data-anim>${p.kicker}</p>
						<h1 class="title" data-anim>${p.name}</h1>
					</div>
					${p.illustration ? `<img class="illus" data-anim src="${p.illustration}" alt="">` : ""}
				</div>
				<p class="lead" data-anim>${p.lead}</p>
				<div class="facts">${facts}</div>
				<div class="actions" data-anim>
					<a class="btn btn-primary" href="${p.path}" data-go="${p.slug}">Y accéder ${ICON.arrowRight}</a>
					${p.requiresAuth ? `<span class="badge">${ICON.lock} Connexion requise</span>` : ""}
				</div>
			</article>`);
	}

	let lastShowcase = "";

	function buildPage(pg) {
		const sections = pg.sections
			.map((s) => `<section><h2>${s.title}</h2>${s.paras.map((x) => `<p>${x}</p>`).join("")}</section>`)
			.join("");
		return el(`
			<article class="page">
				<a class="back" href="#/${lastShowcase}">${ICON.arrowLeft} Projets</a>
				<h1 class="page-title">${pg.title}</h1>
				<p class="page-intro">${pg.intro}</p>
				${sections}
			</article>`);
	}

	// La fausse page du projet : des squelettes dans son ambiance, pour voir la transition se terminer dessus
	function buildFakePage(p) {
		const sk = (w, cls = "") => `<span class="sk ${cls}" style="width:${w}%"></span>`;
		const list = (n) => Array.from({ length: n }, (_, i) => sk(45 + ((i * 23) % 50))).join("");
		let body = "";
		if (p.screen === "table") {
			body = Array.from(
				{ length: 12 },
				(_, i) => `<div class="fp-row sk-box"><span class="sk"></span>${sk(55 + ((i * 13) % 40))}${sk(70)}${sk(50)}${sk(80)}${sk(60)}</div>`,
			).join("");
		} else if (p.screen === "map") {
			const dots = Array.from(
				{ length: 16 },
				(_, i) => `<i style="left:${((i * 37) % 92) + 3}%;top:${((i * 53) % 86) + 6}%;background:${IRIGO_LINES[i % 7]}"></i>`,
			).join("");
			body = `<div class="fp-split"><div class="fp-map sk-box">${dots}</div><div class="fp-list sk-box">${list(9)}</div></div>`;
		} else if (p.screen === "grid") {
			const tiles = Array.from({ length: 18 }, () => '<span class="sk-box"></span>').join("");
			body = `<div class="fp-split fp-split-left"><div class="fp-list sk-box">${list(10)}</div><div class="fp-grid sk-box">${tiles}</div></div>`;
		} else {
			body = `<div class="fp-cards">${Array.from(
				{ length: 6 },
				(_, i) => `<div class="fp-card sk-box">${sk(50 + ((i * 17) % 40))}${sk(50, "big")}${sk(85)}${sk(65)}</div>`,
			).join("")}</div>`;
		}
		return `
			<header class="fp-header">
				${p.illustration ? `<img src="${p.illustration}" alt="">` : ""}
				<strong>${p.name}</strong>
				<span class="fp-tag">Page factice de la maquette</span>
				<button class="btn" type="button" data-home>${ICON.arrowLeft} Homepage</button>
			</header>
			<div class="fp-body">${body}</div>`;
	}

	// ---------- Présentation : sortie fantôme, puis entrée en cascade ----------

	let live = null;
	let pendingEnter = null;
	let ghosts = 0;

	// Chaque bloc ondule, descend en se balançant comme une feuille qui tombe, et s'efface
	function ghostOut(panel, { fast }) {
		ghosts++;
		panel.classList.add("is-ghost");
		panel.setAttribute("aria-hidden", "true");
		// Le fantôme garde les polices de l'ambiance qu'il quitte
		const cs = getComputedStyle(app);
		for (const k of ["--font-display", "--font-body", "--title-case"]) {
			panel.style.setProperty(k, cs.getPropertyValue(k));
		}
		const blocks = $$("[data-anim]", panel);
		gsap.killTweensOf(blocks);
		gsap.set(blocks, { clearProps: "clipPath" });
		const tl = gsap.timeline({
			onComplete() {
				panel.remove();
				ghosts--;
			},
		});
		if (variants.reduced) {
			tl.to(blocks, { opacity: 0, duration: 0.25 });
			return tl;
		}
		blocks.forEach((b, i) => {
			const d = 1.2 + Math.random() * 0.6;
			const at = i * 0.08 + Math.random() * 0.06;
			const dir = Math.random() < 0.5 ? -1 : 1;
			const sway = 10 + Math.random() * 14;
			tl.to(b, { y: `+=${60 + Math.random() * 70}`, opacity: 0, duration: d, ease: "sine.in" }, at);
			tl.to(
				b,
				{
					keyframes: {
						x: [0, dir * sway, -dir * sway * 0.7, dir * sway * 0.45],
						rotation: [0, dir * 5, -dir * 3.5, dir * 2],
						easeEach: "sine.inOut",
					},
					duration: d,
					ease: "none",
				},
				at,
			);
			tl.to(b, { filter: "blur(2.5px)", duration: d * 0.7, ease: "power1.in" }, at + d * 0.3);
		});
		if (fast) tl.timeScale(2.2);
		return tl;
	}

	function enter(panel) {
		const parts = $$("[data-anim]", panel);
		if (variants.reduced) {
			gsap.to(parts, { opacity: 1, duration: 0.3 });
			return;
		}
		gsap.fromTo(parts, { x: -36, opacity: 0 }, { x: 0, opacity: 1, duration: 0.95, ease: "power3.out", stagger: 0.09 });
		gsap.fromTo(
			$(".title", panel),
			{ clipPath: "inset(-20% 100% -20% 0%)" },
			{ clipPath: "inset(-20% -10% -20% 0%)", duration: 1.1, ease: "power3.inOut" },
		);
		const img = $(".illus", panel);
		if (img) gsap.fromTo(img, { scale: 0.8, rotation: -8 }, { scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)" });
	}

	// Un clic pendant une transition l'accélère et enchaîne la suivante
	function showPanel(build) {
		let delay = 0;
		if (pendingEnter) {
			pendingEnter.kill();
			pendingEnter = null;
			if (live && !live.dataset.entered) {
				live.remove();
				live = null;
			}
		}
		if (live) {
			ghostOut(live, { fast: ghosts > 0 });
			delay = variants.reduced ? 0.2 : ghosts > 1 ? 0.35 : 0.9;
			live = null;
		} else if (ghosts > 0) {
			delay = 0.35;
		}
		const panel = build();
		host.appendChild(panel);
		gsap.set($$("[data-anim]", panel), { opacity: 0 });
		live = panel;
		pendingEnter = gsap.delayedCall(delay, () => {
			pendingEnter = null;
			panel.dataset.entered = "1";
			enter(panel);
		});
	}

	// ---------- Vues : présentation des projets, ou page du footer ----------

	let view = "showcase";
	function setView(name) {
		if (view === name) return;
		view = name;
		const out = name === "page" ? showcase : pageView;
		const inn = name === "page" ? pageView : showcase;
		const dur = variants.reduced ? 0.15 : 0.3;
		gsap.killTweensOf([showcase, pageView]);
		gsap.to(out, {
			opacity: 0,
			y: name === "page" ? -10 : 10,
			duration: dur,
			ease: "power1.in",
			onComplete() {
				out.hidden = true;
				inn.hidden = false;
				main.scrollTop = 0;
				wheel.relayout();
				gsap.fromTo(inn, { opacity: 0, y: name === "page" ? 16 : -16 }, { opacity: 1, y: 0, duration: dur * 1.7, ease: "power3.out" });
			},
		});
	}

	// ---------- Routes ----------

	let panelId = null;

	function route() {
		const slug = location.hash.replace(/^#\/?/, "");
		const page = M.pages.find((p) => p.slug === slug);
		if (page) {
			wheel.setSelected(null);
			pageView.replaceChildren(buildPage(page));
			setView("page");
			changeAmbiance("citadel");
			document.title = `${page.title} · La Citadel d'Alex`;
			return;
		}
		const project = projectList().find((p) => p.slug === slug) || null;
		lastShowcase = project ? project.slug : "";
		setView("showcase");
		wheel.setSelected(project ? project.slug : null);
		const want = project ? project.slug : "welcome";
		if (want !== panelId) {
			panelId = want;
			showPanel(() => (project ? buildProject(project) : buildWelcome()));
		}
		changeAmbiance(project ? project.ambiance : "citadel");
		document.title = project ? `${project.name} · La Citadel d'Alex` : "La Citadel d'Alex";
	}

	// Échap ferme les pages du footer et revient à la présentation d'où l'on venait
	window.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && view === "page" && fake.hidden) {
			e.preventDefault();
			go(lastShowcase);
		}
	});

	// ---------- Transition vers un projet ----------

	let busy = false;

	function centerOf(node) {
		const r = node.getBoundingClientRect();
		const a = app.getBoundingClientRect();
		return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top };
	}

	function showTip(p) {
		tip.innerHTML = `<small>Chargement</small><strong>${p.name}</strong><p><b>Astuce :</b> ${p.tip}</p>`;
		gsap.fromTo(tip, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
	}

	function hideTip() {
		return new Promise((resolve) => gsap.to(tip, { opacity: 0, y: -8, duration: 0.25, ease: "power1.in", onComplete: resolve }));
	}

	// Au-delà de ce délai après que l'écran est couvert, le chargement traîne : on montre l'astuce,
	// et on la laisse au moins le temps d'être lue
	const TIP_AFTER = 300;
	const TIP_MIN = 1400;

	// Le chargement du projet part dès le clic, pendant que l'écran se couvre
	// (dans le site : l'import du projet, lancé en avance). Durée simulée selon la variante
	function loadProject() {
		return wait(variants.slowLoad ? 2500 : 150);
	}

	// La page n'est affichée qu'une fois l'écran couvert (dans le site : la navigation vers le projet)
	function mountProject(p) {
		fake.innerHTML = buildFakePage(p);
		gsap.set(fake, { opacity: 1 });
		fake.hidden = false;
	}

	// L'écran se couvre, puis se découvre sur la page déjà prête ; l'astuce seulement si le chargement traîne
	async function launchProject(p, from) {
		if (busy) return;
		busy = true;
		const a = M.ambiances[p.ambiance];
		fake.dataset.slug = p.slug;
		const load = loadProject();
		if (variants.reduced) {
			await load;
			mountProject(p);
			await gsap.fromTo(fake, { opacity: 0 }, { opacity: 1, duration: 0.3 });
			busy = false;
			return;
		}
		let loaded = false;
		load.then(() => (loaded = true));
		await transitions.cover(a.transition, a[theme], theme === "dark", centerOf(from));
		if (!loaded) {
			const slow = await Promise.race([load.then(() => false), wait(TIP_AFTER).then(() => true)]);
			if (slow) {
				showTip(p);
				await Promise.all([load, wait(TIP_MIN)]);
				await hideTip();
			}
		}
		mountProject(p);
		await transitions.reveal();
		busy = false;
	}

	async function returnHome(from) {
		if (busy) return;
		busy = true;
		const p = projectList().find((x) => x.slug === fake.dataset.slug);
		const a = M.ambiances[p ? p.ambiance : "citadel"];
		if (variants.reduced) {
			await gsap.to(fake, { opacity: 0, duration: 0.3 });
			fake.hidden = true;
			busy = false;
			return;
		}
		await transitions.cover(a.transition, a[theme], theme === "dark", centerOf(from));
		fake.hidden = true;
		wheel.relayout();
		await transitions.reveal();
		busy = false;
	}

	// ---------- Header ----------

	function renderThemeButton() {
		const btn = $("#themeToggle");
		const next = theme === "dark" ? "clair" : "sombre";
		btn.innerHTML = theme === "dark" ? ICON.moon : ICON.sun;
		btn.setAttribute("aria-label", `Passer au thème ${next}`);
		btn.title = `Passer au thème ${next}`;
	}

	function applyTheme(dur) {
		app.dataset.theme = theme;
		renderThemeButton();
		setColors(ambKey, dur);
	}

	// Le choix n'est enregistré que s'il diffère du système : revenir au thème du système l'efface
	$("#themeToggle").addEventListener("click", () => {
		theme = theme === "dark" ? "light" : "dark";
		if (theme === systemTheme()) local.del(THEME_KEY);
		else local.set(THEME_KEY, theme);
		applyTheme(variants.reduced ? 0.2 : 0.7);
	});

	darkQuery.addEventListener("change", () => {
		if (local.get(THEME_KEY)) return;
		theme = systemTheme();
		applyTheme(0.7);
	});

	function renderAccount() {
		$("#account").innerHTML = variants.logged
			? `<span class="user">${ICON.user}<span data-reskin>Alex</span></span>
				<button class="icon-btn" type="button" data-logout aria-label="Se déconnecter" title="Se déconnecter">${ICON.logout}</button>`
			: `<button class="btn" type="button" data-login aria-disabled="true" title="La connexion arrive bientôt"><span data-reskin>Se connecter</span></button>`;
	}

	// ---------- Petite notification ----------

	function toast(msg) {
		const t = $("#toast");
		t.textContent = msg;
		gsap.killTweensOf(t);
		gsap.fromTo(t, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
		gsap.to(t, { opacity: 0, delay: 2.4, duration: 0.4 });
	}

	app.addEventListener("click", (e) => {
		const goBtn = e.target.closest("[data-go]");
		const homeBtn = e.target.closest("[data-home]");
		if (goBtn) {
			e.preventDefault();
			const p = projectList().find((x) => x.slug === goBtn.dataset.go);
			if (p) launchProject(p, goBtn);
		} else if (homeBtn) {
			returnHome(homeBtn);
		} else if (e.target.closest("[data-login]")) {
			toast("La connexion arrive bientôt");
		} else if (e.target.closest("[data-logout]")) {
			toast("Maquette : déconnexion factice");
		}
	});

	// ---------- Intro : le logo se dessine, puis rejoint le header. Une touche ou un clic la passe ----------

	let routed = false;

	function revealUi(animated) {
		if (!routed) {
			routed = true;
			route();
		}
		if (!animated) return;
		gsap.fromTo(".brand-name", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" });
		gsap.fromTo(".header-actions", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: "power3.out" });
		gsap.fromTo("#wheel", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" });
		gsap.fromTo("#present", { opacity: 0 }, { opacity: 1, duration: 0.4 });
		gsap.fromTo(".footer", { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3 });
	}

	function runIntro(force) {
		const intro = $("#intro");
		const introLogo = $("#introLogo");
		const headerLogo = $("#headerLogo");
		if (!force && (session.get("citadel:homepage:intro") || variants.reduced)) {
			revealUi(false);
			return;
		}
		intro.hidden = false;
		headerLogo.style.visibility = "hidden";
		gsap.set($(".intro-bg"), { opacity: 1 });
		gsap.set(introLogo, { x: 0, y: 0, scale: 1 });
		gsap.set(".brand-name, .header-actions, #wheel, #present, .footer", { opacity: 0 });
		const bars = $$(".logo-bar", introLogo);
		const letter = $(".logo-a", introLogo);
		gsap.set(bars, { scaleX: 0, transformOrigin: "0% 50%" });
		gsap.set(letter, { scale: 0, transformOrigin: "50% 50%" });

		let flip = null;
		function measure() {
			if (flip) return flip;
			const a = introLogo.getBoundingClientRect();
			const b = headerLogo.getBoundingClientRect();
			flip = {
				x: b.left + b.width / 2 - (a.left + a.width / 2),
				y: b.top + b.height / 2 - (a.top + a.height / 2),
				k: b.width / a.width,
			};
			return flip;
		}

		const tl = gsap.timeline();
		tl.to(bars, { scaleX: 1, duration: 0.26, ease: "power1.in", stagger: 0.17 })
			.to(letter, { scale: 1, duration: 0.24, ease: "power2.out" }, 1.19)
			.to(letter, {
				keyframes: [
					{ scaleX: 0.75, scaleY: 1.25, duration: 0.16 },
					{ scaleX: 1.25, scaleY: 0.75, duration: 0.06 },
					{ scaleX: 0.85, scaleY: 1.15, duration: 0.06 },
					{ scaleX: 1.05, scaleY: 0.95, duration: 0.08 },
					{ scaleX: 0.95, scaleY: 1.05, duration: 0.07 },
					{ scaleX: 1, scaleY: 1, duration: 0.13 },
				],
			})
			.addLabel("fly", "+=0.2")
			.to(introLogo, { x: () => measure().x, y: () => measure().y, scale: () => measure().k, duration: 0.65, ease: "power3.inOut" }, "fly")
			.to($(".intro-bg"), { opacity: 0, duration: 0.55, ease: "power1.inOut" }, "fly+=0.1")
			.add(() => revealUi(true), "fly+=0.3")
			.add(() => {
				headerLogo.style.visibility = "";
				intro.hidden = true;
				session.set("citadel:homepage:intro", "1");
				off();
			}, "fly+=0.65");

		// N'importe quelle touche qui n'est pas un raccourci, ou un clic, passe l'intro
		function skip(e) {
			if (
				e.type === "keydown" &&
				(e.ctrlKey || e.metaKey || e.altKey || ["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "F5", "F11", "F12"].includes(e.key))
			) {
				return;
			}
			if (tl.time() < tl.labels.fly) tl.seek("fly");
			tl.timeScale(1.6);
			off();
		}
		function off() {
			window.removeEventListener("keydown", skip, true);
			window.removeEventListener("pointerdown", skip, true);
		}
		window.addEventListener("keydown", skip, true);
		window.addEventListener("pointerdown", skip, true);
	}

	// ---------- Panneau des variantes ----------

	const DEFS = [
		{ key: "slowLoad", label: "Chargement d’un projet (simulé)", options: [[false, "Rapide"], [true, "Lent"]] },
		{ key: "many", label: "Projets", options: [[false, "Les 4 vrais"], [true, "+ 8 fictifs"]] },
		{ key: "logged", label: "Compte", options: [[false, "Déconnecté"], [true, "Connecté"]] },
		{ key: "phone", label: "Affichage", options: [[false, "Écran"], [true, "Téléphone"]] },
		{ key: "reduced", label: "Animations réduites", options: [[false, "Non"], [true, "Oui"]] },
	];

	function applyVariant(key) {
		switch (key) {
			case "slowLoad":
				break;
			case "many": {
				wheel.setItems(projectList());
				const slug = location.hash.replace(/^#\/?/, "");
				if (slug.startsWith("fictif-") && !variants.many) go("");
				break;
			}
			case "logged":
				renderAccount();
				break;
			case "phone":
				stage.classList.toggle("is-phone", variants.phone);
				break;
			case "reduced":
				// Animations réduites : lampe à lave figée, pas de fond animé de projet, de simples fondus
				app.classList.toggle("is-reduced", variants.reduced);
				if (lava) lava.setReduced(variants.reduced);
				overlays.setEnabled(!variants.reduced);
				wheel.reduced = variants.reduced;
				break;
		}
	}

	function buildVariantsPanel() {
		const body = $("#variantsBody");
		body.innerHTML =
			DEFS.map(
				(d) => `
				<div class="variants-row">
					<span>${d.label}</span>
					<div class="seg">${d.options
						.map(([v, l]) => `<button type="button" data-key="${d.key}" data-value='${JSON.stringify(v)}' aria-pressed="${variants[d.key] === v}">${l}</button>`)
						.join("")}</div>
				</div>`,
			).join("") + '<button class="variants-action" type="button" data-replay>Rejouer l’intro</button>';
		body.addEventListener("click", (e) => {
			const b = e.target.closest("button");
			if (!b) return;
			if (b.hasAttribute("data-replay")) {
				session.del("citadel:homepage:intro");
				runIntro(true);
				return;
			}
			const key = b.dataset.key;
			variants[key] = JSON.parse(b.dataset.value);
			local.set(VARIANTS_KEY, JSON.stringify(variants));
			$$(`button[data-key="${key}"]`, body).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
			applyVariant(key);
		});
		$("#variantsToggle").addEventListener("click", (e) => {
			const open = body.hidden;
			body.hidden = !open;
			e.currentTarget.setAttribute("aria-expanded", String(open));
		});
	}

	// ---------- Démarrage ----------

	new ResizeObserver(() => {
		const narrow = app.clientWidth <= 720;
		wheel.setOrientation(narrow ? "horizontal" : "vertical");
		wheel.relayout();
		if (lava) {
			lava.setNarrow(narrow);
			lava.resize();
		}
		overlays.resize();
	}).observe(app);

	app.dataset.theme = theme;
	const firstSlug = location.hash.replace(/^#\/?/, "");
	const firstProject = projectList().find((p) => p.slug === firstSlug);
	changeAmbiance(firstProject ? firstProject.ambiance : "citadel", { instant: true });

	renderThemeButton();
	renderAccount();
	buildVariantsPanel();
	for (const d of DEFS) if (d.key !== "many") applyVariant(d.key);
	wheel.setItems(projectList());

	window.addEventListener("hashchange", () => {
		if (routed) route();
	});

	runIntro(false);
})();
