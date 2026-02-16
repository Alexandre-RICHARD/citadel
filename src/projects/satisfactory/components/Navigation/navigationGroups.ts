import type { NavigationItems } from "./navigationItems.type";

export const navigationGroups: NavigationItems = [
	{
		naviItem: [
			{
				label: "homepage",
				link: "",
			},
			{
				label: "recipes",
				link: "recipes",
			},
			{
				label: "calculator",
				link: "calculator",
			},
			{
				label: "machines",
				link: "frm/allMachines",
			},
		],
	},
	{
		naviItem: [
			{
				label: "settings",
				link: "settings",
			},
			{
				label: "Retour en page d'accueil",
				link: "/",
			},
		],
	},
] as const;
