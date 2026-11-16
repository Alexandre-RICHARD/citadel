import { z } from "zod";

import { MediaTypeEnum } from "../enum/mediaType.enum.ts";

export const mediaTypeSchema = z.enum(MediaTypeEnum, {
	message: `Media type should be one of: ${Object.values(MediaTypeEnum).join(", ")}`,
});
