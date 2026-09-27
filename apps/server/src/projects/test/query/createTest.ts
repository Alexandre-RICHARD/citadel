import { QueryTypes } from "sequelize";

import { DatabaseError } from "../../../error/DatabaseError.ts";
import { sequelize } from "../../../sequelize.ts";
import { Test } from "../models/Test.ts";

type Args = {
	name: string;
};

export async function createTest({ name }: Args): Promise<Test | null> {
	const sql = `
      INSERT INTO
			tests (
				name,
				is_active,
				created_at,
				updated_at
			)
			VALUES (
				:name,
				:isActive,
				CURRENT_TIMESTAMP(3),
				:updatedAt
			)
			RETURNING *;
    `;

	try {
		return await sequelize.query<Test>(sql, {
			mapToModel: true,
			model: Test,
			type: QueryTypes.SELECT,
			plain: true,
			replacements: {
				name,
				isActive: false,
				updatedAt: null,
			},
		});
	} catch (error) {
		throw new DatabaseError("createTest failed", { cause: error });
	}
}
