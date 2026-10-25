// Un service dont un autre a besoin pour démarrer (depends_on de compose.yml)
export type ServiceDependency = {
	name: string;
	// « service_healthy » : attendre qu'il soit sain, pas seulement démarré
	waitHealthy: boolean;
};
