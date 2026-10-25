// Une étape d'une action de la console : démarrer ou arrêter un conteneur
export type ActionStep = {
	name: string;
	operation: "start" | "stop";
	// Attendre qu'il soit sain avant l'étape suivante : un service démarré après lui en a besoin
	waitHealthy: boolean;
};
