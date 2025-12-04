import type { TranslationsFilesEnum } from "../../enums/translationsFile.enum";
import { useTranslations } from "../../nexus/react/hooks/useTranslations.hook";

export const useCustomTranslations = () => {
	const Nt = useTranslations();

	// TODO A => implémenter la logique d'une traductions ici
	const t = (files: TranslationsFilesEnum, key: string) => {
		const myTranslations = Nt(files as string, key);
		return myTranslations;
	};

	return t;
};
