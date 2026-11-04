import { useQuery } from "@tanstack/react-query";

import { factorsQueryOptions } from "./factorsQueryOptions";

// La double authentification du compte, sans suspension : la section décide quoi montrer pendant la lecture, ou si elle
// échoue
export function useFactors() {
	const { data, isError, refetch } = useQuery(factorsQueryOptions);
	return { factors: data, isError, retry: refetch };
}
