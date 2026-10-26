import type { GameImportBean } from "../bean/gameImportBean.type.ts";
import type { GamePreviewBean } from "../bean/gamePreviewBean.type.ts";
import type { GamePreviewVersionBean } from "../bean/gamePreviewVersionBean.type.ts";
import type { PlatformBean } from "../bean/platformBean.type.ts";
import type { StoredGameBean } from "../bean/storedGameBean.type.ts";
import { getPlatformOptions } from "./getPlatformOptions.ts";

type PreviewSources = {
	gameImport: GameImportBean;
	// Le même jeu en base, s'il y est
	storedGame: StoredGameBean | null;
	// DLC déjà en base comme jeux à part (règle « DLC comme jeu ») : id du DLC → id du jeu
	dlcGameIds: Map<number, number>;
	emulators: PlatformBean[];
};

// Les fiches d'IGDB dans leur ordre, remplacées par celles de la base quand elles y sont, puis celles que seule la base a
function mergeInIgdbOrder<Item extends { id: number }>(
	igdbItems: Item[],
	storedItems: Item[],
): Item[] {
	const igdbIds = new Set(igdbItems.map(({ id }) => id));
	return [
		...igdbItems.map(
			(item) => storedItems.find(({ id }) => id === item.id) ?? item,
		),
		...storedItems.filter(({ id }) => !igdbIds.has(id)),
	];
}

/**
 * Modale du jeu. Un jeu en base garde ses données de la base, sa série proposée à l'ajout comprise ;
 * IGDB ne lui apporte que les versions et DLC qui lui manquent (« Modifier le jeu », « Rechercher d'autres DLC »)
 */
export function buildGamePreview({
	gameImport,
	storedGame,
	dlcGameIds,
	emulators,
}: PreviewSources): GamePreviewBean {
	const storedVersionIds = new Set(
		storedGame?.versions.map(({ id }) => id) ?? [],
	);
	const storedDlcIds = new Set(storedGame?.dlcs.map(({ id }) => id) ?? []);
	const igdbVersions: GamePreviewVersionBean[] = gameImport.versions.map(
		(version) => ({
			...version,
			isStored: false,
			platformOptions: getPlatformOptions(
				version.platforms.map(({ platform }) => platform),
				emulators,
			),
		}),
	);
	const storedVersions: GamePreviewVersionBean[] = (
		storedGame?.versions ?? []
	).map((version) => ({ ...version, isStored: true }));

	const versions = mergeInIgdbOrder(igdbVersions, storedVersions);
	const dlcs = mergeInIgdbOrder(gameImport.dlcs, storedGame?.dlcs ?? []).map(
		({ id, name }) => ({
			id,
			name,
			isStored: storedDlcIds.has(id),
			storedGameId: dlcGameIds.get(id) ?? null,
		}),
	);

	return {
		game:
			storedGame === null
				? gameImport.game
				: {
						id: storedGame.id,
						name: storedGame.name,
						frenchName: storedGame.frenchName,
						firstReleaseDate: storedGame.firstReleaseDate,
						isCancelled: storedGame.isCancelled,
						igdbUrl: storedGame.igdbUrl,
					},
		isStored: storedGame !== null,
		proposedSeriesName:
			storedGame === null
				? (gameImport.proposedSeries?.name ?? null)
				: (storedGame.proposedSeries?.name ?? null),
		developer:
			storedGame === null ? gameImport.developer : storedGame.developer,
		publisher:
			storedGame === null ? gameImport.publisher : storedGame.publisher,
		versions: versions.map((version) => ({
			...version,
			isStored: storedVersionIds.has(version.id),
		})),
		dlcs,
		imageIds: gameImport.imageIds,
		warnings: gameImport.warnings,
	};
}
