import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { buildUniqueWord } from "../buildUniqueWord.ts";

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
};
