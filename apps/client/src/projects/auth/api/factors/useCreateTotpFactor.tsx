import type { CreateTotpFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/createTotpFactor/createTotpFactorEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import type { TotpSetupFm } from "../model/totpSetupFm.type";

export function useCreateTotpFactor() {
	return useMutation({
		mutationFn: async (name: string): Promise<TotpSetupFm> => {
			const { data } = await fetchHandler<CreateTotpFactor>({
				url: `${ApiPrefixEnum.AUTH}/factors/totp`,
				method: HttpMethodEnum.POST,
				protected: true,
				body: { name },
			});
			return {
				factorId: data.factorId,
				secret: data.secret,
				otpauthUri: data.otpauthUri,
			};
		},
	});
}
