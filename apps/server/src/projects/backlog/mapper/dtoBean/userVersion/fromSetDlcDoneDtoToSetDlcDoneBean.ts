import type { SetDlcDoneBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDoneBodyDto.type.ts";
import type { SetDlcDonePathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDonePathParamDto.type.ts";

import type { SetDlcDoneBean } from "../../../bean/setDlcDoneBean.type.ts";

export function fromSetDlcDoneDtoToSetDlcDoneBean(
	pathParamDto: SetDlcDonePathParamDto,
	bodyDto: SetDlcDoneBodyDto,
): SetDlcDoneBean {
	return {
		userVersionId: pathParamDto.id,
		dlcId: pathParamDto.dlcId,
		isDone: bodyDto.isDone,
	};
}
