import type { LanguageEnum } from "../language/language.enum.ts";
import { languageDictionary } from "../language/languageDictionary.ts";

export function formatDate(date: Date, locale: LanguageEnum): string {
	const parsedDate = new Date(date);

	if (Number.isNaN(parsedDate.getTime())) {
		return "Date au format invalide";
	}

	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	};

	const localeCode = languageDictionary[locale].longCode;
	return new Intl.DateTimeFormat(localeCode, options).format(parsedDate);
}
