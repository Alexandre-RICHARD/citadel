// GET /containers/{id}/json : seulement les champs lus par la console
export type DockerContainerDetails = {
	RestartCount: number;
	State: {
		Status: string;
		StartedAt: string;
		Health?: { Status: string };
	};
	Config: { Tty: boolean };
	// Limite mémoire en octets, 0 sans limite
	HostConfig: { Memory: number };
};
