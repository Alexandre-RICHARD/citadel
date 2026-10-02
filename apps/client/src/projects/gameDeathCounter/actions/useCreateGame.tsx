import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import type { CreateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBodyDto.type";
import type { CreateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

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
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`,
			method: HttpMethodEnum.POST,
			protected: false,
			body,
		}),
		onSuccess: props.onSuccess,
		onError: props.onError,
	});
}
