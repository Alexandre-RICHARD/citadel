import { z } from "zod";

import { MEDIA_STATE_FORMAT_VERSION } from "./mediaStateFormatVersion.ts";

/**
 * Les cases « Vérifié » (verified/verified.json), écrites par l'instance locale seule. Chacune garde l'empreinte du
 * fichier vérifié (inode, taille) : un fichier remplacé (autre inode ou autre taille) n'est plus vérifié, sans que
 * personne ait à décocher la case ; un simple renommage garde l'inode. `key` : voir buildVerificationKey
 */
export const mediaVerificationsSchema = z.object({
	formatVersion: z.literal(MEDIA_STATE_FORMAT_VERSION),
	verifications: z.array(
		z.object({
			key: z.string().min(1),
			inode: z.number().int().nonnegative(),
			sizeBytes: z.number().int().nonnegative(),
			verifiedAt: z.iso.datetime({ offset: true }),
		}),
	),
});
