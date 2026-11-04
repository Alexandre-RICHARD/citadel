import type { StartEmailFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/startEmailFactor/startEmailFactorEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "../flow/useFlowMutation";

// Le code par email : un mail part à l'adresse du compte, son lien ou son code active le facteur
export function useStartEmailFactor() {
	return useFlowMutation(
		async () =>
			(
				await fetchHandler<StartEmailFactor>({
					url: `${ApiPrefixEnum.AUTH}/factors/email`,
					method: HttpMethodEnum.POST,
					protected: true,
				})
			).data,
	);
}
