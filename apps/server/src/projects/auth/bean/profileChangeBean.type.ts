import type { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";

// Ce que le propriétaire change de son profil sans autre formalité ; un champ absent reste tel quel
export type ProfileChangeBean = {
	// null : le pseudo prend la place du pseudo affiché
	displayName?: string | null | undefined;
	loginMethods?: LoginMethodEnum | undefined;
};
