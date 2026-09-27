import { QueryTypes } from "sequelize";

import { DatabaseError } from "../../../error/DatabaseError.ts";
import { sequelize } from "../../../sequelize.ts";
import { Test } from "../models/Test.ts";

export async function getAllTest(): Promise<Test[]> {
	const sql = `
      SELECT t.*
      FROM tests t
      ORDER BY t.id ASC;
    `;

	try {
		return await sequelize.query<Test>(sql, {
			type: QueryTypes.SELECT,
			plain: false,
			mapToModel: true,
			model: Test,
		});
	} catch (error) {
		throw new DatabaseError("getAllTest failed", { cause: error });
	}
}
