import type { LavaBall } from "./lavaBall.type";

const SEED = 11;

// Aléatoire reproductible : les blobs partent du même endroit à chaque visite
function createSeededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 16807) % 2147483647;
		return (state - 1) / 2147483646;
	};
}

export function createLavaBalls(count: number): LavaBall[] {
	const random = createSeededRandom(SEED);
	return Array.from({ length: count }, (_, index) => ({
		baseX: random(),
		driftX: 0.02 + random() * 0.05,
		speedX: 0.05 + random() * 0.08,
		phaseX: random() * Math.PI * 2,
		speedY: 0.09 + random() * 0.07,
		phaseY: random() * Math.PI * 2,
		amplitudeY: 0.34 + random() * 0.14,
		radius: 0.085 + random() * 0.07,
		breathSpeed: 0.15 + random() * 0.2,
		breathPhase: random() * Math.PI * 2,
		colorIndex: index % 4,
	}));
}
