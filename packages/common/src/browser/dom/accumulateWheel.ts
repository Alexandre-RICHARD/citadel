// Un cran de molette de souris (100 px, ou 3 lignes sous Firefox) compte pour un pas ; un pavé tactile envoie de petits
// défilements, qui s'additionnent jusqu'à ce seuil
const WHEEL_STEP_PIXELS = 50;
const PIXELS_PER_LINE = 20;
const PIXELS_PER_PAGE = 400;

const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

type AccumulatedWheel = {
	// -1 : vers le haut, 1 : vers le bas, 0 : pas encore assez de défilement
	step: -1 | 0 | 1;
	// À repasser au prochain défilement ; remis à zéro quand un pas est franchi
	accumulated: number;
};

// Additionne les défilements de la molette et dit quand un pas est franchi
export function accumulateWheel(
	accumulated: number,
	deltaY: number,
	deltaMode: number,
): AccumulatedWheel {
	let unit = 1;
	if (deltaMode === DOM_DELTA_LINE) unit = PIXELS_PER_LINE;
	else if (deltaMode === DOM_DELTA_PAGE) unit = PIXELS_PER_PAGE;
	const total = accumulated + deltaY * unit;
	if (total >= WHEEL_STEP_PIXELS) return { step: 1, accumulated: 0 };
	if (total <= -WHEEL_STEP_PIXELS) return { step: -1, accumulated: 0 };
	return { step: 0, accumulated: total };
}
