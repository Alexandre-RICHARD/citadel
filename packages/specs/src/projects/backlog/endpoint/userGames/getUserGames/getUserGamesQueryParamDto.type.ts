import type { z } from "zod";

import type { getUserGamesQueryParamSchema } from "./getUserGamesQueryParamSchema.ts";

// Les valeurs telles que le front les envoie : texte, ou nombre pour une page
export type GetUserGamesQueryParamDto = z.infer<
	typeof getUserGamesQueryParamSchema
>;
