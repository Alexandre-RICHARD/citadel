import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { GetSagaEntriesBean } from "../bean/getSagaEntriesBean.type.ts";
import type { ReorderSagaBean } from "../bean/reorderSagaBean.type.ts";
import type { SagaBean } from "../bean/sagaBean.type.ts";
import type { SagaEntryBean } from "../bean/sagaEntryBean.type.ts";
import { getAllSagasQuery } from "../query/saga/getAllSagasQuery.ts";
import { getSagaEntriesQuery } from "../query/saga/getSagaEntriesQuery.ts";
import { getSagaNumbersQuery } from "../query/saga/getSagaNumbersQuery.ts";
import { sagaExistsQuery } from "../query/saga/sagaExistsQuery.ts";
import { updateSagaNumbersQuery } from "../query/saga/updateSagaNumbersQuery.ts";

function sagaNotFound(sagaId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.SAGA_NOT_FOUND,
		`No saga with id : ${sagaId}`,
	);
}

// Les sagas sont toutes à un compte : celle d'un autre répond comme absente (404)
class SagaService {
	// Les sagas du compte, par nom ; aucune n'est commune (§6)
	async getAllSagas(userId: number): Promise<SagaBean[]> {
		return getAllSagasQuery(userId);
	}

	async getSagaEntries(
		userId: number,
		{ sagaId }: GetSagaEntriesBean,
	): Promise<SagaEntryBean[]> {
		if (!(await sagaExistsQuery(userId, sagaId))) throw sagaNotFound(sagaId);
		return getSagaEntriesQuery(userId, sagaId);
	}

	/**
	 * « Réorganiser la saga » : les nouveaux numéros de tous ses médias du backlog, en une action, comme pour les séries
	 * des jeux. Un média ajouté ou retiré de la saga entre l'ouverture et la validation rend la liste caduque
	 */
	async reorderSaga(
		userId: number,
		{ sagaId, entries }: ReorderSagaBean,
	): Promise<SagaEntryBean[]> {
		await runInTransaction("Failed to reorder saga", async (transaction) => {
			if (!(await sagaExistsQuery(userId, sagaId, transaction)))
				throw sagaNotFound(sagaId);

			const current = await getSagaNumbersQuery(userId, sagaId, transaction);
			const sentIds = new Set(entries.map(({ userMediaId }) => userMediaId));
			if (
				current.length !== entries.length ||
				current.some(({ gameId }) => !sentIds.has(gameId))
			)
				throw new ConflictError(
					BacklogErrorCodeEnum.SAGA_ENTRIES_MISMATCH,
					`Entries are not the backlog media of saga : ${sagaId}`,
				);

			const currentNumbers = new Map(
				current.map(({ gameId, seriesNumber }) => [gameId, seriesNumber]),
			);
			await updateSagaNumbersQuery(
				userId,
				entries
					.filter(
						({ userMediaId, sagaNumber }) =>
							currentNumbers.get(userMediaId) !== sagaNumber,
					)
					.map(({ userMediaId, sagaNumber }) => ({
						gameId: userMediaId,
						seriesNumber: sagaNumber,
					})),
				transaction,
			);
		});
		return this.getSagaEntries(userId, { sagaId });
	}
}

export const sagaService = new SagaService();
