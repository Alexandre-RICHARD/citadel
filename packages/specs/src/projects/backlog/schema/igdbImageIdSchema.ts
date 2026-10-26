import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";
import { z } from "zod";

import { SqlColumnMaxLengthEnum } from "../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

// image_id d'une image IGDB (« co1tnw ») : seule la référence est stockée, l'URL se construit à l'affichage
export function igdbImageIdSchema(label: string) {
	return z
		.string({ message: `${label} should be a string` })
		.max(SqlColumnMaxLengthEnum.VARCHAR_100, {
			message: `${label} should contain at most ${SqlColumnMaxLengthEnum.VARCHAR_100} characters`,
		})
		.regex(regexDictionary.igdbImageId, {
			message: `${label} should only contain lowercase letters and digits`,
		});
}
