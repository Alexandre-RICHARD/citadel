import { createModelExportTable } from "../../../common/archive/createModelExportTable.ts";
import type { ExportTable } from "../../../common/archive/exportTable.type.ts";
import { AuthEvent } from "../models/AuthEvent.ts";
import { Factor } from "../models/Factor.ts";
import { Flow } from "../models/Flow.ts";
import { RecoveryCode } from "../models/RecoveryCode.ts";
import { Session } from "../models/Session.ts";
import { User } from "../models/User.ts";

/**
 * Les tables de l'authentification dans l'export, avec les seules colonnes sans secret : ni hash du mot de passe, ni
 * empreinte de jeton, de code ou de code de secours, ni secret TOTP, ni contenu de parcours (qui garde un hash de mot de
 * passe pendant une inscription)
 */
export const authExportTables: readonly ExportTable[] = [
	createModelExportTable({
		tableName: "auth_user",
		model: User,
		ownerAttribute: "id",
		columns: [
			"id",
			"email",
			"username",
			"displayName",
			"passwordChangedAt",
			"loginMethods",
			"lastLoginAt",
			"lastSeenAt",
			"createdAt",
			"updatedAt",
		],
	}),
	createModelExportTable({
		tableName: "auth_session",
		model: Session,
		ownerAttribute: "userId",
		columns: [
			"id",
			"remember",
			"userAgent",
			"ip",
			"lastSeenAt",
			"expiresAt",
			"absoluteExpiresAt",
			"createdAt",
		],
	}),
	createModelExportTable({
		tableName: "auth_factor",
		model: Factor,
		ownerAttribute: "userId",
		columns: ["id", "type", "name", "lastUsedAt", "confirmedAt", "createdAt"],
	}),
	createModelExportTable({
		tableName: "auth_recovery_code",
		model: RecoveryCode,
		ownerAttribute: "userId",
		columns: ["id", "usedAt", "createdAt"],
	}),
	createModelExportTable({
		tableName: "auth_event",
		model: AuthEvent,
		ownerAttribute: "userId",
		columns: ["id", "type", "ip", "userAgent", "createdAt"],
	}),
	createModelExportTable({
		tableName: "auth_flow",
		model: Flow,
		ownerAttribute: "userId",
		columns: [
			"id",
			"kind",
			"step",
			"email",
			"attempts",
			"sendCount",
			"remember",
			"lastSentAt",
			"expiresAt",
			"createdAt",
		],
	}),
];
