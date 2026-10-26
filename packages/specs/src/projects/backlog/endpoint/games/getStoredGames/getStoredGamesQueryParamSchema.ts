import { z } from "zod";

import { queryParamPageSchema } from "../../../../../specUtils/schemaValidator/number/queryParamPageSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

// `query` vide ou absente : tous les jeux hors backlog
export const getStoredGamesQueryParamSchema = z.object({
	query: z
		.string({ message: "Query should be a string" })
		.trim()
		.max(SqlColumnMaxLengthEnum.VARCHAR_255, {
			message: `Query should contain at most ${SqlColumnMaxLengthEnum.VARCHAR_255} characters`,
		})
		.default(""),
	page: queryParamPageSchema("Page"),
});
