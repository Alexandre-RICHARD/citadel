import type { DeleteTest } from "@citadel/specs/src/projects/test/endpoint/deleteTestEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/api/fetch/fetchHandler";

type MutationArgs = {
	id: string;
};

type Props = {
	onMutate?: () => void;
	onSuccess?: () => void;
	onError?: () => void;
	onSettled?: () => void;
};

export function useDeleteTest({
	onMutate,
	onSuccess,
	onError,
	onSettled,
}: Props) {
	const { error, isPending, mutate } = useMutation<
		DeleteTest["response"],
		DeleteTest["error"],
		MutationArgs
	>({
		mutationKey: ["createTest"],
		mutationFn: async ({ id }) =>
			fetchHandler<DeleteTest>({
				url: `${ApiPrefixEnum.TEST}/test/:id`,
				method: HttpMethodEnum.DELETE,
				protected: false,
				pathParams: {
					id: id ?? "-1",
				},
			}),
		onMutate: () => onMutate?.(),
		onSuccess: () => onSuccess?.(),
		onError: () => onError?.(),
		onSettled: () => onSettled?.(),
	});

	return { error, isPending, mutate };
}
