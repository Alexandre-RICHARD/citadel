import type { CreateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBoss.endpoint.ts";
import type { GetOneBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBoss.endpoint.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { handleBaseError } from "../../../error/handleBaseError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { fromBossBeanToBossDto } from "../mapper/dtoBean/boss/fromBossBeanToBossDto.ts";
import { fromBossSummaryBeanToBossSummaryDto } from "../mapper/dtoBean/boss/fromBossSummaryBeanToBossSummaryDto.ts";
import { fromCreateBossDtoToCreateBossBean } from "../mapper/dtoBean/boss/fromCreateBossDtoToCreateBossBean.ts";
import { fromGetOneBossDtoToGetOneBossBean } from "../mapper/dtoBean/boss/fromGetOneBossDtoToGetOneBossBean.ts";
import { bossService } from "../service/boss.service.ts";

export const bossController = {
	getOne: asyncRequestHandler<GetOneBoss>(async (request, response) => {
		const { params } = request;

		try {
			const getOneBossBean = fromGetOneBossDtoToGetOneBossBean(params);

			const boss = await bossService.getOneBoss(getOneBossBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromBossBeanToBossDto(boss));
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

	create: asyncRequestHandler<CreateBoss>(async (request, response) => {
		const { body } = request;

		try {
			const createBossBean = fromCreateBossDtoToCreateBossBean(body);

			const boss = await bossService.createBoss(createBossBean);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromBossSummaryBeanToBossSummaryDto(boss));
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
