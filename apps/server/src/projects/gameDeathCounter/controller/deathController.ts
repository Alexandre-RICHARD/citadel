import type { AddDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathEndpoint.interface.ts";
import type { DeleteDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeathEndpoint.interface.ts";
import type { UpdateDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromAddDeathDtoToAddDeathBean } from "../mapper/dtoBean/death/fromAddDeathDtoToAddDeathBean.ts";
import { fromDeathBeanToDeathDto } from "../mapper/dtoBean/death/fromDeathBeanToDeathDto.ts";
import { fromDeleteDeathDtoToDeleteDeathBean } from "../mapper/dtoBean/death/fromDeleteDeathDtoToDeleteDeathBean.ts";
import { fromUpdateDeathDtoToUpdateDeathBean } from "../mapper/dtoBean/death/fromUpdateDeathDtoToUpdateDeathBean.ts";
import { deathService } from "../service/deathService.ts";

export const deathController = {
	add: protectedRequestHandler<AddDeath>(async (request, response, session) => {
		const addDeathBean = fromAddDeathDtoToAddDeathBean(request.params);

		const death = await deathService.addDeath(session.userId, addDeathBean);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromDeathBeanToDeathDto(death));
	}),

	update: protectedRequestHandler<UpdateDeath>(
		async (request, response, session) => {
			const updateDeathBean = fromUpdateDeathDtoToUpdateDeathBean(
				request.params,
				request.body,
			);

			const death = await deathService.updateDeath(
				session.userId,
				updateDeathBean,
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromDeathBeanToDeathDto(death));
		},
	),

	delete: protectedRequestHandler<DeleteDeath>(
		async (request, response, session) => {
			const deleteDeathBean = fromDeleteDeathDtoToDeleteDeathBean(
				request.params,
			);

			await deathService.deleteDeath(session.userId, deleteDeathBean);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
