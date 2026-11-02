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
