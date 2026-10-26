import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UserVersionEntity } from "../../dbType/userVersionEntity.type.ts";
import { DoneDlc } from "../../models/DoneDlc.ts";
import { Platform } from "../../models/Platform.ts";
import { UserVersion } from "../../models/UserVersion.ts";
import { Version } from "../../models/Version.ts";

// Versions jouées de ces jeux, dans l'ordre d'ajout ; null : de tout le backlog
export async function getUserVersionEntitiesQuery(
	gameIds: number[] | null,
): Promise<UserVersionEntity[]> {
	if (gameIds?.length === 0) return [];

	try {
		const userVersions = await UserVersion.findAll({
			include: [
				{
					model: Version,
					as: "version",
					required: true,
					...(gameIds !== null && { where: { gameId: gameIds } }),
				},
				{ model: Platform, as: "platform" },
				{ model: DoneDlc, as: "doneDlcs", separate: true },
			],
			order: [["id", "ASC"]],
		});
		// Obligé de caster : les include ci-dessus garantissent ces propriétés, que Sequelize ne sait pas typer
		return userVersions as UserVersionEntity[];
	} catch (error) {
		throw new DatabaseError("Failed to fetch played versions", {
			cause: error,
		});
	}
}
