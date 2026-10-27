import { getCouponLevelCost } from "./getCouponLevelCost";

// Points pour obtenir tous les coupons de firstLevel à lastLevel inclus
export function getCouponLevelsCost(
	firstLevel: number,
	lastLevel: number,
): number {
	let total = 0;
	for (let level = firstLevel; level <= lastLevel; level += 1)
		total += getCouponLevelCost(level);
	return total;
}
