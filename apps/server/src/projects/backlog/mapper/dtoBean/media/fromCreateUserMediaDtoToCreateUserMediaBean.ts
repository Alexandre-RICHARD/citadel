import type { CreateUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaBodyDto.type.ts";

import type { CreateUserMediaBean } from "../../../bean/createUserMediaBean.type.ts";
import { fromMediaCustomizationDtoToMediaCustomizationBean } from "./fromMediaCustomizationDtoToMediaCustomizationBean.ts";

export function fromCreateUserMediaDtoToCreateUserMediaBean(
	bodyDto: CreateUserMediaBodyDto,
): CreateUserMediaBean {
	return {
		mediaType: bodyDto.mediaType,
		tmdbId: bodyDto.tmdbId,
		customization: fromMediaCustomizationDtoToMediaCustomizationBean(
			bodyDto.customization,
		),
	};
}
