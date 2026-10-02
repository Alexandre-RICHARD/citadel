import type { AddDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathEndpoint.interface.ts";
import type { DeleteDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeathEndpoint.interface.ts";
import type { UpdateDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromAddDeathDtoToAddDeathBean } from "../mapper/dtoBean/death/fromAddDeathDtoToAddDeathBean.ts";
import { fromDeathBeanToDeathDto } from "../mapper/dtoBean/death/fromDeathBeanToDeathDto.ts";
import { fromDeleteDeathDtoToDeleteDeathBean } from "../mapper/dtoBean/death/fromDeleteDeathDtoToDeleteDeathBean.ts";
import { fromUpdateDeathDtoToUpdateDeathBean } from "../mapper/dtoBean/death/fromUpdateDeathDtoToUpdateDeathBean.ts";
import { deathService } from "../service/deathService.ts";

export const deathController = {
	add: asyncRequestHandler<AddDeath>(async (request, response) => {
		const addDeathBean = fromAddDeathDtoToAddDeathBean(request.params);

		const death = await deathService.addDeath(addDeathBean);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromDeathBeanToDeathDto(death));
	}),

	update: asyncRequestHandler<UpdateDeath>(async (request, response) => {
		const updateDeathBean = fromUpdateDeathDtoToUpdateDeathBean(
			request.params,
			request.body,
		);

		const death = await deathService.updateDeath(updateDeathBean);

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromDeathBeanToDeathDto(death));
	}),

	delete: asyncRequestHandler<DeleteDeath>(async (request, response) => {
		const deleteDeathBean = fromDeleteDeathDtoToDeleteDeathBean(request.params);

		await deathService.deleteDeath(deleteDeathBean);

		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),
};
