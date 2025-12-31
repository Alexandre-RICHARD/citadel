import React from "react";
import { useShallow } from "zustand/react/shallow";

import { supportedLanguages } from "../../../dictionnaries/supportedLanguages.dictionnary";
import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { languageToCode } from "../../../nexus/dictionnaries/languageToCode.dictionnary";
import { languageToCountry } from "../../../nexus/dictionnaries/languageToCountry.dictionnary";
import { nativeLanguageNames } from "../../../nexus/dictionnaries/nativeLanguageNames.dictionnary";
import type { LanguageEnum } from "../../../nexus/enums/language.enum";
import type { LanguageCodeEnum } from "../../../nexus/enums/languageCode.enum";
import { getSortStringValue } from "../../../nexus/helpers/data/getSortStringValue.helper";
import { getInvertObject } from "../../../nexus/helpers/data/object/getInvertObject.helper";
import { LabelWithIcon } from "../../../nexus/react/components/LabelWithIcon";
import { Selector } from "../../../nexus/react/components/Selector";
import type { SelectItemsType } from "../../../nexus/types/react/selectedItems.type";
import { useCombinedStore } from "../../../store/combined.store";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import { LanguageSelectorFlag } from "../LanguageSelectorFlag";
import styles from "./styles.module.scss";

export function LanguagesSelector(): React.JSX.Element {
	const t = useCustomTranslations();

	const [language, setLanguage] = useCombinedStore(
		useShallow((state) => [state.language, state.setLanguage]),
	);

	const storedLanguageName = getInvertObject(languageToCode)[
		language
	] as LanguageEnum;

	const languagesSelectOption: SelectItemsType[] = supportedLanguages
		.sort((languageA, languageB) => {
			const stringA = t(TF.LANGUAGES, languageA);
			const stringB = t(TF.LANGUAGES, languageB);
			return getSortStringValue(stringA, stringB);
		})
		.map((oneLanguage) => {
			const country = languageToCountry[oneLanguage];
			const code = languageToCode[oneLanguage] as LanguageCodeEnum;

			const translatedLanguage = t(TF.LANGUAGES, oneLanguage);
			const nativeLanguageName = nativeLanguageNames[oneLanguage];
			return {
				label: (
					<LabelWithIcon
						key={oneLanguage}
						image={<LanguageSelectorFlag country={country} />}
						label={
							<div className={styles.dropdown_language_label}>
								<p>{translatedLanguage}</p>
								{language !== code && <span>({nativeLanguageName})</span>}
							</div>
						}
						position="left"
					/>
				),
				search: `${translatedLanguage} (${nativeLanguageName})`,
				value: code,
			};
		});

	return (
		<Selector
			id="language"
			label={
				<LabelWithIcon
					image={
						<LanguageSelectorFlag
							country={languageToCountry[storedLanguageName]}
						/>
					}
					label={<p>{language.toUpperCase()}</p>}
					position="left"
				/>
			}
			items={languagesSelectOption}
			selectedItem={language}
			position="bottom-right"
			onSelect={(item) => setLanguage(item as LanguageCodeEnum)}
		/>
	);
}
