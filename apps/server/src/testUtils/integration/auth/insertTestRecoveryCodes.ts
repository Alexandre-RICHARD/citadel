import { authSettings } from "../../../configuration/authSettings.ts";
import { createRecoveryCodes } from "../../../projects/auth/helper/recoveryCode/createRecoveryCodes.ts";
import { insertAuthRows } from "./insertAuthRows.ts";

// Des codes de secours du compte, gardés comme le ferait le service ; renvoie les codes tels qu'ils sont affichés
export async function insertTestRecoveryCodes(
	userId: number,
	count = authSettings.recoveryCodesCount,
): Promise<string[]> {
	const { codes, codeHashes } = createRecoveryCodes(
		count,
		authSettings.code.hmacKey,
	);
	for (const codeHash of codeHashes)
		// eslint-disable-next-line no-await-in-loop
		await insertAuthRows.recoveryCode({ userId, codeHash });
	return codes;
}
