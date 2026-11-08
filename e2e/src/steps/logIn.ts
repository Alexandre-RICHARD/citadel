import { expect, type Page } from "@playwright/test";

import type { Identity } from "../helpers/identity/identity.type.ts";
import { fillLoginForm } from "./fillLoginForm.ts";

/**
 * Se connecter par mot de passe (`identifier` : l'email par défaut, ou le pseudo) : part du formulaire « Se connecter »
 * déjà affiché. Se termine quand la page quitte /auth/login pour celle demandée au départ (le profil si la connexion venait du profil), preuve que la session
 * est ouverte ; au scénario de vérifier où l'on atterrit
 */
export async function logIn(
	page: Page,
	identity: Identity,
	{
		identifier = identity.email,
		remember = false,
	}: { identifier?: string; remember?: boolean } = {},
): Promise<void> {
	await fillLoginForm(page, {
		identifier,
		password: identity.password,
		remember,
	});
	await expect(page).not.toHaveURL(/\/auth\/login/);
}
