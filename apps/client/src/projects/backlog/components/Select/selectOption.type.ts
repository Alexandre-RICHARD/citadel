import type { ReactNode } from "react";

/** Une valeur d'une liste déroulante ; `label` sert à la frappe rapide et nomme la valeur pour les lecteurs d'écran */
export type SelectOption<V extends string> = {
	value: V;
	label: string;
	/** Rendu de la valeur à la place du libellé (pastille de statut…), dans la liste et dans le champ */
	content?: ReactNode;
	/** Rendu dans le champ seulement, quand il est plus court que dans la liste (filtre compact) */
	triggerContent?: ReactNode;
	/** Précision discrète, à droite dans la liste (« émulateur », « déjà dans le backlog ») */
	hint?: string | undefined;
	disabled?: boolean;
};
