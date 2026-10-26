import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Platform } from "../../models/Platform.ts";

// Émulateurs connus, proposés après la console qu'ils émulent
export async function getEmulatorsQuery(): Promise<Platform[]> {
	try {
		return await Platform.findAll({
			where: { emulatedPlatformId: { [Op.ne]: null } },
			order: [["shortName", "ASC"]],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch emulators", { cause: error });
	}
}
