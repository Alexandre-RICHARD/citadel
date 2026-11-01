import type { SiteBanner } from "./siteBanner.type";

// Le bandeau s'affiche s'il existe, n'est pas échu, et n'a pas été fermé : la croix
// retient son identifiant, un nouveau message en a un autre et se réaffiche
export function isBannerVisible(
	banner: SiteBanner | null,
	dismissedId: string | null,
	now: number,
): banner is SiteBanner {
	if (banner === null || banner.id === dismissedId) return false;
	return banner.endsAt === null || Date.parse(banner.endsAt) > now;
}
