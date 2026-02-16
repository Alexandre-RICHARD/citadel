export type NavigationItems = {
	groupLabel?: string;
	naviItem: {
		label: string;
		link: string;
		icon?: string; // null for the moment
	}[];
}[];
