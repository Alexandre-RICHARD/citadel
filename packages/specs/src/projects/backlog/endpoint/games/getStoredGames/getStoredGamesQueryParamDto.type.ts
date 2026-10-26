import type { z } from "zod";

import type { getStoredGamesQueryParamSchema } from "./getStoredGamesQueryParamSchema.ts";

// Les valeurs telles que le front les envoie : texte, ou nombre pour une page
export type GetStoredGamesQueryParamDto = z.infer<
	typeof getStoredGamesQueryParamSchema
>;
