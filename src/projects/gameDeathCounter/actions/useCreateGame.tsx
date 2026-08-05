// project/gameDeathCounter/actions/useCreateGame.ts
import type { GameSummaryDto } from "@specs/project/gameDeathCounter/dto/game/gameSummary.dto";
import type { CreateGame } from "@specs/project/gameDeathCounter/endpoint/games/createGame.endpoint";
import type { CreateGameBodyDto } from "@specs/project/gameDeathCounter/endpoint/games/createGameBody.dto";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";

import type { ApiError } from "../../../common/error/ApiError";
import { useApiMutation } from "../../../common/helpers/hook/useApiMutation";

type Props = {
	onSuccess?: ((game: GameSummaryDto) => void) | undefined;
	onError?: ((error: ApiError) => void) | undefined;
};

export function useCreateGame(props: Props = {}) {
	return useApiMutation<CreateGame, CreateGameBodyDto>({
		mutationKey: ["createGame"],
		buildRequest: (body) => ({
			url: "/gameDeathCounter/games",
			method: HttpMethodEnum.POST,
			protected: false,
			body,
		}),
		onSuccess: props.onSuccess,
		onError: props.onError,
	});
}
