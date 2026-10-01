import type { IconTokenEnum } from "@citadel/design-system/src/atoms/Icon/iconToken.enum";

export type NavigationItems = {
	groupLabel?: string;
	naviItem: {
		label: string;
		link: string;
		icon: IconTokenEnum;
	}[];
}[];
