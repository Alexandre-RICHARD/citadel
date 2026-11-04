import type { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { User } from "../../models/User.ts";

type ProfileChange = {
	userId: number;
	// undefined : inchangé ; null : le pseudo prend la place du pseudo affiché
	displayName?: string | null | undefined;
	loginMethods?: LoginMethodEnum | undefined;
};

// Ce que le propriétaire change sans autre formalité. false : le compte n'existe plus
export async function updateUserProfileQuery({
	userId,
	displayName,
	loginMethods,
}: ProfileChange): Promise<boolean> {
	try {
		const user = await User.findByPk(userId);
		if (user === null) return false;
		await user.update({
			...(displayName === undefined ? {} : { displayName }),
			...(loginMethods === undefined ? {} : { loginMethods }),
		});
		return true;
	} catch (error) {
		throw new DatabaseError("Failed to update profile", { cause: error });
	}
}
