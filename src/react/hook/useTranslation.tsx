import { useMemo } from "react";

import { LanguageEnum } from "../../common/language/language.enum.ts";

type TranslationRecord<T> = Record<LanguageEnum, T>;

const useCurrentLanguage = (): LanguageEnum => {
	return LanguageEnum.FRENCH;
};

export function useTranslation<T>(translations: TranslationRecord<T>): T {
	const language = useCurrentLanguage();

	return useMemo(() => {
		return translations[language];
	}, [translations, language]);
}
