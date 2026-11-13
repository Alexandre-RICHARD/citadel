import type { IconComponent } from "@citadel/design-system/src/types/iconComponent.type";

import type { ProfileCategoryEnum } from "../../routing/profileCategory.enum";

// Une catégorie du profil, telle que le menu et le titre de sa carte la montrent
export type ProfileCategory = {
	category: ProfileCategoryEnum;
	label: string;
	icon: IconComponent;
	lead: string;
};
