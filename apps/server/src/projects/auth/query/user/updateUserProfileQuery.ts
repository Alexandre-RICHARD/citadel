import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { ProfileChangeBean } from "../../bean/profileChangeBean.type.ts";
import { User } from "../../models/User.ts";

// Le compte à jour, ou null s'il n'existe plus
export async function updateUserProfileQuery(
	userId: number,
	{ displayName, loginMethods }: ProfileChangeBean,
): Promise<User | null> {
	try {
		const user = await User.findByPk(userId);
		if (user === null) return null;
		return await user.update({
			...(displayName === undefined ? {} : { displayName }),
			...(loginMethods === undefined ? {} : { loginMethods }),
		});
	} catch (error) {
		throw new DatabaseError("Failed to update profile", { cause: error });
	}
}
