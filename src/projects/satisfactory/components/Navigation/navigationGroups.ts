import { IconTokenEnum } from "../../../../common/components/icon/iconToken.enum";
import type { NavigationItems } from "./navigationItems.type";

export const navigationGroups: NavigationItems = [
	{
		naviItem: [
			{
				label: "homepage",
				link: "/satisfactory",
				icon: IconTokenEnum.TriangleArrow,
			},
			{
				label: "recipes",
				link: "/satisfactory/recipes",
				icon: IconTokenEnum.TriangleArrow,
			},
			{
				label: "calculator",
				link: "/satisfactory/calculator",
				icon: IconTokenEnum.TriangleArrow,
			},
			{
				label: "machines",
				link: "/satisfactory/frm/allMachines",
				icon: IconTokenEnum.TriangleArrow,
			},
		],
	},
	{
		naviItem: [
			{
				label: "settings",
				link: "/satisfactory/settings",
				icon: IconTokenEnum.TriangleArrow,
			},
			{
				label: "Retour en page d'accueil",
				link: "/",
				icon: IconTokenEnum.TriangleArrow,
			},
		],
	},
] as const;
