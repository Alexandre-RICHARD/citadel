import type { ResendFlowMail } from "@citadel/specs/src/projects/auth/endpoint/flow/resendFlowMail/resendFlowMailEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "./useFlowMutation";

// Un nouveau mail : nouveau code, nouveau lien, essais remis à zéro
export function useResendFlowMail() {
	return useFlowMutation(
		async () =>
			(
				await fetchHandler<ResendFlowMail>({
					url: `${ApiPrefixEnum.AUTH}/flow/resend`,
					method: HttpMethodEnum.POST,
					protected: false,
				})
			).data,
	);
}
