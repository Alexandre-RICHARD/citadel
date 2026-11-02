import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

// Le même mot de passe, hashé avec les paramètres du moment : sa date de changement ne bouge pas
export async function rehashUserPasswordQuery(
	userId: number,
	passwordHash: string,
): Promise<void> {
	try {
		await User.update({ passwordHash }, { where: { id: userId } });
	} catch (error) {
		throw new DatabaseError("Failed to rehash password", { cause: error });
	}
}
