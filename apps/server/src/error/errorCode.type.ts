import type { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import type { TestErrorCodeEnum } from "@citadel/specs/src/projects/test/error/testErrorCode.enum.ts";
import type { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";

// Tout code qu'une réponse d'erreur peut porter : un nouveau projet y ajoute son enum de codes métier
export type ErrorCode =
	TechnicalErrorCodeEnum | GameDeathCounterErrorCodeEnum | TestErrorCodeEnum;
