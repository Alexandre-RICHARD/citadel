import { Op } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Platform } from "../../models/Platform.ts";

// Sous-plateformes connues (émulateurs, launchers), proposées après la plateforme dont elles dépendent
export async function getSubPlatformsQuery(): Promise<Platform[]> {
	try {
		return await Platform.findAll({
			where: { parentPlatformId: { [Op.ne]: null } },
			order: [["shortName", "ASC"]],
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch sub-platforms", { cause: error });
	}
}
