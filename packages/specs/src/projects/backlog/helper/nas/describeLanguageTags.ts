import { LanguageTagEnum } from "../../enum/languageTag.enum.ts";
import type { NasFile } from "../../mediaState/nasFile.type.ts";

const FRENCH = "fr";

/**
 * Les étiquettes « Langues » d'un fichier (§5), d'après ses pistes et la langue originale du média (TMDB). Quand elle est
 * le français, VO et STVO ne s'affichent pas : VF et STFR disent déjà tout. Aucune piste audio de langue connue :
 * « Inconnue », pour ne pas la confondre avec un fichier sans VF
 */
export function describeLanguageTags(
	file: Pick<NasFile, "audioLanguages" | "subtitleLanguages">,
	originalLanguage: string | null,
): LanguageTagEnum[] {
	const isFrenchOriginal = originalLanguage === FRENCH;
	function hasOriginal(languages: string[]): boolean {
		return (
			originalLanguage !== null &&
			!isFrenchOriginal &&
			languages.includes(originalLanguage)
		);
	}
	const tags = [
		file.audioLanguages.includes(FRENCH) && LanguageTagEnum.VF,
		hasOriginal(file.audioLanguages) && LanguageTagEnum.VO,
		file.subtitleLanguages.includes(FRENCH) && LanguageTagEnum.STFR,
		hasOriginal(file.subtitleLanguages) && LanguageTagEnum.STVO,
		file.audioLanguages.length === 0 && LanguageTagEnum.UNKNOWN,
	];
	return tags.filter((tag) => tag !== false);
}
