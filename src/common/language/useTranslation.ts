import { useMemo } from "react";

import { LanguageEnum } from "./language.enum";

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
