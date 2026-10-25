// /proc/meminfo : « MemTotal:  16243216 kB » … En octets. MemAvailable : ce qui peut
// encore servir sans rien tuer (mémoire libre plus cache récupérable).
export function parseMemInfo(content: string): {
	totalBytes: number;
	availableBytes: number;
} {
	const values = new Map(
		content.split("\n").map((line) => {
			const [key = "", value = ""] = line.split(":");
			return [key.trim(), Number.parseInt(value, 10) * 1024];
		}),
	);
	return {
		totalBytes: values.get("MemTotal") ?? 0,
		availableBytes: values.get("MemAvailable") ?? 0,
	};
}
