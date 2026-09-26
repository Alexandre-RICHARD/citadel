import { languageDictionnary } from "../../language/language.dictionnary";
import { LanguageEnum } from "../../language/language.enum";

export function formatDate(dateString: Date, locale: LanguageEnum): string {
	const date = new Date(dateString);

	if (Number.isNaN(date.getTime())) {
		return "Date au format invalide";
	}

	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	};

	const localeCode = languageDictionnary[LanguageEnum[locale]].longCode;
	return new Intl.DateTimeFormat(localeCode, options).format(date);
}
