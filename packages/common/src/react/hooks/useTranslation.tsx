import { useMemo } from "react";

import { LanguageEnum } from "../../universal/language/language.enum.ts";

type TranslationRecord<T> = Record<LanguageEnum, T>;

function useCurrentLanguage(): LanguageEnum {
	return LanguageEnum.FRENCH;
}

export function useTranslation<T>(translations: TranslationRecord<T>): T {
	const language = useCurrentLanguage();

	return useMemo(() => {
		return translations[language];
	}, [translations, language]);
}
