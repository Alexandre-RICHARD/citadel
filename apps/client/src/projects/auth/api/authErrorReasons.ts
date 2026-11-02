import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";

// Raisons des codes de l'authentification, après « Impossible de … : »
export const authErrorReasons: Record<AuthErrorCodeEnum, string> = {
	[AuthErrorCodeEnum.AUTHENTICATION_REQUIRED]: "tu n'es plus connecté",
	[AuthErrorCodeEnum.INVALID_CREDENTIALS]:
		"identifiant ou mot de passe incorrect",
	[AuthErrorCodeEnum.REGISTRATION_CLOSED]:
		"les inscriptions sont fermées pour aujourd'hui, elles rouvrent demain",
	[AuthErrorCodeEnum.MAIL_CLOSED]:
		"plus aucun mail ne part aujourd'hui, réessaie demain",
	[AuthErrorCodeEnum.PASSWORD_UNCHANGED]:
		"le nouveau mot de passe doit être différent de l'actuel",
	[AuthErrorCodeEnum.INVALID_CODE]: "ce code n'est pas valable",
	[AuthErrorCodeEnum.FLOW_EXPIRED]: "le délai est dépassé, il faut recommencer",
	[AuthErrorCodeEnum.USERNAME_TAKEN]: "ce pseudo est déjà pris",
	[AuthErrorCodeEnum.EMAIL_TAKEN]: "cette adresse est déjà utilisée",
	[AuthErrorCodeEnum.TOO_MANY_ATTEMPTS]:
		"trop d'essais, attends un peu avant de réessayer",
	[AuthErrorCodeEnum.AUTH_BUSY]:
		"le serveur est très sollicité, réessaie dans un instant",
};
