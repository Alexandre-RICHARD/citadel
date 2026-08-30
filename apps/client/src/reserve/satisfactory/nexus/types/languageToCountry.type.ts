import type { CountryEnum } from "../enums/country.enum";
import type { LanguageEnum } from "../enums/language.enum";

export type LanguageToCountryType = Record<LanguageEnum, CountryEnum>;
