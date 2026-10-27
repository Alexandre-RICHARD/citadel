import { createSeededRandom } from "@citadel/common/src/universal/random/createSeededRandom";

import type { LavaBall } from "./lavaBall.type";

// Aléatoire reproductible : les blobs partent du même endroit à chaque visite
const SEED = 11;

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
