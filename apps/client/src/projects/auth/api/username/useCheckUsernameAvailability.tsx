import type { GetUsernameAvailability } from "@citadel/specs/src/projects/auth/endpoint/usernames/getUsernameAvailability/getUsernameAvailabilityEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";

// « Vérifier la disponibilité » : une question posée au clic, jamais gardée (un pseudo libre peut être pris la seconde
// suivante). Répond si le pseudo est libre
export function useCheckUsernameAvailability() {
	return useMutation({
		mutationFn: async (username: string): Promise<boolean> =>
			(
				await fetchHandler<GetUsernameAvailability>({
					url: `${ApiPrefixEnum.AUTH}/usernames/:username/availability`,
					method: HttpMethodEnum.GET,
					protected: false,
					pathParams: { username },
				})
			).data.isAvailable,
	});
}
