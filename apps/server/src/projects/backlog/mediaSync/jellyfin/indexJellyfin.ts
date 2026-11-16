import type { JellyfinLibrary } from "../client/jellyfinLibrary.type.ts";
import type { DiskIndex } from "../disk/diskIndex.type.ts";
import type { JellyfinIndex } from "./jellyfinIndex.type.ts";

// Un élément dans plusieurs collections garde la première : la colonne n'en montre qu'une
export function indexJellyfin(
	library: JellyfinLibrary,
	disk: DiskIndex,
): JellyfinIndex {
	const byInode = new Map<number, JellyfinLibrary["movies"][number]>();
	for (const item of [...library.movies, ...library.episodes]) {
		const file =
			item.Path === null || item.Path === undefined
				? undefined
				: disk.byPath.get(item.Path);
		if (file !== undefined && !byInode.has(file.inode))
			byInode.set(file.inode, item);
	}
	const collectionByItemId = new Map<string, string>();
	for (const { name, itemIds } of library.collections)
		for (const itemId of itemIds)
			if (!collectionByItemId.has(itemId)) collectionByItemId.set(itemId, name);
	return {
		byInode,
		seriesById: new Map(library.series.map((series) => [series.Id, series])),
		collectionByItemId,
	};
}
