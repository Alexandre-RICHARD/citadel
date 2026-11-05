import { useQuery } from "@tanstack/react-query";

import { meQueryOptions } from "./meQueryOptions";
import { SignInStateEnum } from "./signInState.enum";

// La connexion du navigateur, lue sur le même cache que useMe : un projet privé s'ouvre, ou mène à la connexion
export function useSignInState(): SignInStateEnum {
	const { status, data } = useQuery(meQueryOptions);
	if (status === "pending") return SignInStateEnum.PENDING;
	if (status === "error") return SignInStateEnum.UNKNOWN;
	return data === null ? SignInStateEnum.SIGNED_OUT : SignInStateEnum.SIGNED_IN;
}
