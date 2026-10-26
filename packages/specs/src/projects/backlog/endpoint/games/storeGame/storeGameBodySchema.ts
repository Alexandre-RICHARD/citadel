import { z } from "zod";

import { bodyIdListSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdListSchema.ts";
import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";

// `igdbId` : la fiche originale ; `versionIds` : les autres versions cochées, l'originale est toujours enregistrée
export const storeGameBodySchema = z.object({
	igdbId: bodyIdSchema("IGDB ID"),
	versionIds: bodyIdListSchema("Version IDs"),
	dlcIds: bodyIdListSchema("DLC IDs"),
});
