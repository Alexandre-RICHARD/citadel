import type { KeyboardEvent } from "react";

// Champs enregistrés en quittant le champ : Entrée le quitte, donc l'enregistre
export function blurOnEnter(event: KeyboardEvent<HTMLElement>): void {
	if (event.key === "Enter") event.currentTarget.blur();
}
