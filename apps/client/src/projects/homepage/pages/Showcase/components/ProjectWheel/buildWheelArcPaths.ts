import { getPointOnWheel } from "./getPointOnWheel";
import type { WheelGeometry } from "./wheelGeometry.type";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

const ARC_INSET = 24;
const ARC_SEGMENTS = 48;
const MAJOR_TICK_LENGTH = 12;
const MINOR_TICK_LENGTH = 6;

type WheelArcPaths = {
	line: string;
	minorTicks: string;
	majorTicks: string;
};

function format(value: number): string {
	return value.toFixed(1);
}

// L'arc sous les boîtes et ses graduations, qui tournent avec la roue : une grande en face de chaque projet,
// une petite entre deux. position est l'index (fractionnaire) de la boîte au centre
export function buildWheelArcPaths(
	geometry: WheelGeometry,
	position: number,
	itemCount: number,
): WheelArcPaths {
	const radius = geometry.radius - ARC_INSET;
	const reach =
		(geometry.orientation === WheelOrientationEnum.Vertical
			? geometry.height
			: geometry.width) /
			2 +
		60;
	const span = Math.min(1.4, reach / geometry.radius);

	let line = "";
	for (let segment = 0; segment <= ARC_SEGMENTS; segment++) {
		const angle = -span + (2 * span * segment) / ARC_SEGMENTS;
		const [x, y] = getPointOnWheel(geometry, angle, radius);
		line += `${segment ? "L" : "M"}${format(x)} ${format(y)}`;
	}

	let minorTicks = "";
	let majorTicks = "";
	const firstTick = Math.ceil((-span / geometry.step + position) * 2);
	const lastTick = Math.floor((span / geometry.step + position) * 2);
	for (let tick = firstTick; tick <= lastTick; tick++) {
		const angle = (tick / 2 - position) * geometry.step;
		const isMajor = tick % 2 === 0 && tick >= 0 && tick / 2 <= itemCount - 1;
		const [startX, startY] = getPointOnWheel(geometry, angle, radius);
		const [endX, endY] = getPointOnWheel(
			geometry,
			angle,
			radius - (isMajor ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH),
		);
		const segment = `M${format(startX)} ${format(startY)}L${format(endX)} ${format(endY)}`;
		if (isMajor) majorTicks += segment;
		else minorTicks += segment;
	}

	return { line, minorTicks, majorTicks };
}
