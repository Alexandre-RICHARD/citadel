// Types IGDB (endpoint `game_types`) tels qu'IGDB les numérote
const FAKE_GAME_TYPES = [
	{ id: 0, type: "Main Game" },
	{ id: 1, type: "DLC" },
	{ id: 2, type: "Expansion" },
	{ id: 3, type: "Bundle" },
	{ id: 5, type: "Mod" },
	{ id: 8, type: "Remake" },
	{ id: 9, type: "Remaster" },
	{ id: 10, type: "Expanded Game" },
	{ id: 11, type: "Port" },
];

type FakeEntry = { id: number } & Record<string, unknown>;

// Ids d'une condition Apicalypse : `id = 5` ou `id = (5,6)`
function readIds(body: string, field: string): number[] | null {
	const match = new RegExp(`(?:^|[\\s(|])${field} = \\(?([\\d,]+)\\)?`).exec(
		body,
	);
	return match === null ? null : (match[1] ?? "").split(",").map(Number);
}

/**
 * Un faux IGDB pour les tests unitaires : il répond aux requêtes que le Backlog envoie (recherche, `id =`,
 * `version_parent =`, `bundles =`) à partir d'une liste de fiches. La recherche rend `searchResults`, dans l'ordre
 */
export function createFakeIgdb(
	entries: FakeEntry[],
	searchResults: FakeEntry[] = [],
) {
	return (endpoint: string, body: string): Promise<unknown> => {
		if (endpoint === "game_types") return Promise.resolve(FAKE_GAME_TYPES);
		if (endpoint === "game_statuses")
			return Promise.resolve([{ id: 6, status: "Cancelled" }]);
		if (body.startsWith("search")) return Promise.resolve(searchResults);

		const ids = readIds(body, "id") ?? [];
		const parentIds = readIds(body, "version_parent") ?? [];
		const bundleIds = readIds(body, "bundles") ?? [];
		return Promise.resolve(
			entries.filter(
				(entry) =>
					ids.includes(entry.id) ||
					parentIds.includes(Number(entry.version_parent)) ||
					((entry.bundles as number[] | undefined) ?? []).some((bundleId) =>
						bundleIds.includes(bundleId),
					),
			),
		);
	};
}
