import type { CreateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossEndpoint.interface.ts";
import type { DeleteBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/deleteBoss/deleteBossEndpoint.interface.ts";
import type { GetOneBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBossEndpoint.interface.ts";
import type { SetBossDefeated } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedEndpoint.interface.ts";
import type { UpdateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromBossBeanToBossDto } from "../mapper/dtoBean/boss/fromBossBeanToBossDto.ts";
import { fromBossSummaryBeanToBossSummaryDto } from "../mapper/dtoBean/boss/fromBossSummaryBeanToBossSummaryDto.ts";
import { fromCreateBossDtoToCreateBossBean } from "../mapper/dtoBean/boss/fromCreateBossDtoToCreateBossBean.ts";
import { fromDeleteBossDtoToDeleteBossBean } from "../mapper/dtoBean/boss/fromDeleteBossDtoToDeleteBossBean.ts";
import { fromGetOneBossDtoToGetOneBossBean } from "../mapper/dtoBean/boss/fromGetOneBossDtoToGetOneBossBean.ts";
import { fromSetBossDefeatedDtoToSetBossDefeatedBean } from "../mapper/dtoBean/boss/fromSetBossDefeatedDtoToSetBossDefeatedBean.ts";
import { fromUpdateBossDtoToUpdateBossBean } from "../mapper/dtoBean/boss/fromUpdateBossDtoToUpdateBossBean.ts";
import { bossService } from "../service/bossService.ts";

export const bossController = {
	getOne: protectedRequestHandler<GetOneBoss>(
		async (request, response, session) => {
			const getOneBossBean = fromGetOneBossDtoToGetOneBossBean(request.params);

			const boss = await bossService.getOneBoss(session.userId, getOneBossBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromBossBeanToBossDto(boss));
		},
	),

	create: protectedRequestHandler<CreateBoss>(
		async (request, response, session) => {
			const createBossBean = fromCreateBossDtoToCreateBossBean(
				request.params,
				request.body,
			);

			const boss = await bossService.createBoss(session.userId, createBossBean);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromBossSummaryBeanToBossSummaryDto(boss));
		},
	),

	update: protectedRequestHandler<UpdateBoss>(
		async (request, response, session) => {
			const updateBossBean = fromUpdateBossDtoToUpdateBossBean(
				request.params,
				request.body,
			);

			const boss = await bossService.updateBoss(session.userId, updateBossBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromBossSummaryBeanToBossSummaryDto(boss));
		},
	),

	setDefeated: protectedRequestHandler<SetBossDefeated>(
		async (request, response, session) => {
			const setBossDefeatedBean = fromSetBossDefeatedDtoToSetBossDefeatedBean(
				request.params,
				request.body,
			);

			const boss = await bossService.setBossDefeated(
				session.userId,
				setBossDefeatedBean,
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromBossSummaryBeanToBossSummaryDto(boss));
		},
	),

	delete: protectedRequestHandler<DeleteBoss>(
		async (request, response, session) => {
			const deleteBossBean = fromDeleteBossDtoToDeleteBossBean(request.params);

			await bossService.deleteBoss(session.userId, deleteBossBean);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
