import type { VersionPlatformBean } from "../bean/versionPlatformBean.type.ts";

type SortableVersion = {
	id: number;
	platforms: VersionPlatformBean[];
};

// Plus ancienne sortie de la version, toutes plateformes confondues ; null sans date connue
function getFirstReleaseDate(version: SortableVersion): string | null {
	return version.platforms.reduce<string | null>(
		(earliest, { releaseDate }) =>
			releaseDate !== null && (earliest === null || releaseDate < earliest)
				? releaseDate
				: earliest,
		null,
	);
}

// L'originale d'abord (son id est celui du jeu), puis les autres dans l'ordre de sortie, les dates inconnues en dernier
export function compareVersionsByRelease(gameId: number) {
	return (first: SortableVersion, second: SortableVersion): number => {
		if (first.id === gameId) return -1;
		if (second.id === gameId) return 1;
		const firstDate = getFirstReleaseDate(first);
		const secondDate = getFirstReleaseDate(second);
		if (firstDate !== secondDate) {
			if (firstDate === null) return 1;
			if (secondDate === null) return -1;
			return firstDate < secondDate ? -1 : 1;
		}
		return first.id - second.id;
	};
}
