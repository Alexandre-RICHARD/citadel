import type { PlatformFm } from "../../api/model/platformFm.type";
import type { PlatformChoice } from "./platformChoice.type";

/**
 * Le choix d'une plateforme en deux temps : la plateforme (PS3, PC), puis, si elle en a, sa sous-plateforme (RPCS3,
 * Steam). L'enregistré est la sous-plateforme si elle est choisie, sinon la plateforme
 */
export function splitPlatformChoice(
	options: PlatformFm[],
	platformId: number | null,
): PlatformChoice {
	const chosen = options.find(({ id }) => id === platformId);
	const parentId = chosen?.parentPlatformId ?? chosen?.id ?? null;
	return {
		platforms: options.filter(
			({ parentPlatformId }) => parentPlatformId === null,
		),
		parentId,
		subPlatforms: options.filter(
			({ parentPlatformId }) =>
				parentPlatformId !== null && parentPlatformId === parentId,
		),
		subPlatformId:
			chosen === undefined || chosen.parentPlatformId === null
				? null
				: chosen.id,
	};
}
