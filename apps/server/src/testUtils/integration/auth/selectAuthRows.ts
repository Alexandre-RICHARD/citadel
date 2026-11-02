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

// Lectures en SQL brut : vérifient les vraies colonnes, indépendamment du mapping des modèles
export const selectAuthRows = {
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
