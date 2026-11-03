import type { SubmitSecondFactorBodyDto } from "@citadel/specs/src/projects/auth/endpoint/flow/submitSecondFactor/submitSecondFactorBodyDto.type";
import type { SubmitSecondFactor } from "@citadel/specs/src/projects/auth/endpoint/flow/submitSecondFactor/submitSecondFactorEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "./useFlowMutation";

// Le code du second facteur : application d'authentification, email ou code de secours
export function useSubmitSecondFactor() {
	return useFlowMutation(
		async (body: SubmitSecondFactorBodyDto) =>
			(
				await fetchHandler<SubmitSecondFactor>({
					url: `${ApiPrefixEnum.AUTH}/flow/second-factor`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
