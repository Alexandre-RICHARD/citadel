import type { GetAllSagas } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getAllSagas/getAllSagasEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromSagaBeanListToSagaListDto } from "../mapper/dtoBean/media/fromSagaBeanListToSagaListDto.ts";
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
};
