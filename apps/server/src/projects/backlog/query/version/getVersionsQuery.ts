import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Version } from "../../models/Version.ts";

// Ces versions ; avec les ids de jeux, leurs versions originales (même id)
export async function getVersionsQuery(ids: number[]): Promise<Version[]> {
	if (ids.length === 0) return [];

	try {
		return await Version.findAll({ where: { id: ids } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch versions", { cause: error });
	}
}
