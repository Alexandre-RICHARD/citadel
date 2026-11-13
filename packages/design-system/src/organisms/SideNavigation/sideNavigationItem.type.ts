import type { ReactNode } from "react";

import type { IconComponent } from "../../types/iconComponent.type";

type Link = {
	kind: "link";
	id: string;
	label: string;
	icon: IconComponent;
	/** Un vrai lien : nouvel onglet, clic molette et copie de l'adresse fonctionnent ; le clic simple passe par `onNavigate` */
	href: string;
	isActive?: boolean;
};

type Action = {
	kind: "action";
	id: string;
	label: string;
	icon: IconComponent;
	onClick: () => void;
};

/** Un élément libre et non cliquable par le menu (logo, pseudo, image…), dessiné selon que le menu est large ou réduit */
type Custom = {
	kind: "custom";
	id: string;
	render: (isWide: boolean) => ReactNode;
};

export type SideNavigationItem = Link | Action | Custom;
