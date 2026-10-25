// GET /containers/json : seulement les champs lus par la console
export type DockerContainerSummary = {
	Id: string;
	Names: string[];
	Image: string;
	State: string;
	Labels: Record<string, string>;
};
