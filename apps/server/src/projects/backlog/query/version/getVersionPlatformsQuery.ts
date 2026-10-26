import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { VersionPlatform } from "../../models/VersionPlatform.ts";

// Plateformes et dates de sortie de ces versions
export async function getVersionPlatformsQuery(
	versionIds: number[],
): Promise<VersionPlatform[]> {
	if (versionIds.length === 0) return [];

	try {
		return await VersionPlatform.findAll({ where: { versionId: versionIds } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch version platforms", {
			cause: error,
		});
	}
}
