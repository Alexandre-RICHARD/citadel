import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

export async function getBossWithDeathsByIdQuery(
	id: number,
): Promise<Boss | null> {
	try {
		const bossWithDeaths = await Boss.findByPk(id, {
			include: { model: Death, as: "deaths" },
			order: [
				[{ model: Death, as: "deaths" }, "date", "ASC"],
				// Départage les dates identiques
				[{ model: Death, as: "deaths" }, "id", "ASC"],
			],
		});
		return bossWithDeaths;
	} catch {
		throw new DatabaseError("Failed to fetch boss with deaths");
	}
}
