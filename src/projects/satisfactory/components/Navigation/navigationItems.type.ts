import type { IconTokenEnum } from "../../../../common/components/icon/iconToken.enum";

export type NavigationItems = {
	groupLabel?: string;
	naviItem: {
		label: string;
		link: string;
		icon: IconTokenEnum;
	}[];
}[];
