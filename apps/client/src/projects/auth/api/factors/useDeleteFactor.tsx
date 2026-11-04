import type { DeleteFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/deleteFactor/deleteFactorEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

type Variables = { factorId: number; password: string };

// Retire un facteur, mot de passe redemandé. Le dernier parti, les codes de secours partent avec lui
export function useDeleteFactor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ factorId, password }: Variables): Promise<void> => {
			await fetchHandler<DeleteFactor>({
				url: `${ApiPrefixEnum.AUTH}/factors/:factorId`,
				method: HttpMethodEnum.DELETE,
				protected: true,
				pathParams: { factorId },
				body: { password },
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: authQueryKeys.factors() }),
	});
}
