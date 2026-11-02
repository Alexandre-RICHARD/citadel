import type { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum";

// Le compte connecté, tel que l'interface l'affiche
export type MeFm = {
	email: string;
	username: string;
	// Toujours rempli : le pseudo quand aucun pseudo affiché n'est choisi
	displayName: string;
	loginMethods: LoginMethodEnum;
};
