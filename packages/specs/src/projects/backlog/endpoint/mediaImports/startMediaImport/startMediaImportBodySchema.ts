import { z } from "zod";

import { mediaImportEntryListSchema } from "../../../schema/mediaImportEntryListSchema.ts";

export const startMediaImportBodySchema = z.object({
	entries: mediaImportEntryListSchema("Entries"),
});
