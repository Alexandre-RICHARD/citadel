import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type UserRow = {
	id: number;
	email: string;
	username: string;
	displayName: string | null;
	passwordHash: string;
	passwordChangedAt: Date;
	loginMethods: string;
	lastLoginAt: Date | null;
	lastSeenAt: Date | null;
};

type FlowRow = {
	id: number;
	tokenHash: Buffer;
	kind: string;
	step: string;
	userId: number | null;
	email: string;
	// Le driver rend le JSON déjà parsé
	payload: unknown;
	codeHmac: Buffer | null;
	linkTokenHash: Buffer | null;
	attempts: number;
	sendCount: number;
	remember: number;
	lastSentAt: Date | null;
	expiresAt: Date;
};

type SessionRow = {
	id: number;
	userId: number;
	tokenHash: Buffer;
	remember: number;
	userAgent: string | null;
	ip: string;
	lastSeenAt: Date;
	expiresAt: Date;
	absoluteExpiresAt: Date;
};

type FactorRow = {
	id: number;
	userId: number;
	type: string;
	name: string;
	secretEncrypted: Buffer | null;
	keyVersion: number | null;
	lastUsedStep: number | null;
	lastUsedAt: Date | null;
};

type RecoveryCodeRow = {
	id: number;
	userId: number;
	codeHash: Buffer;
	usedAt: Date | null;
};

type EventRow = {
	id: number;
	userId: number | null;
	type: string;
	ip: string;
	userAgent: string | null;
};

// Les tables de l'auth dont chaque ligne appartient à un compte
type UserOwnedTable =
	| "auth_session"
	| "auth_flow"
	| "auth_factor"
	| "auth_recovery_code"
	| "auth_event";

// Lectures en SQL brut : vérifient les vraies colonnes, indépendamment du mapping des modèles
export const selectAuthRows = {
	async rowIdsByUserId(
		tableName: UserOwnedTable,
		userId: number,
	): Promise<number[]> {
		const rows = await sequelize.query<{ id: number }>(
			`SELECT id FROM \`${tableName}\` WHERE user_id = :userId ORDER BY id`,
			{ type: QueryTypes.SELECT, replacements: { userId } },
		);
		return rows.map((row) => row.id);
	},

	async session(id: number): Promise<SessionRow | null> {
		return sequelize.query<SessionRow>(
			`SELECT id, user_id AS userId, token_hash AS tokenHash, remember, user_agent AS userAgent, ip,
				last_seen_at AS lastSeenAt, expires_at AS expiresAt, absolute_expires_at AS absoluteExpiresAt
			FROM auth_session
			WHERE id = :id`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
		);
	},

	async factor(id: number): Promise<FactorRow | null> {
		return sequelize.query<FactorRow>(
			`SELECT id, user_id AS userId, type, name, secret_encrypted AS secretEncrypted, key_version AS keyVersion,
				last_used_step AS lastUsedStep, last_used_at AS lastUsedAt
			FROM auth_factor
			WHERE id = :id`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
		);
	},

	async recoveryCode(id: number): Promise<RecoveryCodeRow | null> {
		return sequelize.query<RecoveryCodeRow>(
			`SELECT id, user_id AS userId, code_hash AS codeHash, used_at AS usedAt
			FROM auth_recovery_code
			WHERE id = :id`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
		);
	},

	async event(id: number): Promise<EventRow | null> {
		return sequelize.query<EventRow>(
			`SELECT id, user_id AS userId, type, ip, user_agent AS userAgent
			FROM auth_event
			WHERE id = :id`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
		);
	},

	async flow(id: number): Promise<FlowRow | null> {
		return sequelize.query<FlowRow>(
			`SELECT id, token_hash AS tokenHash, kind, step, user_id AS userId, email, payload, code_hmac AS codeHmac,
				link_token_hash AS linkTokenHash, attempts, send_count AS sendCount, remember, last_sent_at AS lastSentAt,
				expires_at AS expiresAt
			FROM auth_flow
			WHERE id = :id`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
		);
	},

	async flowIdsByEmail(email: string): Promise<number[]> {
		const rows = await sequelize.query<{ id: number }>(
			"SELECT id FROM auth_flow WHERE email = :email ORDER BY id",
			{ type: QueryTypes.SELECT, replacements: { email } },
		);
		return rows.map((row) => row.id);
	},

	async user(id: number): Promise<UserRow | null> {
		return sequelize.query<UserRow>(
			`SELECT id, email, username, display_name AS displayName, password_hash AS passwordHash,
				password_changed_at AS passwordChangedAt, login_methods AS loginMethods, last_login_at AS lastLoginAt,
				last_seen_at AS lastSeenAt
			FROM auth_user
			WHERE id = :id`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
		);
	},

	async userIdsByEmail(email: string): Promise<number[]> {
		const rows = await sequelize.query<{ id: number }>(
			"SELECT id FROM auth_user WHERE email = :email ORDER BY id",
			{ type: QueryTypes.SELECT, replacements: { email } },
		);
		return rows.map((row) => row.id);
	},
};
