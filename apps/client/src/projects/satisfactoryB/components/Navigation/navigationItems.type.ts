import type { IconTokenEnum } from "../../../../common/components/components/atoms/Icon/iconToken.enum";

export type NavigationItems = {
	groupLabel?: string;
	naviItem: {
		label: string;
		link: string;
		icon: IconTokenEnum;
	}[];
}[];
