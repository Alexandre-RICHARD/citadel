import { z } from "zod";

import { bodyIdSchema } from "../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { requiredStringSchema } from "../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";
import { SagaChoiceKindEnum } from "../enum/sagaChoiceKind.enum.ts";

// Saga choisie pour un média du backlog
export const sagaChoiceSchema = z.discriminatedUnion(
	"kind",
	[
		z.object({ kind: z.literal(SagaChoiceKindEnum.PROPOSED) }),
		z.object({
			kind: z.literal(SagaChoiceKindEnum.OTHER),
			sagaId: bodyIdSchema("Saga ID"),
		}),
		z.object({
			kind: z.literal(SagaChoiceKindEnum.NEW),
			name: requiredStringSchema(
				"Saga name",
				SqlColumnMaxLengthEnum.VARCHAR_255,
			),
		}),
		z.object({ kind: z.literal(SagaChoiceKindEnum.NONE) }),
	],
	{
		message: `Saga kind should be one of: ${Object.values(SagaChoiceKindEnum).join(", ")}`,
	},
);
