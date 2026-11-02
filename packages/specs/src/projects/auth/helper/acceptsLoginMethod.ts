import { LoginMethodEnum } from "../enum/loginMethod.enum.ts";

// Les méthodes de connexion choisies dans le profil laissent-elles passer celle-ci ?
export function acceptsLoginMethod(
	loginMethods: LoginMethodEnum,
	method: LoginMethodEnum.MAIL | LoginMethodEnum.PASSWORD,
): boolean {
	return loginMethods === LoginMethodEnum.BOTH || loginMethods === method;
}
