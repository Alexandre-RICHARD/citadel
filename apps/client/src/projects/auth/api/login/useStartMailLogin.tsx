import type { StartMailLoginBodyDto } from "@citadel/specs/src/projects/auth/endpoint/login/startMailLogin/startMailLoginBodyDto.type";
import type { StartMailLogin } from "@citadel/specs/src/projects/auth/endpoint/login/startMailLogin/startMailLoginEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "../flow/useFlowMutation";

export function useStartMailLogin() {
	return useFlowMutation(
		async (body: StartMailLoginBodyDto) =>
			(
				await fetchHandler<StartMailLogin>({
					url: `${ApiPrefixEnum.AUTH}/login/mail`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
