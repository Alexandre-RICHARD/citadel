import type { AuthSettings } from "../../../../configuration/authSettings.type.ts";

type Options = {
	remember: boolean;
	// La dernière action de l'utilisateur
	seenAt: Date;
	absoluteExpiresAt: Date;
};

/**
 * La fin d'une session après une action : 7 jours plus tard avec « se souvenir de moi », 12 h sans, jamais au-delà du
 * plafond fixé à la connexion
 */
export function computeSessionExpiresAt(
	{ remember, seenAt, absoluteExpiresAt }: Options,
	settings: AuthSettings["session"],
): Date {
	const idleMs = remember ? settings.rememberMs : settings.idleMs;
	return new Date(
		Math.min(seenAt.getTime() + idleMs, absoluteExpiresAt.getTime()),
	);
}
