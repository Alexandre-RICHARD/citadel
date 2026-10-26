import { bodyIdListSchema } from "../../../specUtils/schemaValidator/id/bodyIdListSchema.ts";
import { bodyIdSchema } from "../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { platformIdSchema } from "./platformIdSchema.ts";
import { userVersionDataSchema } from "./userVersionDataSchema.ts";

// Une nouvelle version jouée : la version et la plateforme, puis toutes les données pré-remplies (cahier des charges, §8)
export const newUserVersionSchema = userVersionDataSchema.extend({
	versionId: bodyIdSchema("Version ID"),
	platformId: platformIdSchema("Platform ID"),
	doneDlcIds: bodyIdListSchema("Done DLC IDs"),
});
