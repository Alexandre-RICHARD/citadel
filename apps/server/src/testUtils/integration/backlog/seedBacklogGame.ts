import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";

import { insertBacklogRows } from "./insertBacklogRows.ts";
import { SEEDED_PLATFORMS } from "./seededPlatforms.ts";
import { seedStoredGame } from "./seedStoredGame.ts";

type SeedOptions = Parameters<typeof seedStoredGame>[0] & {
	endingType?: EndingTypeEnum;
	seriesId?: number | null;
	seriesNumber?: number | null;
	// Statut de chaque version jouée, sur la plateforme de la version (la première de `platformIds`)
	userVersionStatuses?: StatusEnum[];
	createdAt?: Date;
};

type SeededBacklogGame = Awaited<ReturnType<typeof seedStoredGame>> & {
	userVersionIds: number[];
};

// Un jeu en base et dans le backlog, avec une version jouée par statut donné, chacune sur une version différente
export async function seedBacklogGame({
	endingType = EndingTypeEnum.STORY,
	seriesId = null,
	seriesNumber = null,
	userVersionStatuses,
	createdAt = new Date(),
	...storedOptions
}: SeedOptions = {}): Promise<SeededBacklogGame> {
	const statuses = userVersionStatuses ?? [undefined];
	const stored = await seedStoredGame({
		...storedOptions,
		otherVersionTitles:
			storedOptions.otherVersionTitles ??
			statuses.slice(1).map((_, index) => `Edition ${index + 1}`),
	});
	await insertBacklogRows.userGame({
		gameId: stored.gameId,
		endingType,
		seriesId,
		seriesNumber,
		createdAt,
	});
	const platformId = storedOptions.platformIds?.[0] ?? SEEDED_PLATFORMS.PS3;
	const userVersionIds: number[] = [];
	for (const [index, status] of statuses.entries())
		userVersionIds.push(
			// eslint-disable-next-line no-await-in-loop -- les versions jouées se suivent, dans l'ordre d'ajout
			await insertBacklogRows.userVersion({
				versionId: stored.versionIds[index] ?? stored.gameId,
				platformId,
				...(status !== undefined && { status }),
			}),
		);
	return { ...stored, userVersionIds };
}
