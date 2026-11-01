import type { LimitsInput } from "./limitsInput.type";

// Les champs de la fenêtre « Limites » (mémoire en Mio, processeur en cœurs, virgule
// acceptée) vers ce qu'attend l'API. null : inchangé (champ vide, ou valeur actuelle).
// Une chaîne : l'erreur à afficher.
const MIN_MEMORY_MIB = 64;
const MIN_CPUS = 0.1;
const MAX_CPUS = 99;

function parseNumber(text: string): number | null {
	const trimmed = text.trim().replace(",", ".");
	if (trimmed === "") return null;
	const value = Number(trimmed);
	return Number.isFinite(value) ? value : Number.NaN;
}

export function parseLimitsInput(
	memoryMibText: string,
	cpusText: string,
	current: { memoryLimitBytes: number | null; cpuLimit: number | null },
): LimitsInput | string {
	const memoryMib = parseNumber(memoryMibText);
	const cpus = parseNumber(cpusText);
	if (Number.isNaN(memoryMib) || Number.isNaN(cpus)) return "Un nombre attendu";
	if (
		memoryMib !== null &&
		(!Number.isInteger(memoryMib) || memoryMib < MIN_MEMORY_MIB)
	)
		return `Mémoire : un nombre entier de Mio, ${MIN_MEMORY_MIB} au moins`;
	if (cpus !== null && (cpus < MIN_CPUS || cpus > MAX_CPUS))
		return "Processeur : entre 0,1 et 99 cœurs";

	const memoryBytes = memoryMib === null ? null : memoryMib * 1024 ** 2;
	const roundedCpus = cpus === null ? null : Math.round(cpus * 100) / 100;
	const limits = {
		memoryBytes: memoryBytes === current.memoryLimitBytes ? null : memoryBytes,
		cpus: roundedCpus === current.cpuLimit ? null : roundedCpus,
	};
	if (limits.memoryBytes === null && limits.cpus === null)
		return "Rien à changer";
	return limits;
}
