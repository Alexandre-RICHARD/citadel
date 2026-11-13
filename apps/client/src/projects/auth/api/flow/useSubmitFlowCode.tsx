import type { SubmitFlowCodeBodyDto } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowCode/submitFlowCodeBodyDto.type";
import type { SubmitFlowCode } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowCode/submitFlowCodeEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "./useFlowMutation";

// Le code reçu par email ; `username` remplace un pseudo pris entre-temps (inscription)
export function useSubmitFlowCode() {
	return useFlowMutation(
		async (body: SubmitFlowCodeBodyDto) =>
			(
				await fetchHandler<SubmitFlowCode>({
					url: `${ApiPrefixEnum.AUTH}/flow/code`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
