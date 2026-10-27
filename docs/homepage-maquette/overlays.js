/* Fonds animés propres à chaque projet, en fondu enchaîné. Deux calques : derrière les blobs de la
   lampe à lave, et devant pour les braises de Game Death Counter, les seules qui flottent dans l’air. */
(function () {
	"use strict";

	const TAU = Math.PI * 2;

	function rand(a, b) {
		return a + Math.random() * (b - a);
	}

	function rgba(hex, a) {
		const n = parseInt(hex.slice(1), 16);
		return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
	}

	const kinds = {
		// Game Death Counter : des braises qui montent en se balançant
		embers() {
			const ps = [];
			let acc = 0;
			return {
				draw(ctx, w, h, dt, t, pal, dark) {
					acc += dt * Math.max(8, (w / 1440) * 24);
					while (acc > 1 && ps.length < 120) {
						acc -= 1;
						ps.push({
							x: rand(0.2, 1) * w,
							y: h + 10,
							vy: rand(18, 48),
							life: rand(5, 10),
							age: 0,
							s: rand(0.8, 2.4),
							sa: rand(6, 22),
							sw: rand(0.4, 1.3),
							ph: rand(0, TAU),
							hot: Math.random() > 0.6,
						});
					}
					ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
					for (let i = ps.length - 1; i >= 0; i--) {
						const p = ps[i];
						p.age += dt;
						p.y -= p.vy * dt;
						if (p.age > p.life || p.y < -20) {
							ps.splice(i, 1);
							continue;
						}
						const fade = Math.min(1, p.age * 2) * (1 - p.age / p.life);
						const flick = 0.6 + 0.4 * Math.sin(t * 9 + p.ph * 3);
						const x = p.x + Math.sin(t * p.sw + p.ph) * p.sa;
						const col = p.hot ? "#ffd27a" : dark ? "#ff8a2a" : "#d9480f";
						ctx.fillStyle = rgba(col, 0.12 * fade * flick);
						ctx.beginPath();
						ctx.arc(x, p.y, p.s * 4, 0, TAU);
						ctx.fill();
						ctx.fillStyle = rgba(col, 0.9 * fade * flick);
						ctx.beginPath();
						ctx.arc(x, p.y, p.s, 0, TAU);
						ctx.fill();
					}
				},
			};
		},

		// Backlog : des formes au trait qui flottent (cercle, carré, triangle, coche)
		shapes() {
			let items = null;
			function init(w, h) {
				items = Array.from({ length: 14 }, () => ({
					x: rand(0.68, 1) * w,
					y: rand(0, h),
					s: rand(9, 22),
					vy: rand(6, 14),
					r: rand(0, TAU),
					vr: rand(-0.25, 0.25),
					k: Math.floor(rand(0, 4)),
					accent: Math.random() < 0.3,
				}));
			}
			return {
				resize: init,
				draw(ctx, w, h, dt, t, pal) {
					if (!items) init(w, h);
					ctx.lineWidth = 2.2;
					ctx.lineJoin = "round";
					ctx.lineCap = "round";
					for (const it of items) {
						it.y -= it.vy * dt;
						it.r += it.vr * dt;
						if (it.y < -40) {
							it.y = h + 40;
							it.x = rand(0.68, 1) * w;
						}
						const s = it.s;
						ctx.save();
						ctx.translate(it.x, it.y);
						ctx.rotate(it.r);
						ctx.strokeStyle = it.accent ? rgba(pal.accent, 0.55) : rgba(pal.text, 0.18);
						ctx.beginPath();
						if (it.k === 0) ctx.arc(0, 0, s, 0, TAU);
						else if (it.k === 1) ctx.roundRect(-s, -s, 2 * s, 2 * s, s * 0.35);
						else if (it.k === 2) {
							ctx.moveTo(0, -s);
							ctx.lineTo(s * 0.95, s * 0.7);
							ctx.lineTo(-s * 0.95, s * 0.7);
							ctx.closePath();
						} else {
							ctx.moveTo(-s, 0);
							ctx.lineTo(-s * 0.3, s * 0.7);
							ctx.lineTo(s, -s * 0.6);
						}
						ctx.stroke();
						ctx.restore();
					}
				},
			};
		},

		// Angers Irigo : les couleurs des lignes, en bandes arrondies qui glissent en diagonale
		stripes() {
			const cols = ["#312783", "#94499a", "#009fe3", "#c3d600", "#ffe600", "#f39200", "#e30613"];
			const a = (62 * Math.PI) / 180;
			const ux = Math.cos(a);
			const uy = -Math.sin(a);
			let st = null;
			// Les bandes montent vers la droite : on les fait partir assez à gauche pour qu'elles croisent
			// l'écran à mi-hauteur vers 80 % de la largeur (55 % sur téléphone, où l'écran est étroit et haut)
			function init(w, h) {
				const narrow = w <= 720;
				const gap = narrow ? 24 : Math.max(30, w * 0.03);
				const x0 = w * (narrow ? 0.55 : 0.8) - (h / 2) * (ux / Math.sin(a)) - (gap * cols.length) / 2;
				st = [];
				cols.forEach((c, j) => {
					const len = rand(120, 260);
					const v = rand(16, 28);
					const s0 = rand(0, 1000);
					// Deux « rames » par voie, décalées
					st.push({ c, x: x0 + j * gap, len, v, s: s0 });
					st.push({ c, x: x0 + j * gap, len: len * 0.6, v, s: s0 + 700 });
				});
			}
			return {
				resize: init,
				draw(ctx, w, h, dt, t, pal, dark) {
					if (!st) init(w, h);
					ctx.lineCap = "round";
					ctx.lineWidth = Math.max(9, w * 0.01);
					const span = h / Math.sin(a);
					for (const s of st) {
						s.s += s.v * dt;
						const T = span + s.len + 900;
						const d = (s.s % T) - s.len - 50;
						ctx.strokeStyle = rgba(s.c, dark ? 0.5 : 0.6);
						ctx.beginPath();
						ctx.moveTo(s.x + ux * d, h + uy * d);
						ctx.lineTo(s.x + ux * (d + s.len), h + uy * (d + s.len));
						ctx.stroke();
					}
				},
			};
		},

		// Satisfactory : une grille hexagonale, une ligne de balayage et des cases qui s'allument
		hexgrid() {
			const R = 30;
			let off = null;
			let cells = [];
			let W = 0;
			let H = 0;
			let lastPal = null;
			let pulses = [];
			let next = 0;
			function hexPath(c, x, y, r) {
				for (let i = 0; i < 6; i++) {
					const an = (Math.PI / 3) * i;
					const px = x + r * Math.cos(an);
					const py = y + r * Math.sin(an);
					if (i) c.lineTo(px, py);
					else c.moveTo(px, py);
				}
				c.closePath();
			}
			function build(w, h, pal) {
				W = w;
				H = h;
				lastPal = pal;
				off = document.createElement("canvas");
				off.width = Math.max(1, w);
				off.height = Math.max(1, h);
				const c = off.getContext("2d");
				const hw = R * 1.5;
				const vh = R * Math.sqrt(3);
				cells = [];
				for (let col = -1; col * hw < w + R; col++) {
					for (let row = -1; row * vh < h + R; row++) {
						cells.push([col * hw, row * vh + (col % 2 ? vh / 2 : 0)]);
					}
				}
				c.strokeStyle = rgba(pal.text, 0.07);
				c.lineWidth = 1;
				c.beginPath();
				for (const [x, y] of cells) hexPath(c, x, y, R - 2);
				c.stroke();
			}
			return {
				resize() {
					W = 0;
				},
				draw(ctx, w, h, dt, t, pal) {
					if (w !== W || h !== H || pal !== lastPal) build(w, h, pal);
					ctx.drawImage(off, 0, 0, w, h);
					const band = ((t * 45) % (h + 400)) - 200;
					ctx.lineWidth = 1.5;
					for (const [x, y] of cells) {
						const dy = Math.abs(y - band);
						if (dy > 110) continue;
						ctx.strokeStyle = rgba(pal.text, 0.28 * (1 - dy / 110));
						ctx.beginPath();
						hexPath(ctx, x, y, R - 2);
						ctx.stroke();
					}
					if (t > next) {
						next = t + rand(0.15, 0.45);
						pulses.push({ c: cells[Math.floor(rand(0, cells.length))], t0: t });
					}
					pulses = pulses.filter((p) => t - p.t0 < 2.5);
					for (const p of pulses) {
						ctx.fillStyle = rgba(pal.accent, 0.26 * (1 - (t - p.t0) / 2.5));
						ctx.beginPath();
						hexPath(ctx, p.c[0], p.c[1], R - 4);
						ctx.fill();
					}
				},
			};
		},
	};

	const FRONT = new Set(["embers"]);

	function create(backCanvas, frontCanvas) {
		const back = backCanvas.getContext("2d");
		const front = frontCanvas.getContext("2d");
		let layers = [];
		let w = 0;
		let h = 0;
		let dpr = 1;
		let last = performance.now();
		let t = 0;
		let enabled = true;

		function resize() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = backCanvas.clientWidth;
			h = backCanvas.clientHeight;
			for (const c of [backCanvas, frontCanvas]) {
				c.width = Math.max(1, Math.round(w * dpr));
				c.height = Math.max(1, Math.round(h * dpr));
			}
			for (const l of layers) l.inst.resize && l.inst.resize(w, h);
		}

		function frame(now) {
			requestAnimationFrame(frame);
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			if (document.hidden) return;
			t += dt;
			for (const ctx of [back, front]) {
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				ctx.clearRect(0, 0, w, h);
			}
			if (!enabled) return;
			// Fondu enchaîné d'un fond à l'autre, en 1,2 s
			layers = layers.filter((l) => {
				l.a = Math.max(0, Math.min(1, l.a + (Math.sign(l.target - l.a) * dt) / 1.2));
				return !(l.target === 0 && l.a <= 0);
			});
			for (const l of layers) {
				const ctx = FRONT.has(l.kind) ? front : back;
				ctx.save();
				ctx.globalAlpha = l.a;
				l.inst.draw(ctx, w, h, dt, t, l.pal, l.dark);
				ctx.restore();
			}
		}

		resize();
		requestAnimationFrame(frame);

		return {
			set(kind, pal, dark) {
				let found = false;
				for (const l of layers) {
					if (kind && l.kind === kind) {
						l.target = 1;
						l.pal = pal;
						l.dark = dark;
						found = true;
					} else {
						l.target = 0;
					}
				}
				if (kind && !found) {
					const inst = kinds[kind]();
					inst.resize && inst.resize(w, h);
					layers.push({ kind, inst, a: 0, target: 1, pal, dark });
				}
			},
			setEnabled(v) {
				enabled = v;
			},
			resize,
		};
	}

	window.Overlays = { create };
})();
