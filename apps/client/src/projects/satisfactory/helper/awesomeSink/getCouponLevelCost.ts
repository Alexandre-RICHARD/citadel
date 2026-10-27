// Barème du jeu : 500 points pour les 3 premiers coupons, puis le prix monte tous les 3 coupons, plafonné au palier 999
const FIRST_TIER_COST = 500;
const COUPONS_PER_TIER = 3;
const MAX_TIER = 999;
const TIER_COST_FACTOR = 250;
const TIER_BASE_COST = 1000;

// Points à envoyer dans le Sink pour obtenir le coupon numéro `level` (le premier est le 1)
export function getCouponLevelCost(level: number): number {
	const tier = Math.min(Math.ceil(level / COUPONS_PER_TIER) - 1, MAX_TIER);
	if (tier === 0) return FIRST_TIER_COST;
	return TIER_COST_FACTOR * tier ** 2 + TIER_BASE_COST;
}
