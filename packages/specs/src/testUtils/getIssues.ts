import type { z } from "zod";

// Garde de chaque problème ce que l'API renvoie au client : le chemin du champ et le message
export function getIssues(
	result: z.ZodSafeParseResult<unknown>,
): { path: PropertyKey[]; message: string }[] {
	if (result.success) return [];
	return result.error.issues.map(({ path, message }) => ({ path, message }));
}
