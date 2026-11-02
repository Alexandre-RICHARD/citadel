import type { AbandonFlow } from "@citadel/specs/src/projects/auth/endpoint/flow/abandonFlow/abandonFlowEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { useFlowMutation } from "./useFlowMutation";

// « Recommencer » : le code et le lien du parcours ne marchent plus, la page revient à son formulaire
export function useAbandonFlow() {
	return useFlowMutation(async () => {
		await fetchHandler<AbandonFlow>({
			url: `${ApiPrefixEnum.AUTH}/flow`,
			method: HttpMethodEnum.DELETE,
			protected: false,
		});
		return { flow: null };
	});
}
