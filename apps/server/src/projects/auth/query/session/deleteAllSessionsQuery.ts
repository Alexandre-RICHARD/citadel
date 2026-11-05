import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Session } from "../../models/Session.ts";

// Toutes les sessions, de tous les comptes : après une restauration, une session révoquée depuis redeviendrait valide
export async function deleteAllSessionsQuery(): Promise<number> {
	try {
		return await Session.destroy({ where: {} });
	} catch (error) {
		throw new DatabaseError("Failed to delete every session", { cause: error });
	}
}
