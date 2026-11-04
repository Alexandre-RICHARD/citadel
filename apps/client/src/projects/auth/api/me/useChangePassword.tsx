import type { ChangePasswordBodyDto } from "@citadel/specs/src/projects/auth/endpoint/me/changePassword/changePasswordBodyDto.type";
import type { ChangePassword } from "@citadel/specs/src/projects/auth/endpoint/me/changePassword/changePasswordEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

// Le mot de passe actuel et le nouveau : les autres sessions du compte sont fermées, celle-ci reste ouverte
export function useChangePassword() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: ChangePasswordBodyDto): Promise<void> => {
			await fetchHandler<ChangePassword>({
				url: `${ApiPrefixEnum.AUTH}/me/password`,
				method: HttpMethodEnum.POST,
				protected: true,
				body,
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() }),
	});
}
