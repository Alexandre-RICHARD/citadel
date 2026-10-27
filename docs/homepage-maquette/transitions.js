/* Transitions vers un projet, dans le style de son ambiance. Deux temps : l'écran se couvre,
   la page du projet se charge dessous, puis l'écran se découvre sur la page déjà prête. */
(function () {
	"use strict";

	const TAU = Math.PI * 2;
	const IRIGO_LINES = ["#312783", "#94499a", "#009fe3", "#c3d600", "#ffe600", "#f39200", "#e30613"];

	function clamp01(v) {
		return Math.max(0, Math.min(1, v));
	}

	function easeInOut(x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}

	function easeOutBack(x) {
		const c1 = 1.70158;
		return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
	}

	function rgb(hex) {
		const n = parseInt(hex.slice(1), 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}

	function mix(a, b, t) {
		const x = rgb(a);
		const y = rgb(b);
		return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
	}

	function hexPath(ctx, x, y, r, rot = 0) {
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const a = rot + (Math.PI / 3) * i;
			if (i) ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
			else ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
		}
		ctx.closePath();
	}

	function farthest(w, h, o) {
		return Math.max(...[[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => Math.hypot(x - o.x, y - o.y)));
	}

	// Une vague de cases depuis le point cliqué : la case s'allume aux couleurs du projet, puis se fond dans le fond
	function wave(w, h, pal, o, cells, shape) {
		const maxD = Math.max(...cells.map((c) => Math.hypot(c.x - o.x, c.y - o.y))) || 1;
		for (const c of cells) {
			c.k = Math.hypot(c.x - o.x, c.y - o.y) / maxD;
			c.col = Math.random() < 0.25 ? pal.accent : pal.blobs[Math.floor(Math.random() * pal.blobs.length)];
		}
		return {
			draw(ctx, phase, p) {
				for (const c of cells) {
					let s = clamp01((p - c.k * 0.55) / 0.45);
					if (phase === "out") s = 1 - s;
					if (s <= 0) continue;
					ctx.fillStyle = mix(c.col, pal.bg, s * s * s * s);
					shape(ctx, c, phase === "in" ? easeOutBack(s) : s, s);
				}
			},
		};
	}

	const painters = {
		// Par défaut : un hexagone, celui du logo, qui s'ouvre depuis le bouton
		hex(w, h, pal, o) {
			const maxR = farthest(w, h, o) * 1.25;
			return {
				draw(ctx, phase, p) {
					const e = easeInOut(p);
					const r = e * maxR;
					const inner = Math.max(0, (e - 0.12) / 0.88) * maxR;
					if (phase === "in") {
						hexPath(ctx, o.x, o.y, r, e * 0.6);
						ctx.fillStyle = pal.accent;
						ctx.fill();
						hexPath(ctx, o.x, o.y, inner, e * 0.6);
						ctx.fillStyle = pal.bg;
						ctx.fill();
					} else {
						ctx.fillStyle = pal.bg;
						ctx.fillRect(0, 0, w, h);
						hexPath(ctx, w / 2, h / 2, r, e * 0.6);
						ctx.fillStyle = pal.accent;
						ctx.fill();
						ctx.globalCompositeOperation = "destination-out";
						hexPath(ctx, w / 2, h / 2, inner, e * 0.6);
						ctx.fill();
						ctx.globalCompositeOperation = "source-over";
					}
				},
			};
		},

		// Satisfactory : des hexagones qui se posent en vague, comme une usine qui se construit
		hexes(w, h, pal, o) {
			const R = 42;
			const hw = R * 1.5;
			const vh = R * Math.sqrt(3);
			const cells = [];
			for (let c = -1; c * hw < w + R; c++) {
				for (let r = -1; r * vh < h + R; r++) cells.push({ x: c * hw, y: r * vh + (c % 2 ? vh / 2 : 0) });
			}
			return wave(w, h, pal, o, cells, (ctx, c, scale) => {
				hexPath(ctx, c.x, c.y, R * 1.04 * scale);
				ctx.fill();
			});
		},

		// Backlog : des tuiles arrondies qui sautent en place, et perdent leurs arrondis une fois posées
		tiles(w, h, pal, o) {
			const S = 76;
			const cells = [];
			for (let i = 0; i * S < w + S; i++) {
				for (let j = 0; j * S < h + S; j++) cells.push({ x: i * S + S / 2, y: j * S + S / 2 });
			}
			return wave(w, h, pal, o, cells, (ctx, c, scale, s) => {
				const size = (S + 1) * scale;
				ctx.beginPath();
				ctx.roundRect(c.x - size / 2, c.y - size / 2, size, size, 18 * (1 - s));
				ctx.fill();
			});
		},

		// Angers Irigo : un tram passe. Les couleurs des lignes en tête, le fond derrière ; au retour, en queue
		tram(w, h, pal) {
			const a = (62 * Math.PI) / 180;
			const nx = Math.sin(a);
			const ny = Math.cos(a);
			const proj = [[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => x * nx + y * ny);
			const min = Math.min(...proj);
			const max = Math.max(...proj);
			const SW = 18;
			const GAP = 10;
			const band = IRIGO_LINES.length * (SW + GAP);
			const Y = Math.hypot(w, h) * 2;
			return {
				draw(ctx, phase, p) {
					const e = easeInOut(p);
					ctx.save();
					ctx.rotate(Math.atan2(ny, nx));
					if (phase === "in") {
						const front = min - band + e * (max - min + band);
						ctx.fillStyle = pal.bg;
						ctx.fillRect(min - 10, -Y, front - min + 10, 2 * Y);
						IRIGO_LINES.forEach((c, k) => {
							ctx.fillStyle = c;
							ctx.fillRect(front + GAP + k * (SW + GAP), -Y, SW, 2 * Y);
						});
					} else {
						const tail = min + e * (max - min + band);
						ctx.fillStyle = pal.bg;
						ctx.fillRect(tail, -Y, max + 10 - tail, 2 * Y);
						IRIGO_LINES.forEach((c, k) => {
							ctx.fillStyle = c;
							ctx.fillRect(tail - (k + 1) * (SW + GAP), -Y, SW, 2 * Y);
						});
					}
					ctx.restore();
				},
			};
		},

		// Game Death Counter : un rideau sombre qui monte, bordé de braises ; il se consume vers le haut au retour
		fire(w, h, pal, o, dark) {
			const embers = [];
			const glow = dark ? "#ff7a1a" : "#e2550c";
			function edgeY(x, base, t) {
				return base + 26 * Math.sin(x * 0.012 + t * 2.1) + 14 * Math.sin(x * 0.031 - t * 3.3) + 8 * Math.sin(x * 0.07 + t * 5);
			}
			return {
				draw(ctx, phase, p, t, dt) {
					const base = h + 120 - easeInOut(p) * (h + 260);
					const step = 16;
					const edge = () => {
						ctx.moveTo(0, edgeY(0, base, t));
						for (let x = step; x <= w + step; x += step) ctx.lineTo(x, edgeY(x, base, t));
					};
					ctx.beginPath();
					edge();
					const y = phase === "in" ? h + 10 : -10;
					ctx.lineTo(w + step, y);
					ctx.lineTo(0, y);
					ctx.closePath();
					ctx.fillStyle = pal.bg;
					ctx.fill();
					ctx.save();
					ctx.beginPath();
					edge();
					ctx.shadowColor = glow;
					ctx.shadowBlur = 28;
					ctx.strokeStyle = glow;
					ctx.lineWidth = 5;
					ctx.stroke();
					ctx.shadowBlur = 0;
					ctx.strokeStyle = "#ffd27a";
					ctx.lineWidth = 1.6;
					ctx.stroke();
					ctx.restore();
					if (base > -60 && base < h + 60) {
						for (let i = 0; i < 4; i++) {
							const x = Math.random() * w;
							embers.push({ x, y: edgeY(x, base, t), vy: 40 + Math.random() * 90, vx: (Math.random() - 0.5) * 30, life: 0.8 + Math.random(), age: 0, s: 1 + Math.random() * 2 });
						}
					}
					ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
					for (let i = embers.length - 1; i >= 0; i--) {
						const m = embers[i];
						m.age += dt;
						if (m.age > m.life) {
							embers.splice(i, 1);
							continue;
						}
						m.y -= m.vy * dt;
						m.x += m.vx * dt;
						ctx.fillStyle = `rgba(255,170,60,${0.9 * (1 - m.age / m.life)})`;
						ctx.beginPath();
						ctx.arc(m.x, m.y, m.s, 0, TAU);
						ctx.fill();
					}
					ctx.globalCompositeOperation = "source-over";
				},
			};
		},
	};

	function create(canvas) {
		const ctx = canvas.getContext("2d");
		const state = { p: 0 };
		let w = 0;
		let h = 0;
		let dpr = 1;
		let painter = null;
		let phase = "in";
		let running = false;
		let t = 0;
		let last = 0;

		function resize() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.max(1, Math.round(w * dpr));
			canvas.height = Math.max(1, Math.round(h * dpr));
		}

		// Dessine en continu tant que la transition est active, y compris pendant le chargement
		function loop(now) {
			if (!running) return;
			requestAnimationFrame(loop);
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			t += dt;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			painter.draw(ctx, phase, state.p, t, dt);
		}

		return {
			cover(kind, pal, dark, origin) {
				canvas.hidden = false;
				resize();
				painter = painters[kind](w, h, pal, origin, dark);
				phase = "in";
				state.p = 0;
				if (!running) {
					running = true;
					last = performance.now();
					requestAnimationFrame(loop);
				}
				return new Promise((resolve) => gsap.to(state, { p: 1, duration: 0.7, ease: "none", onComplete: resolve }));
			},
			reveal() {
				phase = "out";
				state.p = 0;
				return new Promise((resolve) =>
					gsap.to(state, {
						p: 1,
						duration: 0.75,
						ease: "none",
						onComplete() {
							running = false;
							ctx.setTransform(1, 0, 0, 1, 0, 0);
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							canvas.hidden = true;
							resolve();
						},
					}),
				);
			},
		};
	}

	window.Transitions = { create };
})();
