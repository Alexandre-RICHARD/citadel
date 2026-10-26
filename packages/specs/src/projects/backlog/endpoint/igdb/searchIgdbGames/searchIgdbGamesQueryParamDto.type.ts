import type { z } from "zod";

import type { searchIgdbGamesQueryParamSchema } from "./searchIgdbGamesQueryParamSchema.ts";

// Les valeurs telles que le front les envoie : texte, ou nombre pour une page
export type SearchIgdbGamesQueryParamDto = z.infer<
	typeof searchIgdbGamesQueryParamSchema
>;
