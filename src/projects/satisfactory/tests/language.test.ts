// TODO T =>
// ? Remettre en place les tests de changement de langue
// ? Mettre en place des tests pour définir que chaque traduction est égale pour chaque fichier
// import { CookieHelper, LanguageEnum } from "@nexus/nexusExporter";
import { expect, test } from "vitest";

// import { supportedLanguages } from "../dictionnaries/supportedLanguages";
// import { CookieEnum } from "../enums/cookie.enum";
// // import { TranslationHelper as T } from "../helper/translation.helper";
// import { getState, useCombinedStore } from "../store/combined.store";

// ("State language should be valid language", () => {
//   const currentLanguage = getState().language;
//   expect(Object.values(LanguageEnum).includes(currentLanguage)).toBeTruthy();
// });

test("True", () => {
  expect(true).toBeTruthy();
});

// ("Translation should be found", () => {
//   // const key = "selectLanguage";
//   // const currentLanguage = getState().language;
//   // const translation = T.getT(currentLanguage, key);
//   // expect(translation).not.toBe(key);
//   expect(true).toBeTruthy();
// });

// ("Change language", () => {
//   useCombinedStore.setState({ language: LanguageEnum.ENGLISH });
//   const newLanguageEN = getState().language;
//   const cookieLanguage = CookieHelper.getCookie(CookieEnum.LANG);
//   expect(newLanguageEN === cookieLanguage);
//   expect(newLanguageEN).toBe(LanguageEnum.ENGLISH);
//   useCombinedStore.setState({ language: LanguageEnum.FRENCH });
//   const newLanguageFR = getState().language;
//   expect(newLanguageFR).toBe(LanguageEnum.FRENCH);
// });

// ("Supported languages should be include in languagesEnum", () => {
//   const languagesEnumKey = Object.values(LanguageEnum);
//   const areSupportedLanguageExists = supportedLanguages.every((languageKey) =>
//     languagesEnumKey.includes(languageKey),
//   );

//   expect(areSupportedLanguageExists).toBeTruthy();
// });
