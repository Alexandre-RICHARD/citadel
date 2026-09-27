import type { CreateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBoss.endpoint.ts";
import type { DeleteBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/deleteBoss/deleteBoss.endpoint.ts";
import type { GetOneBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBoss.endpoint.ts";
import type { SetBossDefeated } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeated.endpoint.ts";
import type { UpdateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBoss.endpoint.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromBossBeanToBossDto } from "../mapper/dtoBean/boss/fromBossBeanToBossDto.ts";
import { fromBossSummaryBeanToBossSummaryDto } from "../mapper/dtoBean/boss/fromBossSummaryBeanToBossSummaryDto.ts";
import { fromCreateBossDtoToCreateBossBean } from "../mapper/dtoBean/boss/fromCreateBossDtoToCreateBossBean.ts";
import { fromDeleteBossDtoToDeleteBossBean } from "../mapper/dtoBean/boss/fromDeleteBossDtoToDeleteBossBean.ts";
import { fromGetOneBossDtoToGetOneBossBean } from "../mapper/dtoBean/boss/fromGetOneBossDtoToGetOneBossBean.ts";
import { fromSetBossDefeatedDtoToSetBossDefeatedBean } from "../mapper/dtoBean/boss/fromSetBossDefeatedDtoToSetBossDefeatedBean.ts";
import { fromUpdateBossDtoToUpdateBossBean } from "../mapper/dtoBean/boss/fromUpdateBossDtoToUpdateBossBean.ts";
import { bossService } from "../service/boss.service.ts";

export const bossController = {
	getOne: asyncRequestHandler<GetOneBoss>(async (request, response) => {
		const getOneBossBean = fromGetOneBossDtoToGetOneBossBean(request.params);

		const boss = await bossService.getOneBoss(getOneBossBean);

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromBossBeanToBossDto(boss));
	}),

	create: asyncRequestHandler<CreateBoss>(async (request, response) => {
		const createBossBean = fromCreateBossDtoToCreateBossBean(
			request.params,
			request.body,
		);

		const boss = await bossService.createBoss(createBossBean);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromBossSummaryBeanToBossSummaryDto(boss));
	}),

	update: asyncRequestHandler<UpdateBoss>(async (request, response) => {
		const updateBossBean = fromUpdateBossDtoToUpdateBossBean(
			request.params,
			request.body,
		);

		const boss = await bossService.updateBoss(updateBossBean);

		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromBossSummaryBeanToBossSummaryDto(boss));
	}),

	setDefeated: asyncRequestHandler<SetBossDefeated>(
		async (request, response) => {
			const setBossDefeatedBean = fromSetBossDefeatedDtoToSetBossDefeatedBean(
				request.params,
				request.body,
			);

			const boss = await bossService.setBossDefeated(setBossDefeatedBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromBossSummaryBeanToBossSummaryDto(boss));
		},
	),

	delete: asyncRequestHandler<DeleteBoss>(async (request, response) => {
		const deleteBossBean = fromDeleteBossDtoToDeleteBossBean(request.params);

		await bossService.deleteBoss(deleteBossBean);

		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),
};
