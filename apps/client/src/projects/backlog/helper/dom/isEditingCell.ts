import { isTextField } from "./isTextField";

// Une cellule est en cours d'édition quand le focus est dans un de ses champs de saisie (cahier des charges, §9)
export function isEditingCell(): boolean {
	const element = document.activeElement;
	return (
		isTextField(element) &&
		element.closest("[data-backlog-table] tbody") !== null
	);
}
