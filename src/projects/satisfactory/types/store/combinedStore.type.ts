import type { CalculatorSliceType } from "./storeSlices/calculator.type";
import type { TranslationSliceType } from "./storeSlices/translations.type";

export type CombinedStoreType = TranslationSliceType & CalculatorSliceType;
