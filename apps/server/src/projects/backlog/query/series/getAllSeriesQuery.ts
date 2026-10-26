import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Series } from "../../models/Series.ts";

export async function getAllSeriesQuery(): Promise<Series[]> {
	try {
		return await Series.findAll({
			order: [
				["name", "ASC"],
				["id", "ASC"],
			],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch series", { cause: error });
	}
}
