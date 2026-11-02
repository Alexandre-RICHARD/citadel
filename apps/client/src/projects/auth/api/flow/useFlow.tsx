import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { authQueryKeys } from "../authQueryKeys";
import { fromReceivedFlowStatusToFlowFm } from "../model/fromReceivedFlowStatusToFlowFm";
import { flowQueryOptions } from "./flowQueryOptions";

/**
 * Le parcours de ce navigateur, relu au retour sur l'onglet : le lien du mail a pu être ouvert dans un autre onglet, et
 * la page passe alors d'elle-même à la suite (le parcours terminé, la session est relue). undefined : pas encore lu ;
 * null : aucun parcours
 */
export function useFlow() {
	const queryClient = useQueryClient();
	const { data, isPending, refetch } = useQuery({
		...flowQueryOptions,
		select: fromReceivedFlowStatusToFlowFm,
	});
	const flow = isPending ? undefined : (data ?? null);
	const hadFlowRef = useRef(false);

	useEffect(() => {
		function handleVisibilityChange(): void {
			if (document.visibilityState === "visible") void refetch();
		}
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [refetch]);

	// Un parcours qui disparaît s'est peut-être terminé ailleurs, en ouvrant la session
	useEffect(() => {
		if (flow === undefined) return;
		if (flow === null && hadFlowRef.current)
			void queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
		hadFlowRef.current = flow !== null;
	}, [flow, queryClient]);

	return { flow };
}
