import {
  getInvertObject,
  getSortStringValue,
  LabelWithIcon,
  type LanguageCodeEnum,
  type LanguageEnum,
  languageToCode,
  languageToCountry,
  nativeLanguageNames,
  type SelectItemsType,
  Selector,
} from "@nexus/nexusExporter";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { supportedLanguages } from "../../../dictionnaries/supportedLanguages.dictionnary";
import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { useCombinedStore } from "../../../store/combined.store";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import { LanguageSelectorFlag } from "../LanguageSelectorFlag";
import styles from "./styles.module.scss";

export const LanguagesSelector = (): React.JSX.Element => {
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
};
