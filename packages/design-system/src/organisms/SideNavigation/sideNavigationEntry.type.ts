import type { SideNavigationItem } from "./sideNavigationItem.type";

/** Des éléments réunis sous un titre, montré quand le menu est large ; un trait les sépare quand il est réduit */
type Group = {
	kind: "group";
	id: string;
	label?: string;
	items: readonly SideNavigationItem[];
};

/**
 * Prend toute la hauteur libre : ce qui suit descend en bas du menu (« space-between »). Sans effet quand le menu n'a
 * pas de hauteur imposée (placement « inline »)
 */
type Spacer = {
	kind: "spacer";
	id: string;
};

export type SideNavigationEntry = SideNavigationItem | Group | Spacer;
