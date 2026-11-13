import type { IconComponent } from "@citadel/design-system/src/types/iconComponent.type";
import { BookOpen, Calculator, Factory, House } from "lucide-react";

// Les outils de Satisfactory, en haut du menu
export const SATISFACTORY_PAGES: readonly {
	label: string;
	href: string;
	icon: IconComponent;
}[] = [
	{ label: "homepage", href: "/satisfactory", icon: House },
	{ label: "recipes", href: "/satisfactory/recipes", icon: BookOpen },
	{ label: "calculator", href: "/satisfactory/calculator", icon: Calculator },
	{ label: "machines", href: "/satisfactory/frm/all-machines", icon: Factory },
];
