import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";

export const setDlcDoneBodySchema = z.object({
	isDone: booleanSchema("Is done"),
});
