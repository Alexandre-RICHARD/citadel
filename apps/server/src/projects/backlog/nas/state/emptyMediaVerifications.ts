import { MEDIA_STATE_FORMAT_VERSION } from "@citadel/specs/src/projects/backlog/mediaState/mediaStateFormatVersion.ts";
import type { MediaVerifications } from "@citadel/specs/src/projects/backlog/mediaState/mediaVerifications.type.ts";

// Aucune case « Vérifié » cochée : avant la première, le fichier n'existe pas
export function emptyMediaVerifications(): MediaVerifications {
	return { formatVersion: MEDIA_STATE_FORMAT_VERSION, verifications: [] };
}
