import type { GetStoredGame } from "./endpoint/games/getStoredGame/getStoredGameEndpoint.interface.ts";
import type { GetStoredGames } from "./endpoint/games/getStoredGames/getStoredGamesEndpoint.interface.ts";
import type { ImportGameContent } from "./endpoint/games/importGameContent/importGameContentEndpoint.interface.ts";
import type { StoreGame } from "./endpoint/games/storeGame/storeGameEndpoint.interface.ts";
import type { GetGameImages } from "./endpoint/igdb/getGameImages/getGameImagesEndpoint.interface.ts";
import type { GetGamePreview } from "./endpoint/igdb/getGamePreview/getGamePreviewEndpoint.interface.ts";
import type { SearchIgdbGames } from "./endpoint/igdb/searchIgdbGames/searchIgdbGamesEndpoint.interface.ts";
import type { GetBacklogOverview } from "./endpoint/overview/getBacklogOverview/getBacklogOverviewEndpoint.interface.ts";
import type { GetAllSeries } from "./endpoint/series/getAllSeries/getAllSeriesEndpoint.interface.ts";
import type { GetSeriesEntries } from "./endpoint/series/getSeriesEntries/getSeriesEntriesEndpoint.interface.ts";
import type { ReorderSeries } from "./endpoint/series/reorderSeries/reorderSeriesEndpoint.interface.ts";
import type { CreateUserGame } from "./endpoint/userGames/createUserGame/createUserGameEndpoint.interface.ts";
import type { CustomizeUserGame } from "./endpoint/userGames/customizeUserGame/customizeUserGameEndpoint.interface.ts";
import type { DeleteUserGame } from "./endpoint/userGames/deleteUserGame/deleteUserGameEndpoint.interface.ts";
import type { GetUserGames } from "./endpoint/userGames/getUserGames/getUserGamesEndpoint.interface.ts";
import type { CreateUserVersion } from "./endpoint/userVersions/createUserVersion/createUserVersionEndpoint.interface.ts";
import type { DeleteUserVersion } from "./endpoint/userVersions/deleteUserVersion/deleteUserVersionEndpoint.interface.ts";
import type { SetDlcDone } from "./endpoint/userVersions/setDlcDone/setDlcDoneEndpoint.interface.ts";
import type { UpdateUserVersion } from "./endpoint/userVersions/updateUserVersion/updateUserVersionEndpoint.interface.ts";

export type BacklogEndpointRegistry =
	| CreateUserGame
	| CreateUserVersion
	| CustomizeUserGame
	| DeleteUserGame
	| DeleteUserVersion
	| GetAllSeries
	| GetBacklogOverview
	| GetGameImages
	| GetGamePreview
	| GetSeriesEntries
	| GetStoredGame
	| GetStoredGames
	| GetUserGames
	| ImportGameContent
	| ReorderSeries
	| SearchIgdbGames
	| SetDlcDone
	| StoreGame
	| UpdateUserVersion;
