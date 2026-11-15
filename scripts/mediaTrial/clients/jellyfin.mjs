// Jellyfin, par le LAN, avec la clé d'API de la console (lecture seule ici).
import { requireVariable } from "../lib/config.mjs";
import { mapWithConcurrency, requestJson } from "../lib/http.mjs";

const itemFields = "Path,ProviderIds,MediaSources";

export function createJellyfinClient(nasHost) {
	const key = requireVariable("JELLYFIN_API_KEY");
	const baseUrl = `http://${nasHost}:8096`;
	const headers = { Authorization: `MediaBrowser Token="${key}"` };
	const get = (path, parameters = {}) => requestJson(`${baseUrl}${path}?${new URLSearchParams(parameters)}`, { headers });

	// Certaines listes (les enfants d'une collection) demandent un utilisateur : on prend le premier administrateur
	async function administratorId() {
		const users = await get("/Users");
		const administrator = users.find((user) => user.Policy?.IsAdministrator) ?? users[0];
		if (!administrator) throw new Error("Jellyfin : aucun utilisateur");
		return administrator.Id;
	}

	async function items(userId, types, extra = {}) {
		const result = await get("/Items", { userId, Recursive: "true", IncludeItemTypes: types, Fields: itemFields, ...extra });
		return result.Items ?? [];
	}

	return {
		itemUrl: (id) => `${baseUrl}/web/#/details?id=${id}`,
		async library() {
			const userId = await administratorId();
			const [movies, series, episodes, collections] = await Promise.all([
				items(userId, "Movie"),
				items(userId, "Series"),
				items(userId, "Episode"),
				items(userId, "BoxSet"),
			]);
			const collectionChildren = await mapWithConcurrency(collections, 4, async (collection) => ({
				collection,
				children: await items(userId, "Movie,Series", { ParentId: collection.Id }),
			}));
			return { movies, series, episodes, collectionChildren };
		},
	};
}
