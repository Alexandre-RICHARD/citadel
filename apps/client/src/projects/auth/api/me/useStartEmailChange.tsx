import type { StartEmailChangeBodyDto } from "@citadel/specs/src/projects/auth/endpoint/me/startEmailChange/startEmailChangeBodyDto.type";
import type { StartEmailChange } from "@citadel/specs/src/projects/auth/endpoint/me/startEmailChange/startEmailChangeEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "../flow/useFlowMutation";

// Le mot de passe et la nouvelle adresse : un email (lien et code) part à celle-ci, qui remplace l'actuelle une fois
// confirmée
export function useStartEmailChange() {
	return useFlowMutation(
		async (body: StartEmailChangeBodyDto) =>
			(
				await fetchHandler<StartEmailChange>({
					url: `${ApiPrefixEnum.AUTH}/me/email`,
					method: HttpMethodEnum.POST,
					protected: true,
					body,
				})
			).data,
	);
}
