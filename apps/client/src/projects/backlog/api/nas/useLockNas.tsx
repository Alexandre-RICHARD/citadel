import type { LockNas } from "@citadel/specs/src/projects/backlog/endpoint/nas/lockNas/lockNasEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { forgetModeDependentData } from "./forgetModeDependentData";

// Reverrouille le mode connecté avant ses 12 h : le tableau repasse en mode classique
export function useLockNas() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: backlogQueryKeys.mutation("lockNas"),
		mutationFn: async () =>
			fetchHandler<LockNas>({
				url: `${ApiPrefixEnum.BACKLOG}/nas/lock`,
				method: HttpMethodEnum.POST,
				protected: true,
			}),
		onSettled: async () => forgetModeDependentData(queryClient),
	});
}
