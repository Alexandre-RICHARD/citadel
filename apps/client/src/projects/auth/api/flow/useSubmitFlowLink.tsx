import type { SubmitFlowLinkBodyDto } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowLink/submitFlowLinkBodyDto.type";
import type { SubmitFlowLink } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowLink/submitFlowLinkEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "./useFlowMutation";

// Le lien du mail, envoyé par le clic de confirmation de /auth/verify
export function useSubmitFlowLink() {
	return useFlowMutation(
		async (body: SubmitFlowLinkBodyDto) =>
			(
				await fetchHandler<SubmitFlowLink>({
					url: `${ApiPrefixEnum.AUTH}/flow/link`,
					method: HttpMethodEnum.POST,
					protected: false,
					body,
				})
			).data,
	);
}
