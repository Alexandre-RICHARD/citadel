import { z } from "zod";

import { bodyIdSchema } from "../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { requiredStringSchema } from "../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";
import { SeriesChoiceKindEnum } from "../enum/seriesChoiceKind.enum.ts";

// Série choisie pour un jeu du backlog
export const seriesChoiceSchema = z.discriminatedUnion(
	"kind",
	[
		z.object({ kind: z.literal(SeriesChoiceKindEnum.PROPOSED) }),
		z.object({
			kind: z.literal(SeriesChoiceKindEnum.OTHER),
			seriesId: bodyIdSchema("Series ID"),
		}),
		z.object({
			kind: z.literal(SeriesChoiceKindEnum.NEW),
			name: requiredStringSchema(
				"Series name",
				SqlColumnMaxLengthEnum.VARCHAR_255,
			),
		}),
		z.object({ kind: z.literal(SeriesChoiceKindEnum.NONE) }),
	],
	{
		message: `Series kind should be one of: ${Object.values(SeriesChoiceKindEnum).join(", ")}`,
	},
);
