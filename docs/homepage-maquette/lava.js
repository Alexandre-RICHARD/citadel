/* Fond « lampe à lave » : des metaballs dans un fragment shader WebGL, rendu à demi-résolution,
   sur un canvas transparent hors des blobs. */
(function () {
	"use strict";

	const N = 8;

	const VERT = "attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }";

	const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform vec3 uBall[${N}];
uniform vec3 uCol[${N}];
uniform float uDark;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
	vec2 p = gl_FragCoord.xy / uRes.y;
	float f = 0.0;
	vec3 c = vec3(0.0);
	vec2 g = vec2(0.0);
	for (int i = 0; i < ${N}; i++) {
		vec2 d = p - uBall[i].xy;
		float dd = max(dot(d, d), 1e-4);
		float r2 = uBall[i].z * uBall[i].z;
		float v = r2 / dd;
		f += v;
		c += uCol[i] * v;
		g += -2.0 * r2 * d / (dd * dd);
	}
	c /= max(f, 1e-4);
	// Bord net : la largeur de la transition suit la pente du champ, pour garder 1 à 2 pixels partout
	float aa = length(g) / uRes.y * 1.2;
	float edge = smoothstep(1.0 - aa, 1.0 + aa, f);
	// Le coeur s'éclaircit, le bord fonce un peu : du volume, comme de la cire
	float core = smoothstep(1.0, 4.5, f);
	vec3 blob = c * (0.78 + 0.34 * core) + vec3(0.06) * core * uDark;
	// Halo léger autour des blobs ; ailleurs, transparent : le fond est celui de la page,
	// et les fonds animés des projets peuvent passer derrière les blobs
	float halo = smoothstep(0.3, 1.0, f) * (1.0 - edge) * 0.14;
	// Grain, pour éviter les bandes dans les dégradés
	vec3 grain = vec3((hash(gl_FragCoord.xy) - 0.5) * 0.03);
	float a = edge + halo;
	vec3 col = (blob + grain) * edge + (c + grain) * halo;
	gl_FragColor = vec4(col, a);
}`;

	function hexToRgb(hex) {
		const n = parseInt(hex.slice(1), 16);
		return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
	}

	function mix(a, b, t) {
		return a.map((v, i) => v + (b[i] - v) * t);
	}

	function ease(t) {
		if (t <= 0) return 0;
		if (t >= 1) return 1;
		return 0.5 - 0.5 * Math.cos(Math.PI * t);
	}

	// Aléatoire reproductible : les blobs partent du même endroit à chaque chargement
	function rng(seed) {
		return function () {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};
	}

	function makeBalls() {
		const r = rng(11);
		return Array.from({ length: N }, (_, i) => ({
			bx: r(),
			ax: 0.02 + r() * 0.05,
			wx: 0.05 + r() * 0.08,
			px: r() * 6.28,
			wy: 0.09 + r() * 0.07,
			py: r() * 6.28,
			amp: 0.34 + r() * 0.14,
			r0: 0.085 + r() * 0.07,
			wr: 0.15 + r() * 0.2,
			pr: r() * 6.28,
			c: i % 4,
		}));
	}

	function compile(gl, type, src) {
		const s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(s));
			return null;
		}
		return s;
	}

	function create(canvas) {
		const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
		if (!gl) return null;
		const vs = compile(gl, gl.VERTEX_SHADER, VERT);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
		if (!vs || !fs) return null;
		const prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
		gl.useProgram(prog);

		// Un seul triangle qui couvre tout l'écran
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const loc = gl.getAttribLocation(prog, "a");
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

		const u = {
			res: gl.getUniformLocation(prog, "uRes"),
			ball: gl.getUniformLocation(prog, "uBall"),
			col: gl.getUniformLocation(prog, "uCol"),
			dark: gl.getUniformLocation(prog, "uDark"),
		};

		const balls = makeBalls();
		const ballBuf = new Float32Array(N * 3);
		const colBuf = new Float32Array(N * 3);
		const SCALE = 0.5;

		let cur = null;
		let tween = null;
		let dark = 1;
		let narrow = false;
		let reduced = false;
		let enabled = true;
		let dirty = true;
		let t = 0;
		let last = performance.now();

		function resize() {
			canvas.width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
			canvas.height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
			gl.viewport(0, 0, canvas.width, canvas.height);
			dirty = true;
		}

		function draw(now) {
			if (tween) {
				const k = ease((now - tween.t0) / tween.ms);
				cur = {
					blobs: tween.from.blobs.map((c, i) => mix(c, tween.to.blobs[i], k)),
				};
				if (k >= 1) tween = null;
			}
			if (!cur) return;
			const aspect = canvas.width / canvas.height;
			const count = narrow ? 6 : N;
			// Sur grand écran, les blobs restent surtout dans la zone de présentation
			const lo = narrow ? 0 : 0.36;
			for (let i = 0; i < N; i++) {
				const b = balls[i];
				const x = (lo + (1 - lo) * b.bx + b.ax * Math.sin(b.wx * t + b.px)) * aspect;
				const y = 0.5 + b.amp * Math.sin(b.wy * t + b.py);
				const r = i < count ? b.r0 * (1 + 0.14 * Math.sin(b.wr * t + b.pr)) * (narrow ? 0.85 : 1) : 0;
				ballBuf[i * 3] = x;
				ballBuf[i * 3 + 1] = y;
				ballBuf[i * 3 + 2] = r;
				colBuf.set(cur.blobs[b.c], i * 3);
			}
			gl.uniform2f(u.res, canvas.width, canvas.height);
			gl.uniform3fv(u.ball, ballBuf);
			gl.uniform3fv(u.col, colBuf);
			gl.uniform1f(u.dark, dark);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}

		function frame(now) {
			requestAnimationFrame(frame);
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			if (!enabled || document.hidden) return;
			// Animations réduites : image figée, redessinée seulement quand les couleurs changent
			if (reduced && !tween && !dirty) return;
			if (!reduced) t += dt;
			draw(now);
			dirty = false;
		}

		resize();
		requestAnimationFrame(frame);

		return {
			setPalette(blobs, dur, isDark) {
				const to = { blobs: blobs.map(hexToRgb) };
				dark = isDark ? 1 : 0;
				if (!cur) {
					cur = to;
				} else {
					tween = { from: cur, to, t0: performance.now(), ms: Math.max(dur, 0.01) * 1000 };
				}
				dirty = true;
			},
			setNarrow(v) {
				narrow = v;
				dirty = true;
			},
			setReduced(v) {
				reduced = v;
				dirty = true;
			},
			setEnabled(v) {
				enabled = v;
				dirty = true;
			},
			resize,
		};
	}

	window.Lava = { create };
})();
