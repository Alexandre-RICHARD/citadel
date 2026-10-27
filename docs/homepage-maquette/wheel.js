/* Roue des projets : des boîtes posées sur un arc de cercle.
   Faire tourner la roue ne sélectionne rien ; un clic sélectionne le projet et l'amène au centre. */
(function () {
	"use strict";

	function clamp(v, a, b) {
		return Math.max(a, Math.min(b, v));
	}

	function ring(value) {
		return `<span class="wheel-item-progress" title="Avancement : ${value} %">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle class="ring-track" cx="12" cy="12" r="9" />
				<circle class="ring-value" cx="12" cy="12" r="9" pathLength="100" stroke-dasharray="${value} 100" transform="rotate(-90 12 12)" />
			</svg>
			<b>${value}%</b>
		</span>`;
	}

	class Wheel {
		constructor(root, { onSelect, onClear }) {
			this.root = root;
			this.itemsEl = root.querySelector(".wheel-items");
			this.svg = root.querySelector(".wheel-arc");
			this.clearBtn = root.querySelector(".wheel-clear");
			this.onSelect = onSelect;
			this.onClear = onClear;
			this.items = [];
			this.els = [];
			this.pos = 0;
			this.target = 0;
			this.selected = null;
			this.orientation = "vertical";
			this.reduced = false;
			this.g = null;
			this.dirty = true;
			this.drag = null;
			this.snapTimer = 0;
			this.suppressClick = false;
			this.svg.innerHTML =
				'<path class="arc-line" /><path class="arc-ticks" /><path class="arc-ticks-major" />';
			this.bind();
			this.last = performance.now();
			requestAnimationFrame((t) => this.frame(t));
		}

		max() {
			return Math.max(0, this.items.length - 1);
		}

		setItems(items) {
			this.items = items;
			this.itemsEl.innerHTML = "";
			this.els = items.map((it, i) => {
				const b = document.createElement("button");
				b.type = "button";
				b.className = "wheel-item";
				b.dataset.index = String(i);
				b.innerHTML = `<span class="wheel-item-name" data-reskin>${it.name}</span>${ring(it.progress)}`;
				this.itemsEl.appendChild(b);
				return b;
			});
			// Sans sélection, la liste se centre sur la roue
			this.target = this.selected === null ? Math.floor(this.max() / 2) : clamp(Math.round(this.target), 0, this.max());
			this.pos = this.target;
			this.setSelected(this.selected);
			this.dirty = true;
		}

		setSelected(slug) {
			this.selected = slug;
			const idx = this.items.findIndex((it) => it.slug === slug);
			if (idx >= 0) this.target = idx;
			this.els.forEach((el, i) => {
				const on = i === idx;
				el.classList.toggle("is-selected", on);
				el.setAttribute("aria-pressed", String(on));
			});
			const visible = idx >= 0;
			this.clearBtn.classList.toggle("is-visible", visible);
			this.clearBtn.tabIndex = visible ? 0 : -1;
			this.dirty = true;
		}

		setOrientation(o) {
			if (o === this.orientation) return;
			this.orientation = o;
			this.relayout();
		}

		relayout() {
			this.g = null;
			this.dirty = true;
		}

		layout() {
			const w = this.root.clientWidth;
			const h = this.root.clientHeight;
			if (!w || !h) return false;
			if (this.orientation === "vertical") {
				const R = Math.max(h * 0.62, 300);
				const x0 = clamp(w * 0.28, 90, 160);
				const spacing = clamp(h * 0.12, 62, 84);
				this.g = { w, h, R, x0, cx: x0 - R, cy: h / 2, spacing, step: spacing / R };
				this.clearBtn.style.left = `${Math.max(26, x0 - 62)}px`;
				this.clearBtn.style.top = `${h / 2}px`;
			} else {
				const R = Math.max(w * 1.5, 520);
				const y0 = 96;
				const spacing = clamp(w * 0.42, 140, 190);
				this.g = { w, h, R, y0, cx: w / 2, cy: y0 - R, spacing, step: spacing / R };
				this.clearBtn.style.left = `${w / 2}px`;
				this.clearBtn.style.top = "36px";
			}
			return true;
		}

		// Au-delà des butées, la roue résiste puis revient
		rubber(v) {
			const max = this.max();
			if (v < 0) return -0.45 * (1 - Math.exp(v / 0.6));
			if (v > max) return max + 0.45 * (1 - Math.exp(-(v - max) / 0.6));
			return v;
		}

		snapSoon(ms) {
			clearTimeout(this.snapTimer);
			this.snapTimer = setTimeout(() => {
				this.target = clamp(Math.round(this.target), 0, this.max());
			}, ms);
		}

		bind() {
			this.root.addEventListener(
				"wheel",
				(e) => {
					e.preventDefault();
					let d =
						this.orientation === "vertical" || Math.abs(e.deltaY) > Math.abs(e.deltaX)
							? e.deltaY
							: e.deltaX;
					if (e.deltaMode === 1) d *= 16;
					this.target = clamp(this.target + d / 170, -0.35, this.max() + 0.35);
					this.snapSoon(170);
				},
				{ passive: false },
			);

			this.root.addEventListener("pointerdown", (e) => {
				if (e.button !== 0 || e.target.closest(".wheel-clear")) return;
				this.drag = {
					id: e.pointerId,
					x: e.clientX,
					y: e.clientY,
					start: this.target,
					moved: false,
					samples: [[performance.now(), this.target]],
				};
			});

			window.addEventListener("pointermove", (e) => {
				const d = this.drag;
				if (!d || e.pointerId !== d.id || !this.g) return;
				const delta = this.orientation === "vertical" ? e.clientY - d.y : e.clientX - d.x;
				if (!d.moved && Math.abs(delta) > 6) d.moved = true;
				if (!d.moved) return;
				this.target = this.rubber(d.start - delta / this.g.spacing);
				d.samples.push([performance.now(), this.target]);
				if (d.samples.length > 6) d.samples.shift();
			});

			const release = (e) => {
				const d = this.drag;
				if (!d || e.pointerId !== d.id) return;
				this.drag = null;
				if (!d.moved) return;
				this.suppressClick = true;
				setTimeout(() => (this.suppressClick = false), 0);
				// Un peu d'élan, puis on se cale sur une boîte
				const [t0, p0] = d.samples[0];
				const [t1, p1] = d.samples[d.samples.length - 1];
				const v = t1 > t0 ? (p1 - p0) / ((t1 - t0) / 1000) : 0;
				this.target = clamp(Math.round(this.target + v * 0.18), 0, this.max());
			};
			window.addEventListener("pointerup", release);
			window.addEventListener("pointercancel", release);

			this.itemsEl.addEventListener("click", (e) => {
				if (this.suppressClick) return;
				const b = e.target.closest(".wheel-item");
				if (!b) return;
				const i = Number(b.dataset.index);
				this.target = i;
				this.onSelect(this.items[i]);
			});

			// Flèches : on passe d'une boîte à l'autre, la roue suit le focus
			this.itemsEl.addEventListener("keydown", (e) => {
				const b = e.target.closest(".wheel-item");
				if (!b) return;
				const i = Number(b.dataset.index);
				let n = null;
				if (e.key === "ArrowDown" || e.key === "ArrowRight") n = i + 1;
				else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = i - 1;
				else if (e.key === "Home") n = 0;
				else if (e.key === "End") n = this.max();
				if (n === null) return;
				e.preventDefault();
				this.els[clamp(n, 0, this.max())].focus({ preventScroll: true });
			});

			this.itemsEl.addEventListener("focusin", (e) => {
				const b = e.target.closest(".wheel-item");
				if (b && !this.drag) this.target = Number(b.dataset.index);
			});

			this.clearBtn.addEventListener("click", () => this.onClear());
		}

		frame(now) {
			requestAnimationFrame((t) => this.frame(t));
			const dt = Math.min(0.05, (now - this.last) / 1000);
			this.last = now;
			if (!this.g) {
				if (!this.layout()) return;
				this.dirty = true;
			}
			const diff = this.target - this.pos;
			if (Math.abs(diff) < 0.0005 && !this.dirty) return;
			this.pos = this.reduced ? this.target : this.pos + diff * (1 - Math.exp(-dt * 10));
			if (Math.abs(this.target - this.pos) < 0.0005) this.pos = this.target;
			this.render();
			this.dirty = false;
		}

		point(a, r) {
			const g = this.g;
			return this.orientation === "vertical"
				? [g.cx + r * Math.cos(a), g.cy + r * Math.sin(a)]
				: [g.cx + r * Math.sin(a), g.cy + r * Math.cos(a)];
		}

		render() {
			const g = this.g;
			const vert = this.orientation === "vertical";
			this.els.forEach((el, i) => {
				const k = i - this.pos;
				const d = Math.abs(k);
				if (d > 4.8) {
					el.style.visibility = "hidden";
					return;
				}
				el.style.visibility = "";
				const th = k * g.step;
				const [x, y] = this.point(th, g.R);
				// La boîte du centre est la plus grande, les autres rapetissent et s'estompent
				const s = (1 + 0.14 * Math.max(0, 1 - d)) * Math.max(0.6, 1 - 0.08 * d);
				const rot = vert ? th * 0.55 : -th * 0.6;
				const tail = vert ? "translate(0,-50%)" : "translate(-50%,0)";
				el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(4)}rad) scale(${s.toFixed(3)}) ${tail}`;
				el.style.opacity = String(clamp(1 - 0.22 * d, 0, 1));
				el.style.zIndex = String(100 - Math.round(d * 10));
			});
			this.renderArc();
		}

		// L'arc et ses graduations, qui tournent avec la roue
		renderArc() {
			const g = this.g;
			const vert = this.orientation === "vertical";
			const r = g.R - 24;
			const reach = vert ? g.h / 2 + 60 : g.w / 2 + 60;
			const span = Math.min(1.4, reach / g.R);
			let line = "";
			for (let i = 0; i <= 48; i++) {
				const a = -span + (2 * span * i) / 48;
				const [x, y] = this.point(a, r);
				line += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
			}
			let minor = "";
			let major = "";
			const kMin = Math.ceil((-span / g.step + this.pos) * 2);
			const kMax = Math.floor((span / g.step + this.pos) * 2);
			for (let k = kMin; k <= kMax; k++) {
				const a = (k / 2 - this.pos) * g.step;
				const isMajor = k % 2 === 0 && k / 2 >= 0 && k / 2 <= this.max();
				const [x1, y1] = this.point(a, r);
				const [x2, y2] = this.point(a, r - (isMajor ? 12 : 6));
				const seg = `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
				if (isMajor) major += seg;
				else minor += seg;
			}
			const [lineEl, minorEl, majorEl] = this.svg.children;
			lineEl.setAttribute("d", line);
			minorEl.setAttribute("d", minor);
			majorEl.setAttribute("d", major);
		}
	}

	window.Wheel = Wheel;
})();
