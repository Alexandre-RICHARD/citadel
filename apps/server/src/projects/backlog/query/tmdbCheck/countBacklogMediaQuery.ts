import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

// Les films et séries distincts que contient au moins un backlog
export async function countBacklogMediaQuery(): Promise<number> {
	try {
		const [row] = await sequelize.query<{ total: number | string }>(
			`
				SELECT COUNT(DISTINCT um.movie_id) + COUNT(DISTINCT um.tv_show_id) AS total
				FROM backlog_user_media um
			`,
			{ type: QueryTypes.SELECT },
		);
		return Number(row?.total ?? 0);
	} catch (error) {
		throw new DatabaseError("Failed to count backlog media", { cause: error });
	}
}
