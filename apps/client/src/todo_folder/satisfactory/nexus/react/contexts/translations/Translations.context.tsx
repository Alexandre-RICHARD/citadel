import { createContext } from "react";

import type { TranslationsType } from "../../../types/translations.type";

export const TranslationsContext = createContext<TranslationsType>({});
