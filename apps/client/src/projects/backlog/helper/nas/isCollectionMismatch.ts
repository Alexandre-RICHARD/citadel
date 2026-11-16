import { normalizeText } from "@citadel/common/src/universal/string/normalizeText";

/**
 * La collection Jellyfin se signale quand son nom diffère de celui de la saga (§5), sans tenir compte des accents ni des
 * majuscules ; une collection sans saga diffère aussi
 */
export function isCollectionMismatch(
	sagaName: string | null,
	collection: string,
): boolean {
	return (
		sagaName === null || normalizeText(sagaName) !== normalizeText(collection)
	);
}
