// Panneau ouvert dans le tableau des films et séries : le menu Actions d'une ligne. pointer : ouvert par clic droit, le menu
// s'ouvre sous le curseur ; null : ouvert par le bouton « Actions », le menu s'ouvre contre lui
export type MediaTablePopover = {
	kind: "actionsMenu";
	userMediaId: number;
	pointer: { x: number; y: number } | null;
};
