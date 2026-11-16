import type { UnlockNas } from "@citadel/specs/src/projects/backlog/endpoint/nas/unlockNas/unlockNasEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { forgetModeDependentData } from "./forgetModeDependentData";

// Le mot de passe des médias : sans mise à jour optimiste, la fenêtre attend la réponse et affiche un refus
export function useUnlockNas() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: backlogQueryKeys.mutation("unlockNas"),
		mutationFn: async (password: string) =>
			fetchHandler<UnlockNas>({
				url: `${ApiPrefixEnum.BACKLOG}/nas/unlock`,
				method: HttpMethodEnum.POST,
				protected: true,
				body: { password },
			}),
		onSuccess: async () => forgetModeDependentData(queryClient),
	});
}
