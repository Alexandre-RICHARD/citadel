import type { AddDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeath.endpoint.ts";
import type { DeleteDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeath.endpoint.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { handleBaseError } from "../../../error/handleBaseError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { fromAddDeathDtoToAddDeathBean } from "../mapper/dtoBean/death/fromAddDeathDtoToAddDeathBean.ts";
import { fromDeathBeanToDeathDto } from "../mapper/dtoBean/death/fromDeathBeanToDeathDto.ts";
import { fromDeleteDeathDtoToDeleteDeathBean } from "../mapper/dtoBean/death/fromDeleteDeathDtoToDeleteDeathBean.ts";
import { deathService } from "../service/death.service.ts";

export const deathController = {
	add: asyncRequestHandler<AddDeath>(async (request, response) => {
		const { params } = request;

		try {
			const addDeathBean = fromAddDeathDtoToAddDeathBean(params);

			const death = await deathService.addDeath(addDeathBean);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromDeathBeanToDeathDto(death));
		} catch (error) {
			void handleBaseError(error);
			switch (true) {
				case error instanceof NotFoundError:
					return response.status(HttpStatutCodeErrorEnum.NOT_FOUND).json(null);
				case error instanceof DatabaseError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),

	delete: asyncRequestHandler<DeleteDeath>(async (request, response) => {
		const { params } = request;

		try {
			const deleteDeathBean = fromDeleteDeathDtoToDeleteDeathBean(params);

			await deathService.deleteDeath(deleteDeathBean);

			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(null);
		} catch (error) {
			void handleBaseError(error);
			switch (true) {
				case error instanceof NotFoundError:
					return response.status(HttpStatutCodeErrorEnum.NOT_FOUND).json(null);
				case error instanceof DatabaseError:
				default:
					return response
						.status(HttpStatutCodeErrorEnum.SERVER_ERROR)
						.json(null);
			}
		}
	}),
};
