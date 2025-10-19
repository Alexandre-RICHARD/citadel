import type { UpdateTest } from "@specs/project/test/endpoint/updateTest.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useMutation } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/helpers/fetch/handlerFetch";

type MutationArgs = {
	id: string;
	name: string;
	isActive: boolean;
};

type Props = {
	onMutate?: () => void;
	onSuccess?: () => void;
	onError?: () => void;
	onSettled?: () => void;
};

export function useUpdateTest({
	onMutate,
	onSuccess,
	onError,
	onSettled,
}: Props) {
	const { data, error, isPending, mutate } = useMutation<
		UpdateTest["response"],
		UpdateTest["error"],
		MutationArgs
	>({
		mutationKey: ["createTest"],
		mutationFn: async ({
			id,
			name,
			isActive,
		}: {
			id: string | null;
			name: string;
			isActive: boolean;
		}) =>
			fetchHandler<UpdateTest>({
				url: "/test/:id",
				method: HttpMethodEnum.PUT,
				protected: false,
				pathParams: {
					id: id ?? "-1",
				},
				body: { name, isActive },
			}),
		onMutate: () => onMutate?.(),
		onSuccess: () => onSuccess?.(),
		onError: () => onError?.(),
		onSettled: () => onSettled?.(),
	});

	return { data, error, isPending, mutate };
}
