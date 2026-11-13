import { AuthPathEnum } from "./authPath.enum";
import type { ProfileCategoryEnum } from "./profileCategory.enum";

// L'adresse d'une catégorie du profil : /auth/profile/security…
export function buildProfilePath(category: ProfileCategoryEnum): string {
	return `${AuthPathEnum.PROFILE}/${category}`;
}
