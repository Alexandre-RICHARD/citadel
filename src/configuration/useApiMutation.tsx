import type { EndpointModel } from "@specs/specUtils/endpointModel.type";
import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "../common/error/ApiError";
import { fetchHandler } from "../common/helpers/fetch/handlerFetch";

type Props<Endpoint extends EndpointModel, Args> = {
	mutationKey: unknown[];
	buildRequest: (args: Args) => Endpoint["request"];
	onMutate?: (() => void) | undefined;
	onSuccess?: ((data: Endpoint["response"]["data"]) => void) | undefined;
	onError?: ((error: ApiError) => void) | undefined;
	onSettled?: (() => void) | undefined;
};

export function useApiMutation<Endpoint extends EndpointModel, Args>({
	mutationKey,
	buildRequest,
	onMutate,
	onSuccess,
	onError,
	onSettled,
}: Props<Endpoint, Args>) {
	return useMutation<Endpoint["response"], ApiError, Args>({
		mutationKey,
		mutationFn: (args) => fetchHandler<Endpoint>(buildRequest(args)),
		...(onMutate && { onMutate }),
		...(onSuccess && {
			onSuccess: (response) => onSuccess(response.data),
		}),
		...(onError && { onError }),
		...(onSettled && { onSettled }),
	});
}
