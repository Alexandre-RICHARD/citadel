import { z } from "zod";

import { booleanSchema } from "../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { isoDateSchema } from "../../../specUtils/schemaValidator/date/isoDateSchema.ts";
import { boundedIntegerSchema } from "../../../specUtils/schemaValidator/number/boundedIntegerSchema.ts";
import { SqlIntegerBoundEnum } from "../../../specUtils/schemaValidator/number/sqlIntegerBound.enum.ts";
import { nullableStringSchema } from "../../../specUtils/schemaValidator/string/nullableStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";
import { statusSchema } from "./statusSchema.ts";

const MAX_RATING = 20;

// Les données de jeu d'une version jouée, modifiables dans le tableau
export const userVersionDataSchema = z.object({
	status: statusSchema,
	isOwned: booleanSchema("Is owned"),
	isUpNext: booleanSchema("Is up next"),
	finishDate: isoDateSchema("Finish date").nullable(),
	sureFinishCount: boundedIntegerSchema(
		"Sure finish count",
		0,
		SqlIntegerBoundEnum.MAX,
	),
	probableFinishCount: boundedIntegerSchema(
		"Probable finish count",
		0,
		SqlIntegerBoundEnum.MAX,
	),
	trackedPlayTimeMinutes: boundedIntegerSchema(
		"Tracked play time",
		0,
		SqlIntegerBoundEnum.MAX,
	),
	estimatedPlayTimeMinutes: boundedIntegerSchema(
		"Estimated play time",
		0,
		SqlIntegerBoundEnum.MAX,
	),
	rating: boundedIntegerSchema("Rating", 0, MAX_RATING).nullable(),
	comment: nullableStringSchema("Comment", SqlColumnMaxLengthEnum.TEXT),
});
