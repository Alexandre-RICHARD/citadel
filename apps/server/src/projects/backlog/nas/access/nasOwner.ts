import type { NasSettings } from "../../../../configuration/nasSettings.type.ts";

/**
 * Le compte du propriétaire du NAS (MEDIA_OWNER_USER_ID), seul à pouvoir ouvrir le mode connecté : qui apprendrait le
 * mot de passe des médias devrait aussi avoir ce compte, avec sa double authentification. Un objet, pour que les tests
 * désignent leur propre compte
 */
export const nasOwner = {
	isOwner(settings: NasSettings, userId: number): boolean {
		return userId === settings.ownerUserId;
	},
};
