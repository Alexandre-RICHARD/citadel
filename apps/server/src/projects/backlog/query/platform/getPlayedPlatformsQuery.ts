import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { PlatformBean } from "../../bean/platformBean.type.ts";

// Plateformes d'au moins une version jouée, par nom : les choix du filtre Plateforme
export async function getPlayedPlatformsQuery(): Promise<PlatformBean[]> {
	try {
		return await sequelize.query<PlatformBean>(
			`
				SELECT
					p.id,
					p.short_name AS shortName,
					p.technical_name AS technicalName,
					p.emulated_platform_id AS emulatedPlatformId
				FROM backlog_platform p
				WHERE EXISTS (
					SELECT 1 FROM backlog_user_version uv WHERE uv.platform_id = p.id
				)
				ORDER BY p.short_name, p.id
			`,
			{ type: QueryTypes.SELECT },
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch played platforms", {
			cause: error,
		});
	}
}
