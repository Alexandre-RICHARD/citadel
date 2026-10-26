import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { getNextSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/getNextSeriesNumber.ts";
import { placeSeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/placeSeriesEntry.ts";
import type { Transaction } from "sequelize";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CustomizationInputBean } from "../bean/customizationInputBean.type.ts";
import { findOrCreateSeriesByNameQuery } from "../query/series/findOrCreateSeriesByNameQuery.ts";
import { getSeriesNumbersQuery } from "../query/series/getSeriesNumbersQuery.ts";
import { seriesExistsQuery } from "../query/series/seriesExistsQuery.ts";
import type { SeriesPlacement } from "./seriesPlacement.type.ts";

async function resolveSeriesId(
	proposedSeriesId: number | null,
	series: CustomizationInputBean["series"],
	transaction: Transaction,
): Promise<number | null> {
	switch (series.kind) {
		case SeriesChoiceKindEnum.PROPOSED:
			return proposedSeriesId;
		case SeriesChoiceKindEnum.OTHER:
			if (!(await seriesExistsQuery(series.seriesId, transaction)))
				throw new NotFoundError(
					BacklogErrorCodeEnum.SERIES_NOT_FOUND,
					`No series with id : ${series.seriesId}`,
				);
			return series.seriesId;
		case SeriesChoiceKindEnum.NEW:
			return findOrCreateSeriesByNameQuery(series.name, transaction);
		default:
			return null;
	}
}

/**
 * Série et numéro d'un jeu du backlog. Sans numéro, il passe après les autres jeux de la série ;
 * un numéro déjà pris est libéré vers le haut, et les jeux décalés sont rendus. Sans série, pas de numéro
 */
export async function resolveSeriesPlacement(
	gameId: number,
	proposedSeriesId: number | null,
	customization: CustomizationInputBean,
	transaction: Transaction,
): Promise<SeriesPlacement> {
	const seriesId = await resolveSeriesId(
		proposedSeriesId,
		customization.series,
		transaction,
	);
	if (seriesId === null)
		return { seriesId: null, seriesNumber: null, shiftedEntries: [] };

	const entries = await getSeriesNumbersQuery(seriesId, transaction);
	const nextNumber = getNextSeriesNumber(
		entries.filter((entry) => entry.gameId !== gameId),
	);
	const placed = placeSeriesEntry(
		entries,
		gameId,
		customization.seriesNumber ?? nextNumber,
	);
	const numbersBefore = new Map(
		entries.map(({ gameId: entryGameId, seriesNumber }) => [
			entryGameId,
			seriesNumber,
		]),
	);
	return {
		seriesId,
		// Une famille déjà à 3 décimales ne peut plus s'élargir : le jeu passe alors après les autres
		seriesNumber:
			placed.find((entry) => entry.gameId === gameId)?.seriesNumber ??
			nextNumber,
		shiftedEntries: placed.filter(
			(entry) =>
				entry.gameId !== gameId &&
				numbersBefore.get(entry.gameId) !== entry.seriesNumber,
		),
	};
}
