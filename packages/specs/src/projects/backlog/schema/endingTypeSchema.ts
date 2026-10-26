import { z } from "zod";

import { EndingTypeEnum } from "../enum/endingType.enum.ts";

export const endingTypeSchema = z.enum(EndingTypeEnum, {
	message: `Ending type should be one of: ${Object.values(EndingTypeEnum).join(", ")}`,
});
