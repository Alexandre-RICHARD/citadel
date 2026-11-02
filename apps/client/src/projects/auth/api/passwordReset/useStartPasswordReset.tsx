import type { StartPasswordResetBodyDto } from "@citadel/specs/src/projects/auth/endpoint/passwordResets/startPasswordReset/startPasswordResetBodyDto.type";
import type { StartPasswordReset } from "@citadel/specs/src/projects/auth/endpoint/passwordResets/startPasswordReset/startPasswordResetEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "../flow/useFlowMutation";

export function useStartPasswordReset() {
	return useFlowMutation(
		async (body: StartPasswordResetBodyDto) =>
			(
				await fetchHandler<StartPasswordReset>({
					url: `${ApiPrefixEnum.AUTH}/password-resets`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
