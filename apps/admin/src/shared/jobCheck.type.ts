// Un contrôle d'un job, tel qu'infra-ops l'écrit dans state/jobs/<job>.json
export type JobCheck = {
	label: string;
	ok: boolean;
	detail: string;
};
