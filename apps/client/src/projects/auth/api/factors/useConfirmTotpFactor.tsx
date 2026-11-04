import type { ConfirmTotpFactorBodyDto } from "@citadel/specs/src/projects/auth/endpoint/factors/confirmTotpFactor/confirmTotpFactorBodyDto.type";
import type { ConfirmTotpFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/confirmTotpFactor/confirmTotpFactorEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";
import { writeNewRecoveryCodes } from "../cache/writeNewRecoveryCodes";

// Le premier code de l'application active le TOTP. Premier facteur du compte, il donne les codes de secours
export function useConfirmTotpFactor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: ConfirmTotpFactorBodyDto): Promise<void> => {
			const { data } = await fetchHandler<ConfirmTotpFactor>({
				url: `${ApiPrefixEnum.AUTH}/factors/totp/confirm`,
				method: HttpMethodEnum.POST,
				protected: true,
				body,
			});
			if (data.recoveryCodes !== null)
				writeNewRecoveryCodes(queryClient, data.recoveryCodes);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: authQueryKeys.factors() }),
	});
}
