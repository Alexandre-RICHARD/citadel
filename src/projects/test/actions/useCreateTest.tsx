import type { CreateTest } from "@specs/project/test/endpoint/createTest.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useMutation } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/helpers/fetch/handlerFetch";

type MutationArgs = {
	name: string;
};

type Props = {
	onMutate?: () => void;
	onSuccess?: () => void;
	onError?: () => void;
	onSettled?: () => void;
};

export function useCreateTest({
	onMutate,
	onSuccess,
	onError,
	onSettled,
}: Props) {
	const { data, error, isPending, mutate } = useMutation<
		CreateTest["response"],
		CreateTest["error"],
		MutationArgs
	>({
		mutationKey: ["createTest"],
		mutationFn: async ({ name }) =>
			fetchHandler<CreateTest>({
				url: "/test",
				method: HttpMethodEnum.POST,
				protected: false,
				body: { name },
			}),
		onMutate: () => onMutate?.(),
		onSuccess: () => onSuccess?.(),
		onError: () => onError?.(),
		onSettled: () => onSettled?.(),
	});

	return { data, error, isPending, mutate };
}
