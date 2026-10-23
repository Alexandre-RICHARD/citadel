import type { LucideIcon } from "lucide-react";

/** Une entrée du menu Actions */
export type MenuItem = {
	label: string;
	icon: LucideIcon;
	/** Lien externe ouvert dans un nouvel onglet ; sinon `onSelect` */
	href: string | null;
	/** Entrée inactive, avec sa raison en info-bulle ; `null` si elle est active */
	disabledReason: string | null;
	/** Action destructive : en rouge */
	isDanger?: boolean;
	/** Trait de séparation avant l'entrée */
	isGroupStart?: boolean;
	onSelect: () => void;
};
