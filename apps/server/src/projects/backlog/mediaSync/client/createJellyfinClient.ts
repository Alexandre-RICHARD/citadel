import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";
import { z } from "zod";

import { requestJson } from "../http/requestJson.ts";
import type { JellyfinClient } from "./jellyfinClient.type.ts";
import { jellyfinItemSchema } from "./jellyfinItemSchema.ts";

const ITEM_FIELDS = "Path,ProviderIds,MediaSources,ProductionYear";
const itemsSchema = z.object({ Items: z.array(jellyfinItemSchema) });
const usersSchema = z.array(
	z.object({
		Id: z.string(),
		Policy: z.object({ IsAdministrator: z.boolean().nullish() }).nullish(),
	}),
);

/**
 * Jellyfin, par le réseau de Caddy (media-jellyfin:8096), avec la clé d'API de la console, en lecture seule. Les
 * listes d'une collection demandent un utilisateur : celui du premier administrateur
 */
export function createJellyfinClient({
	url,
	apiKey,
}: {
	url: string;
	apiKey: string;
}): JellyfinClient {
	const headers = { Authorization: `MediaBrowser Token="${apiKey}"` };

	function get<Schema extends z.ZodType>(
		path: string,
		schema: Schema,
		parameters: Record<string, string> = {},
	): Promise<z.infer<Schema>> {
		return requestJson(
			"Jellyfin",
			`${url}${path}?${new URLSearchParams(parameters).toString()}`,
			schema,
			{ headers },
		);
	}

	async function items(
		userId: string,
		types: string,
		extra: Record<string, string> = {},
	) {
		const result = await get("/Items", itemsSchema, {
			userId,
			Recursive: "true",
			IncludeItemTypes: types,
			Fields: ITEM_FIELDS,
			...extra,
		});
		return result.Items;
	}

	return {
		async library() {
			const [users, info] = await Promise.all([
				get("/Users", usersSchema),
				get("/System/Info", z.object({ Id: z.string().nullish() })),
			]);
			const administrator =
				users.find(({ Policy }) => Policy?.IsAdministrator === true) ??
				users.at(0);
			if (administrator === undefined)
				throw new Error("Jellyfin : aucun utilisateur");
			const userId = administrator.Id;
			const [movies, series, episodes, boxSets] = await Promise.all([
				items(userId, "Movie"),
				items(userId, "Series"),
				items(userId, "Episode"),
				items(userId, "BoxSet"),
			]);
			const collections = await mapWithConcurrency(
				boxSets,
				4,
				async (boxSet) => ({
					name: boxSet.Name ?? boxSet.Id,
					itemIds: (
						await items(userId, "Movie,Series", { ParentId: boxSet.Id })
					).map(({ Id }) => Id),
				}),
			);
			return {
				serverId: info.Id ?? null,
				movies,
				series,
				episodes,
				collections,
			};
		},
	};
}
