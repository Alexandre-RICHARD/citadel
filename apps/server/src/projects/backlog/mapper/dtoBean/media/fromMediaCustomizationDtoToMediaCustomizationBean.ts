import type { mediaCustomizationSchema } from "@citadel/specs/src/projects/backlog/schema/mediaCustomizationSchema.ts";
import type { z } from "zod";

import type { MediaCustomizationBean } from "../../../bean/mediaCustomizationBean.type.ts";

export function fromMediaCustomizationDtoToMediaCustomizationBean(
	dto: z.infer<typeof mediaCustomizationSchema>,
): MediaCustomizationBean {
	return {
		imagePath: dto.imagePath,
		saga: dto.saga,
		sagaNumber: dto.sagaNumber,
	};
}
