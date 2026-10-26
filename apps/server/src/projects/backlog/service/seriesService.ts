import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { GetSeriesEntriesBean } from "../bean/getSeriesEntriesBean.type.ts";
import type { ReorderSeriesBean } from "../bean/reorderSeriesBean.type.ts";
import type { SeriesBean } from "../bean/seriesBean.type.ts";
import type { SeriesEntryBean } from "../bean/seriesEntryBean.type.ts";
import { fromSeriesEntryRowToSeriesEntryBean } from "../mapper/beanEntity/fromSeriesEntryRowToSeriesEntryBean.ts";
import { getAllSeriesQuery } from "../query/series/getAllSeriesQuery.ts";
import { getSeriesEntriesQuery } from "../query/series/getSeriesEntriesQuery.ts";
import { getSeriesNumbersQuery } from "../query/series/getSeriesNumbersQuery.ts";
import { seriesExistsQuery } from "../query/series/seriesExistsQuery.ts";
import { updateSeriesNumbersQuery } from "../query/series/updateSeriesNumbersQuery.ts";

function seriesNotFound(seriesId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.SERIES_NOT_FOUND,
		`No series with id : ${seriesId}`,
	);
}

class SeriesService {
	async getAllSeries(): Promise<SeriesBean[]> {
		return (await getAllSeriesQuery()).map(({ id, name }) => ({ id, name }));
	}

	async getSeriesEntries({
		seriesId,
	}: GetSeriesEntriesBean): Promise<SeriesEntryBean[]> {
		if (!(await seriesExistsQuery(seriesId))) throw seriesNotFound(seriesId);
		return (await getSeriesEntriesQuery(seriesId)).map(
			fromSeriesEntryRowToSeriesEntryBean,
		);
	}

	/**
	 * « Réorganiser la série » : les nouveaux numéros de tous ses jeux du backlog, en une action.
	 * Un jeu ajouté ou retiré de la série entre l'ouverture et la validation rend la liste caduque
	 */
	async reorderSeries({
		seriesId,
		entries,
	}: ReorderSeriesBean): Promise<SeriesEntryBean[]> {
		await runInTransaction("Failed to reorder series", async (transaction) => {
			if (!(await seriesExistsQuery(seriesId, transaction)))
				throw seriesNotFound(seriesId);

			const current = await getSeriesNumbersQuery(seriesId, transaction);
			const sentGameIds = new Set(entries.map(({ gameId }) => gameId));
			if (
				current.length !== entries.length ||
				current.some(({ gameId }) => !sentGameIds.has(gameId))
			)
				throw new ConflictError(
					BacklogErrorCodeEnum.SERIES_ENTRIES_MISMATCH,
					`Entries are not the backlog games of series : ${seriesId}`,
				);

			const currentNumbers = new Map(
				current.map(({ gameId, seriesNumber }) => [gameId, seriesNumber]),
			);
			await updateSeriesNumbersQuery(
				entries.filter(
					({ gameId, seriesNumber }) =>
						currentNumbers.get(gameId) !== seriesNumber,
				),
				transaction,
			);
		});
		return this.getSeriesEntries({ seriesId });
	}
}

export const seriesService = new SeriesService();
