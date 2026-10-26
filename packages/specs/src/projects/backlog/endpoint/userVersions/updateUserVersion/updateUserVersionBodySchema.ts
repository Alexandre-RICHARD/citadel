import { requireAtLeastOneField } from "../../../../../specUtils/schemaValidator/object/requireAtLeastOneField.ts";
import { userVersionDataSchema } from "../../../schema/userVersionDataSchema.ts";

// Un statut au rang 5 ou plus passe « fois fini (sûr) » à 1 s'il est à 0, sauf si le corps fixe aussi ce compteur
export const updateUserVersionBodySchema = requireAtLeastOneField(
	userVersionDataSchema.partial(),
);
