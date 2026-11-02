import type { LoginWithPasswordBodyDto } from "@citadel/specs/src/projects/auth/endpoint/login/loginWithPassword/loginWithPasswordBodyDto.type";
import type { LoginWithPassword } from "@citadel/specs/src/projects/auth/endpoint/login/loginWithPassword/loginWithPasswordEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "../flow/useFlowMutation";

// Sans double authentification, la session s'ouvre ; avec, le parcours passe à l'étape « second facteur »
export function useLoginWithPassword() {
	return useFlowMutation(
		async (body: LoginWithPasswordBodyDto) =>
			(
				await fetchHandler<LoginWithPassword>({
					url: `${ApiPrefixEnum.AUTH}/login/password`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
