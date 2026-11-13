import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import type { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

// Tous les statuts valent pour tous les types de fin ; un statut de fin exige seulement d'en avoir un
export function isStatusAllowed(
	status: StatusEnum,
	endingType: EndingTypeEnum | null,
): boolean {
	return endingType !== null || !isFinishedStatus(status);
}
