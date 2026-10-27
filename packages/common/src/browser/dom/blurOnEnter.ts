type EnterKeyEvent = {
	key: string;
	currentTarget: { blur: () => void };
};

// Champs enregistrés en quittant le champ : Entrée le quitte, donc l'enregistre
export function blurOnEnter(event: EnterKeyEvent): void {
	if (event.key === "Enter") event.currentTarget.blur();
}
