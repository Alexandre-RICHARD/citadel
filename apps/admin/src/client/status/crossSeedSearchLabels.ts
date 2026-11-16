import { CrossSeedSearchEnum } from "@citadel/specs/src/projects/backlog/mediaSyncReport/crossSeedSearch.enum";

// Ce qu'infra-ops a fait de la recherche complète de cross-seed avant le relevé ; rien les autres nuits
export const CROSS_SEED_SEARCH_LABELS: Record<
	CrossSeedSearchEnum,
	string | null
> = {
	[CrossSeedSearchEnum.NOT_SCHEDULED]: null,
	[CrossSeedSearchEnum.STARTED]:
		"Recherche complète de cross-seed lancée cette nuit : ses ajouts entreront dans le relevé de demain",
	[CrossSeedSearchEnum.ALREADY_RUNNING]:
		"Recherche complète de cross-seed déjà en cours, ou trop proche de la prochaine",
	[CrossSeedSearchEnum.FAILED]:
		"Recherche complète de cross-seed refusée ou injoignable (CROSS_SEED_API_KEY ?)",
};
