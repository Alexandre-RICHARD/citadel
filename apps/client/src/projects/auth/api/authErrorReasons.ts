import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";

// Raisons des codes de l'authentification, après « Impossible de … : »
export const authErrorReasons: Record<AuthErrorCodeEnum, string> = {
	[AuthErrorCodeEnum.INVALID_CREDENTIALS]:
		"identifiant ou mot de passe incorrect",
	[AuthErrorCodeEnum.REGISTRATION_CLOSED]:
		"les inscriptions sont fermées pour aujourd'hui, elles rouvrent demain",
	[AuthErrorCodeEnum.MAIL_CLOSED]:
		"plus aucun email ne part aujourd'hui, réessaie demain",
	[AuthErrorCodeEnum.PASSWORD_UNCHANGED]:
		"le nouveau mot de passe doit être différent de l'actuel",
	[AuthErrorCodeEnum.INVALID_CODE]: "ce code n'est pas valable",
	[AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED]:
		"tous les essais de ce code sont faits, demande un nouvel email",
	[AuthErrorCodeEnum.LINK_OTHER_BROWSER]:
		"ce lien a été ouvert dans un autre navigateur que celui où tu as commencé, saisis plutôt le code de l'email sur la page restée ouverte",
	[AuthErrorCodeEnum.FLOW_EXPIRED]: "le délai est dépassé, il faut recommencer",
	[AuthErrorCodeEnum.USERNAME_TAKEN]: "ce pseudo est déjà pris",
	[AuthErrorCodeEnum.EMAIL_TAKEN]: "cette adresse email est déjà utilisée",
	[AuthErrorCodeEnum.TOO_MANY_ATTEMPTS]:
		"trop d'essais, attends un peu avant de réessayer",
	[AuthErrorCodeEnum.AUTH_BUSY]:
		"le serveur est très sollicité, réessaie dans un instant",
	[AuthErrorCodeEnum.FACTOR_NOT_FOUND]:
		"cette double authentification n'existe plus, recommence son ajout",
};
