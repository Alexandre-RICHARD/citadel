// Transition qui mène à un projet : l'écran se couvre dans le style du projet, puis se découvre sur sa page
export enum TransitionEffectEnum {
	// L'hexagone du logo, qui s'ouvre depuis le bouton : la transition par défaut
	Hex = "hex",
	// Des hexagones qui se posent en vague, comme une usine qui se construit
	Hexes = "hexes",
	// Des tuiles arrondies qui sautent en place
	Tiles = "tiles",
	// Un tram qui passe, les couleurs des lignes en tête
	Tram = "tram",
	// Un rideau sombre qui monte, bordé de braises
	Fire = "fire",
}
