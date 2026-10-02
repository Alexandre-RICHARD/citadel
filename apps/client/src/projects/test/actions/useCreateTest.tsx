import type { CreateTest } from "@citadel/specs/src/projects/test/endpoint/createTestEndpoint";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
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
				url: `${ApiPrefixEnum.TEST}/test`,
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
