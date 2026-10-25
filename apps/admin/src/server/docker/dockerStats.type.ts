// GET /containers/{id}/stats?stream=false&one-shot=true : seulement les champs lus
export type DockerStats = {
	cpu_stats: {
		cpu_usage: { total_usage: number };
		system_cpu_usage?: number;
		online_cpus?: number;
	};
	memory_stats: {
		usage?: number;
		stats?: { inactive_file?: number };
	};
};
