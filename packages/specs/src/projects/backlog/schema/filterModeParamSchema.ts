import { z } from "zod";

import { FilterModeEnum } from "../enum/filterMode.enum.ts";

// Combinaison des filtres dans la query, écrite comme dans l'URL de la page (`and` ou `or`) ; « et » sans ce paramètre
export const filterModeParamSchema = z
	.enum(FilterModeEnum, { message: "Filter mode should be and or or" })
	.default(FilterModeEnum.AND);
