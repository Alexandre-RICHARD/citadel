// Type de fin d'un jeu du backlog (cahier des charges, §6) : ce que « fini » veut dire
export enum EndingTypeEnum {
	// Une fin scénarisée : générique vu
	STORY = "story",
	// Des parties recommencées : fini = première victoire ou fin principale
	RUNS = "runs",
	// Pas de fin imposée : fini quand on estime en avoir fait le tour
	SANDBOX = "sandbox",
	// En ligne ou compétitif, sans fin
	MULTIPLAYER = "multiplayer",
}
