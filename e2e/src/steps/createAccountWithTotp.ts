import { type Page, test } from "@playwright/test";

import type { Identity } from "../helpers/identity/identity.type.ts";
import { backToCitadelFromAuth } from "../helpers/navigation/backToCitadelFromAuth.ts";
import { openProfile } from "../helpers/navigation/openProfile.ts";
import { createConnectedAccount } from "./createConnectedAccount.ts";
import { enableTotp } from "./enableTotp.ts";

type AccountWithTotp = {
	identity: Identity;
	secret: string;
	recoveryCodes: string[];
};

/**
 * Un compte neuf avec une application d'authentification active : part d'une page vierge, termine sur la homepage,
 * connecté. Renvoie l'identité, la clé TOTP et les 10 codes de secours
 */
export async function createAccountWithTotp(
	page: Page,
	label = "user",
): Promise<AccountWithTotp> {
	const identity = await createConnectedAccount(page, label);

	return test.step("Protéger le compte par une application d'authentification", async () => {
		await openProfile(page, "Sécurité");
		const { secret, recoveryCodes } = await enableTotp(page);
		await backToCitadelFromAuth(page);
		return { identity, secret, recoveryCodes };
	});
}
