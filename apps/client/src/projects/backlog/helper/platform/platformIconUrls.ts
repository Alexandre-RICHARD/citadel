// Les icônes embarquées dans `icons/` du projet, nommées par le nom technique de leur plateforme ou de leur launcher
// (`ps2.svg`, `steam.svg`) : déposer un SVG suffit à l'afficher. Aucune n'est fournie pour l'instant, l'icône par défaut sert
export const platformIconUrls = import.meta.glob<string>("../../icons/*.svg", {
	eager: true,
	query: "?url",
	import: "default",
});
