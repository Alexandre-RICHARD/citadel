import type { GameSummaryDto } from "@specs/projects/gameDeathCounter/dto/game/gameSummary.dto";
import type { CreateGame } from "@specs/projects/gameDeathCounter/endpoint/games/createGame/createGame.endpoint";
import type { CreateGameBodyDto } from "@specs/projects/gameDeathCounter/endpoint/games/createGame/createGameBody.dto";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";

import type { ApiError } from "../../../common/error/ApiError";
import { useApiMutation } from "../../../configuration/useApiMutation";

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
