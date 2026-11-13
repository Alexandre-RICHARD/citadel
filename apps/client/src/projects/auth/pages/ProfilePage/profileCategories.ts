import {
	Database,
	LogIn,
	ShieldCheck,
	SlidersHorizontal,
	UserRound,
} from "lucide-react";

import { ProfileCategoryEnum } from "../../routing/profileCategory.enum";
import type { ProfileCategory } from "./profileCategory.type";

// Les catégories du profil, dans l'ordre du menu
export const PROFILE_CATEGORIES: readonly ProfileCategory[] = [
	{
		category: ProfileCategoryEnum.IDENTITY,
		label: "Identité",
		icon: UserRound,
		lead: "Le nom sous lequel le site te montre, et l’adresse où il t’écrit.",
	},
	{
		category: ProfileCategoryEnum.LOGIN,
		label: "Connexion",
		icon: LogIn,
		lead: "Comment tu te connectes, et les appareils où tu l’es.",
	},
	{
		category: ProfileCategoryEnum.SECURITY,
		label: "Sécurité",
		icon: ShieldCheck,
		lead: "Ce qui protège ton compte si quelqu’un d’autre tente d’y entrer.",
	},
	{
		category: ProfileCategoryEnum.DATA,
		label: "Mes données",
		icon: Database,
		lead: "Tout ce que le site garde sur ton compte t’appartient.",
	},
	{
		category: ProfileCategoryEnum.PREFERENCES,
		label: "Préférences",
		icon: SlidersHorizontal,
		lead: "Ces choix restent dans ce navigateur.",
	},
];
