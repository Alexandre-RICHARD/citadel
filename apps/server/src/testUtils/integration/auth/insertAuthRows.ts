import { randomBytes } from "node:crypto";

import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { buildUniqueWord } from "../buildUniqueWord.ts";

// Un SHA-256 ou un HMAC-SHA-256
const TOKEN_HASH_BYTES = 32;
const HOUR_MS = 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * HOUR_MS;

// Insertions directes en base, sans passer par l'API ni par les modèles, pour préparer un test
export const insertAuthRows = {
	// Renvoie l'id créé. Email et pseudo uniques par défaut : les comptes des autres tests restent en base
	async user(
		row: {
			email?: string;
			username?: string;
			passwordHash?: string;
			passwordChangedAt?: Date;
		} = {},
	): Promise<number> {
		const word = buildUniqueWord();
		const [insertedId] = await sequelize.query(
			`INSERT INTO auth_user (email, username, password_hash, password_changed_at)
			VALUES (:email, :username, :passwordHash, :passwordChangedAt)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					email: `${word}@example.com`,
					username: word,
					passwordHash: "argon2id:m=19456,t=2,p=1:c2Vs:aGFzaA",
					passwordChangedAt: new Date(),
					...row,
				},
			},
		);
		return insertedId;
	},

	// Renvoie l'id créé. Jeton tiré au hasard ; expire dans 1 h, 30 jours au plus, par défaut
	async session(row: {
		userId: number;
		tokenHash?: Buffer;
		expiresAt?: Date;
		absoluteExpiresAt?: Date;
	}): Promise<number> {
		const now = new Date();
		const [insertedId] = await sequelize.query(
			`INSERT INTO auth_session
				(user_id, token_hash, remember, user_agent, ip, last_seen_at, expires_at, absolute_expires_at)
			VALUES (:userId, :tokenHash, FALSE, NULL, '203.0.113.0', :now, :expiresAt, :absoluteExpiresAt)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					tokenHash: randomBytes(TOKEN_HASH_BYTES),
					expiresAt: new Date(now.getTime() + HOUR_MS),
					absoluteExpiresAt: new Date(now.getTime() + THIRTY_DAYS_MS),
					...row,
					now,
				},
			},
		);
		return insertedId;
	},

	// Renvoie l'id créé. Par défaut, une inscription (sans compte) qui expire dans 1 h
	async flow(
		row: {
			kind?: string;
			step?: string;
			userId?: number | null;
			email?: string;
			payload?: string | null;
			tokenHash?: Buffer;
			expiresAt?: Date;
		} = {},
	): Promise<number> {
		const [insertedId] = await sequelize.query(
			`INSERT INTO auth_flow (token_hash, kind, step, user_id, email, payload, expires_at)
			VALUES (:tokenHash, :kind, :step, :userId, :email, :payload, :expiresAt)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					tokenHash: randomBytes(TOKEN_HASH_BYTES),
					kind: "registration",
					step: "mail_code",
					userId: null,
					email: `${buildUniqueWord()}@example.com`,
					payload: null,
					expiresAt: new Date(Date.now() + HOUR_MS),
					...row,
				},
			},
		);
		return insertedId;
	},

	// Renvoie l'id créé. Par défaut, un facteur mail
	async factor(row: {
		userId: number;
		type?: string;
		secretEncrypted?: Buffer | null;
		keyVersion?: number | null;
		lastUsedStep?: number | null;
		confirmedAt?: Date | null;
	}): Promise<number> {
		const [insertedId] = await sequelize.query(
			`INSERT INTO auth_factor (user_id, type, name, secret_encrypted, key_version, last_used_step, confirmed_at)
			VALUES (:userId, :type, 'Mon facteur', :secretEncrypted, :keyVersion, :lastUsedStep, :confirmedAt)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					type: "email",
					secretEncrypted: null,
					keyVersion: null,
					lastUsedStep: null,
					confirmedAt: null,
					...row,
				},
			},
		);
		return insertedId;
	},

	// Renvoie l'id créé. Code tiré au hasard par défaut
	async recoveryCode(row: {
		userId: number;
		codeHash?: Buffer;
	}): Promise<number> {
		const [insertedId] = await sequelize.query(
			"INSERT INTO auth_recovery_code (user_id, code_hash) VALUES (:userId, :codeHash)",
			{
				type: QueryTypes.INSERT,
				replacements: { codeHash: randomBytes(TOKEN_HASH_BYTES), ...row },
			},
		);
		return insertedId;
	},

	// Renvoie l'id créé
	async event(row: { userId: number | null }): Promise<number> {
		const [insertedId] = await sequelize.query(
			`INSERT INTO auth_event (user_id, type, ip, user_agent)
			VALUES (:userId, 'login_failure', '203.0.113.0', NULL)`,
			{ type: QueryTypes.INSERT, replacements: row },
		);
		return insertedId;
	},
};
