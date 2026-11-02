import type { LoginMethodEnum } from "../enum/loginMethod.enum.ts";

// L'utilisateur connecté
export type MeDto = {
	email: string;
	username: string;
	// null : le pseudo affiché est le username
	displayName: string | null;
	loginMethods: LoginMethodEnum;
};
