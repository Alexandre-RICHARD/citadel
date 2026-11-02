import type { SubmitNewPasswordBodyDto } from "@citadel/specs/src/projects/auth/endpoint/flow/submitNewPassword/submitNewPasswordBodyDto.type";
import type { SubmitNewPassword } from "@citadel/specs/src/projects/auth/endpoint/flow/submitNewPassword/submitNewPasswordEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "./useFlowMutation";

// Dernière étape du mot de passe oublié : toutes les sessions se ferment, celle-ci s'ouvre
export function useSubmitNewPassword() {
	return useFlowMutation(
		async (body: SubmitNewPasswordBodyDto) =>
			(
				await fetchHandler<SubmitNewPassword>({
					url: `${ApiPrefixEnum.AUTH}/flow/new-password`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
