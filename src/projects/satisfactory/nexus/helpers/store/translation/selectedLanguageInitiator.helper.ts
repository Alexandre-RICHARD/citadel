import { languageToCode } from "../../../dictionnaries/languageToCode.dictionnary";
import type { LanguageEnum } from "../../../enums/language.enum";
import type { LanguageCodeEnum } from "../../../enums/languageCode.enum";
import { getCookie } from "../../cookie/getCookie.helper";
import { setCookie } from "../../cookie/setCookie.helper";
import { getInvertObject } from "../../data/object/getInvertObject.helper";
import { getIsSupportedLanguage } from "../../translation/getIsSupportedLanguage.helper";

type Args = {
  supportedLanguages: LanguageEnum[];
  cookieName: string;
  defaultLanguage: LanguageEnum;
};

export const selectedLanguageInitiator = ({
  supportedLanguages,
  cookieName,
  defaultLanguage,
}: Args): LanguageCodeEnum => {
  let storedLanguage = getCookie(cookieName) as LanguageCodeEnum;
  const storedLanguageName = getInvertObject(languageToCode)[
    storedLanguage
  ] as LanguageEnum;

  if (!getIsSupportedLanguage(supportedLanguages, storedLanguageName)) {
    storedLanguage = languageToCode[defaultLanguage] as LanguageCodeEnum;
    setCookie({ name: cookieName, value: storedLanguage, hours: 24 * 365 });
  }
  return storedLanguage;
};
