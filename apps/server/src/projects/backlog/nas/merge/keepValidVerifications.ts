import { parseVerificationKey } from "@citadel/specs/src/projects/backlog/helper/nas/parseVerificationKey.ts";
import type { MediaVerifications } from "@citadel/specs/src/projects/backlog/mediaState/mediaVerifications.type.ts";

import { findSurveyEntry } from "./findSurveyEntry.ts";
import { isVerifiableEntry } from "./isVerifiableEntry.ts";
import type { SurveyIndex } from "./surveyIndex.type.ts";

/**
 * Les cases « Vérifié » qui valent encore pour le dernier relevé : même fichier (même inode et même taille), seul. Un
 * fichier remplacé, disparu ou doublé n'est plus vérifié, sans que le job ait à écrire dans verified/ ; la case
 * oubliée quitte le fichier à la prochaine écriture
 */
export function keepValidVerifications(
	verifications: MediaVerifications["verifications"],
	index: SurveyIndex,
): MediaVerifications["verifications"] {
	return verifications.filter((verification) => {
		const target = parseVerificationKey(verification.key);
		const entry = target === null ? null : findSurveyEntry(index, target);
		return (
			isVerifiableEntry(entry) &&
			entry.file.inode === verification.inode &&
			entry.file.sizeBytes === verification.sizeBytes
		);
	});
}
