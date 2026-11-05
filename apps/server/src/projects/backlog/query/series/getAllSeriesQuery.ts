import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Series } from "../../models/Series.ts";
import { visibleSeries } from "./visibleSeries.ts";

export async function getAllSeriesQuery(userId: number): Promise<Series[]> {
	try {
		return await Series.findAll({
			where: visibleSeries(userId),
			order: [
				["name", "ASC"],
				["id", "ASC"],
			],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch series", { cause: error });
	}
}
