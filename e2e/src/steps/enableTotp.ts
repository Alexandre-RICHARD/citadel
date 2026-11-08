import { type Page, test } from "@playwright/test";

import { acknowledgeRecoveryCodes } from "./acknowledgeRecoveryCodes.ts";
import { setUpTotp } from "./setUpTotp.ts";

type EnabledTotp = { secret: string; recoveryCodes: string[] };

/**
 * Active une application d'authentification depuis la page « Ton profil » déjà ouverte, sauvegarde les codes de secours
 * et laisse le profil affiché. Renvoie la clé (pour calculer les codes) et les codes de secours (aucun si `givesRecoveryCodes` est faux : le compte avait déjà une double authentification)
 */
export async function enableTotp(
	page: Page,
	{
		name,
		stepOffset,
		givesRecoveryCodes = true,
	}: { name?: string; stepOffset?: number; givesRecoveryCodes?: boolean } = {},
): Promise<EnabledTotp> {
	return test.step("Activer la double authentification par application", async () => {
		await page.getByRole("button", { name: "Ajouter une application" }).click();
		const secret = await setUpTotp(page, {
			...(name !== undefined && { name }),
			...(stepOffset !== undefined && { stepOffset }),
			givesRecoveryCodes,
		});
		const recoveryCodes = givesRecoveryCodes
			? await acknowledgeRecoveryCodes(page)
			: [];
		return { secret, recoveryCodes };
	});
}
