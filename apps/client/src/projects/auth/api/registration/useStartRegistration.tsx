import type { StartRegistrationBodyDto } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationBodyDto.type";
import type { StartRegistration } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "../flow/useFlowMutation";

export function useStartRegistration() {
	return useFlowMutation(
		async (body: StartRegistrationBodyDto) =>
			(
				await fetchHandler<StartRegistration>({
					url: `${ApiPrefixEnum.AUTH}/registrations`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
