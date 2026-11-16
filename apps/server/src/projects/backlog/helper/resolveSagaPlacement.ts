import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { getNextSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/getNextSeriesNumber.ts";
import { placeSeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/placeSeriesEntry.ts";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type.ts";
import type { Transaction } from "sequelize";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { MediaCustomizationBean } from "../bean/mediaCustomizationBean.type.ts";
import { findOrCreateSagaByNameQuery } from "../query/saga/findOrCreateSagaByNameQuery.ts";
import { findSagaByCollectionQuery } from "../query/saga/findSagaByCollectionQuery.ts";
import { getSagaNumbersQuery } from "../query/saga/getSagaNumbersQuery.ts";
import { sagaExistsQuery } from "../query/saga/sagaExistsQuery.ts";

type MediaCollection = { id: number; name: string };

type SagaPlacement = {
	sagaId: number | null;
	sagaNumber: number | null;
	shiftedEntries: SeriesEntry[];
};

/**
 * La saga choisie. Proposée : celle que le compte a reliée à la collection TMDB du film, sinon une saga au nom de la
 * collection (§4) ; une série n'a pas de collection, donc pas de saga proposée
 */
async function resolveSagaId(
	userId: number,
	collection: MediaCollection | null,
	saga: MediaCustomizationBean["saga"],
	transaction: Transaction,
): Promise<number | null> {
	switch (saga.kind) {
		case SagaChoiceKindEnum.PROPOSED: {
			if (collection === null) return null;
			const linked = await findSagaByCollectionQuery(
				userId,
				collection.id,
				transaction,
			);
			return (
				linked?.id ??
				findOrCreateSagaByNameQuery(userId, collection.name, transaction)
			);
		}
		case SagaChoiceKindEnum.OTHER:
			if (!(await sagaExistsQuery(userId, saga.sagaId, transaction)))
				throw new NotFoundError(
					BacklogErrorCodeEnum.SAGA_NOT_FOUND,
					`No saga with id : ${saga.sagaId}`,
				);
			return saga.sagaId;
		case SagaChoiceKindEnum.NEW:
			return findOrCreateSagaByNameQuery(userId, saga.name, transaction);
		default:
			return null;
	}
}

/**
 * Saga et numéro d'un média du backlog, avec les règles des séries des jeux : sans numéro, il passe après les autres
 * médias de la saga ; un numéro déjà pris est libéré vers le haut, et les médias décalés sont rendus. Sans saga, pas
 * de numéro
 */
export async function resolveSagaPlacement(
	userId: number,
	userMediaId: number,
	collection: MediaCollection | null,
	customization: MediaCustomizationBean,
	transaction: Transaction,
): Promise<SagaPlacement> {
	const sagaId = await resolveSagaId(
		userId,
		collection,
		customization.saga,
		transaction,
	);
	if (sagaId === null)
		return { sagaId: null, sagaNumber: null, shiftedEntries: [] };

	const entries = await getSagaNumbersQuery(userId, sagaId, transaction);
	const nextNumber = getNextSeriesNumber(
		entries.filter((entry) => entry.gameId !== userMediaId),
	);
	const placed = placeSeriesEntry(
		entries,
		userMediaId,
		customization.sagaNumber ?? nextNumber,
	);
	const numbersBefore = new Map(
		entries.map(({ gameId, seriesNumber }) => [gameId, seriesNumber]),
	);
	return {
		sagaId,
		// Une famille déjà à 3 décimales ne peut plus s'élargir : le média passe alors après les autres
		sagaNumber:
			placed.find((entry) => entry.gameId === userMediaId)?.seriesNumber ??
			nextNumber,
		shiftedEntries: placed.filter(
			(entry) =>
				entry.gameId !== userMediaId &&
				numbersBefore.get(entry.gameId) !== entry.seriesNumber,
		),
	};
}
