import type { LanguageCodeEnum } from "../../enums/languageCode.enum";
import type { TranslationsType } from "../../types/translations.type";
import type { TranslationsObjectType } from "../../types/translationsObject.type";

type Args = {
  filesContexts: Record<string, () => Promise<unknown>>;
  language: LanguageCodeEnum;
};

export const getTranslationsFiles = async ({
  filesContexts,
  language,
}: Args): Promise<TranslationsType> => {
  const translationsFiles = {} as TranslationsType;

  await Promise.all(
    Object.entries(filesContexts).map(async ([filePath]) => {
      const pathSplitted = filePath.split("/");
      const filePathLanguage = pathSplitted[
        pathSplitted.length - 2
      ] as LanguageCodeEnum;

      if (language === filePathLanguage) {
        try {
          const file = (await filesContexts[filePath]()) as {
            default: TranslationsObjectType;
          };
          const fileName = pathSplitted[pathSplitted.length - 1].split(".")[0];

          if (fileName) {
            translationsFiles[fileName] = file.default;
          } else {
            throw new Error("Unable to access file path to extract file name");
          }
        } catch (error) {
          console.error(error);
        }
      }
    }),
  );
  return translationsFiles;
};
