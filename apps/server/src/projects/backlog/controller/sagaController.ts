import type { GetAllSagas } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getAllSagas/getAllSagasEndpoint.interface.ts";
import type { GetSagaEntries } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getSagaEntries/getSagaEntriesEndpoint.interface.ts";
import type { ReorderSaga } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromGetSagaEntriesDtoToGetSagaEntriesBean } from "../mapper/dtoBean/media/fromGetSagaEntriesDtoToGetSagaEntriesBean.ts";
import { fromReorderSagaDtoToReorderSagaBean } from "../mapper/dtoBean/media/fromReorderSagaDtoToReorderSagaBean.ts";
import { fromSagaBeanListToSagaListDto } from "../mapper/dtoBean/media/fromSagaBeanListToSagaListDto.ts";
import { fromSagaEntryBeanListToSagaEntryListDto } from "../mapper/dtoBean/media/fromSagaEntryBeanListToSagaEntryListDto.ts";
import { sagaService } from "../service/sagaService.ts";

export const sagaController = {
	getAll: protectedRequestHandler<GetAllSagas>(
		async (_request, response, session) => {
			const sagas = await sagaService.getAllSagas(session.userId);

			if (sagas.length === 0)
				return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSagaBeanListToSagaListDto(sagas));
		},
	),

	// Une saga existe tant qu'elle a un média : sa liste n'est jamais vide
	getEntries: protectedRequestHandler<GetSagaEntries>(
		async (request, response, session) => {
			const entries = await sagaService.getSagaEntries(
				session.userId,
				fromGetSagaEntriesDtoToGetSagaEntriesBean(request.params),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSagaEntryBeanListToSagaEntryListDto(entries));
		},
	),

	reorder: protectedRequestHandler<ReorderSaga>(
		async (request, response, session) => {
			const entries = await sagaService.reorderSaga(
				session.userId,
				fromReorderSagaDtoToReorderSagaBean(request.params, request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromSagaEntryBeanListToSagaEntryListDto(entries));
		},
	),
};
