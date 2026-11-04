import type { RegenerateRecoveryCodes } from "@citadel/specs/src/projects/auth/endpoint/recoveryCodes/regenerateRecoveryCodes/regenerateRecoveryCodesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";
import { writeNewRecoveryCodes } from "../cache/writeNewRecoveryCodes";

// De nouveaux codes de secours, mot de passe redemandé : les anciens ne valent plus
export function useRegenerateRecoveryCodes() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (password: string): Promise<void> => {
			const { data } = await fetchHandler<RegenerateRecoveryCodes>({
				url: `${ApiPrefixEnum.AUTH}/recovery-codes`,
				method: HttpMethodEnum.POST,
				protected: true,
				body: { password },
			});
			writeNewRecoveryCodes(queryClient, data.recoveryCodes);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: authQueryKeys.factors() }),
	});
}
