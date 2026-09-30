import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { Test } from "../models/Test.ts";
import { getOneTest } from "./getOneTest.ts";

type Args = {
	id: number;
	name: string;
	isActive: boolean;
};

export async function updateTest({
	id,
	name,
	isActive,
}: Args): Promise<Test | null> {
	const sql = `
      UPDATE tests
			SET name = :name,
				is_active = :isActive,
				updated_at = CURRENT_TIMESTAMP(3)
			WHERE id = :id;
    `;

	try {
		await sequelize.query<Test>(sql, {
			model: Test,
			type: QueryTypes.UPDATE,
			replacements: {
				name,
				isActive,
				id,
			},
		});
		return await getOneTest({ id });
	} catch (error) {
		throw new DatabaseError("updateTest failed", { cause: error });
	}
}
