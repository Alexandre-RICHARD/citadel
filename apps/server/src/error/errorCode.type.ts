import type { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import type { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import type { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum.ts";
import type { GameDeathCounterErrorCodeEnum } from "@citadel/specs/src/projects/gameDeathCounter/error/gameDeathCounterErrorCode.enum.ts";
import type { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum.ts";
import type { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";

// Tout code qu'une réponse d'erreur peut porter : un nouveau projet y ajoute son enum de codes métier
export type ErrorCode =
	| TechnicalErrorCodeEnum
	| GameDeathCounterErrorCodeEnum
	| BacklogErrorCodeEnum
	| MailErrorCodeEnum
	| ContactErrorCodeEnum
	| AuthErrorCodeEnum;
