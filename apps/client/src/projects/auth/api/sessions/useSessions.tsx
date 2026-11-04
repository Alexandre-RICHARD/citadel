import { useQuery } from "@tanstack/react-query";

import { sessionsQueryOptions } from "./sessionsQueryOptions";

// Les sessions ouvertes du compte, sans suspension : la section décide quoi montrer pendant la lecture, ou si elle échoue
export function useSessions() {
	const { data, isError, refetch } = useQuery(sessionsQueryOptions);
	return { sessions: data, isError, retry: refetch };
}
