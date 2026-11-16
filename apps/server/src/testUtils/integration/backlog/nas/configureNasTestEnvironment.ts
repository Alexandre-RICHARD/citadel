import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { hashPassword } from "@citadel/common/src/node/password/hashPassword.ts";
import { TEST_ARGON2_PARAMETERS } from "@citadel/common/src/node/password/testArgon2Parameters.ts";
import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";

import { NAS_TEST_PASSWORD } from "./nasTestPassword.ts";

/**
 * Les tests d'intégration tournent comme l'instance locale du NAS : les routes du mode connecté sont montées, sur un
 * media-state jetable du dossier temporaire, vidé à chaque lancement. Le propriétaire est désigné par chaque test
 * (openUnlockedNasAgent) : celui-ci n'est qu'une valeur de départ. Avant l'import de env.ts, qui lit ces variables
 */
export async function configureNasTestEnvironment(): Promise<void> {
	const stateDir = path.join(tmpdir(), "citadel-media-state-test");
	rmSync(stateDir, { recursive: true, force: true });
	mkdirSync(
		path.join(stateDir, path.dirname(MediaStatePathEnum.CURRENT_SURVEY)),
		{
			recursive: true,
		},
	);
	mkdirSync(path.join(stateDir, MediaStatePathEnum.VERIFIED_DIR), {
		recursive: true,
	});
	process.env.MEDIA_STATE_DIR = stateDir;
	process.env.MEDIA_PASSWORD_HASH = await hashPassword(
		NAS_TEST_PASSWORD,
		TEST_ARGON2_PARAMETERS,
	);
	process.env.MEDIA_OWNER_USER_ID = "1";
}
