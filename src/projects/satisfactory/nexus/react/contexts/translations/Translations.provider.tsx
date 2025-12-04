import React, { type Context, useEffect, useState } from "react";

import type { LanguageCodeEnum } from "../../../enums/languageCode.enum";
import { getTranslationsFiles } from "../../../helpers/translation/getTranslationsFiles.helper";
import type { TranslationsType } from "../../../types/translations.type";

type PropsType = {
	TranslationsContext: Context<TranslationsType>;
	filesContexts: Record<string, () => Promise<unknown>>;
	language: LanguageCodeEnum;
	children: React.JSX.Element;
};

export function TranslationProvider({
	TranslationsContext,
	filesContexts,
	language,
	children,
}: PropsType): React.JSX.Element {
	const [translations, setTranslations] = useState<TranslationsType>({});

	useEffect(() => {
		const fetchData = async () => {
			try {
				setTranslations(
					await getTranslationsFiles({ filesContexts, language }),
				);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData()
			.then((translationsFile) => translationsFile)
			.catch((error) => console.error(error));
	}, [filesContexts, language]);

	return (
		<TranslationsContext.Provider value={translations}>
			{children}
		</TranslationsContext.Provider>
	);
}
