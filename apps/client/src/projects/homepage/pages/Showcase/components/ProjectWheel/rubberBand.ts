const MAX_OVERSHOOT = 0.45;
const STIFFNESS = 0.6;

// Au-delà des butées (0 et max), la roue résiste de plus en plus, sans dépasser MAX_OVERSHOOT boîte
export function rubberBand(position: number, max: number): number {
	if (position < 0)
		return -MAX_OVERSHOOT * (1 - Math.exp(position / STIFFNESS));
	if (position > max)
		return max + MAX_OVERSHOOT * (1 - Math.exp(-(position - max) / STIFFNESS));
	return position;
}
