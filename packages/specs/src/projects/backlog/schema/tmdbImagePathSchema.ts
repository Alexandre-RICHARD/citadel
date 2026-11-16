import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";
import { z } from "zod";

import { SqlColumnMaxLengthEnum } from "../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

// Chemin d'une image TMDB (« /abc.jpg ») : seul le chemin est stocké, l'URL se construit à l'affichage
export function tmdbImagePathSchema(label: string) {
	return z
		.string({ message: `${label} should be a string` })
		.max(SqlColumnMaxLengthEnum.VARCHAR_100, {
			message: `${label} should contain at most ${SqlColumnMaxLengthEnum.VARCHAR_100} characters`,
		})
		.regex(regexDictionary.tmdbImagePath, {
			message: `${label} should be a TMDB image path, such as /abc.jpg`,
		});
}
