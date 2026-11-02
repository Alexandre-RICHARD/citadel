import type { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";

export type MeBean = {
	email: string;
	username: string;
	displayName: string | null;
	loginMethods: LoginMethodEnum;
};
