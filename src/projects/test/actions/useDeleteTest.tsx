import type { DeleteTest } from "@specs/project/test/endpoint/deleteTest.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useMutation } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/helpers/fetch/handlerFetch";

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
				url: "/test/:id",
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
