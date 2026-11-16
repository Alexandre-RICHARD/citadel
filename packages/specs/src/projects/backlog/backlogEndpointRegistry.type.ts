import type { DeleteStoredGame } from "./endpoint/games/deleteStoredGame/deleteStoredGameEndpoint.interface.ts";
import type { GetStoredGame } from "./endpoint/games/getStoredGame/getStoredGameEndpoint.interface.ts";
import type { GetStoredGames } from "./endpoint/games/getStoredGames/getStoredGamesEndpoint.interface.ts";
import type { ImportGameContent } from "./endpoint/games/importGameContent/importGameContentEndpoint.interface.ts";
import type { StoreGame } from "./endpoint/games/storeGame/storeGameEndpoint.interface.ts";
import type { GetGameImages } from "./endpoint/igdb/getGameImages/getGameImagesEndpoint.interface.ts";
import type { GetGamePreview } from "./endpoint/igdb/getGamePreview/getGamePreviewEndpoint.interface.ts";
import type { SearchIgdbGames } from "./endpoint/igdb/searchIgdbGames/searchIgdbGamesEndpoint.interface.ts";
import type { CancelMediaImport } from "./endpoint/mediaImports/cancelMediaImport/cancelMediaImportEndpoint.interface.ts";
import type { GetMediaImport } from "./endpoint/mediaImports/getMediaImport/getMediaImportEndpoint.interface.ts";
import type { StartMediaImport } from "./endpoint/mediaImports/startMediaImport/startMediaImportEndpoint.interface.ts";
import type { ValidateMediaImport } from "./endpoint/mediaImports/validateMediaImport/validateMediaImportEndpoint.interface.ts";
import type { GetConnectedShowSeasons } from "./endpoint/nas/getConnectedShowSeasons/getConnectedShowSeasonsEndpoint.interface.ts";
import type { GetConnectedUserMedia } from "./endpoint/nas/getConnectedUserMedia/getConnectedUserMediaEndpoint.interface.ts";
import type { GetForgottenMedia } from "./endpoint/nas/getForgottenMedia/getForgottenMediaEndpoint.interface.ts";
import type { GetNasStatus } from "./endpoint/nas/getNasStatus/getNasStatusEndpoint.interface.ts";
import type { LockNas } from "./endpoint/nas/lockNas/lockNasEndpoint.interface.ts";
import type { SetMediaVerified } from "./endpoint/nas/setMediaVerified/setMediaVerifiedEndpoint.interface.ts";
import type { UnlockNas } from "./endpoint/nas/unlockNas/unlockNasEndpoint.interface.ts";
import type { GetBacklogOverview } from "./endpoint/overview/getBacklogOverview/getBacklogOverviewEndpoint.interface.ts";
import type { GetAllSagas } from "./endpoint/sagas/getAllSagas/getAllSagasEndpoint.interface.ts";
import type { GetSagaEntries } from "./endpoint/sagas/getSagaEntries/getSagaEntriesEndpoint.interface.ts";
import type { ReorderSaga } from "./endpoint/sagas/reorderSaga/reorderSagaEndpoint.interface.ts";
import type { GetAllSeries } from "./endpoint/series/getAllSeries/getAllSeriesEndpoint.interface.ts";
import type { GetSeriesEntries } from "./endpoint/series/getSeriesEntries/getSeriesEntriesEndpoint.interface.ts";
import type { ReorderSeries } from "./endpoint/series/reorderSeries/reorderSeriesEndpoint.interface.ts";
import type { ApplyShowUpdates } from "./endpoint/showUpdates/applyShowUpdates/applyShowUpdatesEndpoint.interface.ts";
import type { GetShowUpdates } from "./endpoint/showUpdates/getShowUpdates/getShowUpdatesEndpoint.interface.ts";
import type { RefreshOngoingShows } from "./endpoint/showUpdates/refreshOngoingShows/refreshOngoingShowsEndpoint.interface.ts";
import type { GetMediaPosters } from "./endpoint/tmdb/getMediaPosters/getMediaPostersEndpoint.interface.ts";
import type { GetMoviePreview } from "./endpoint/tmdb/getMoviePreview/getMoviePreviewEndpoint.interface.ts";
import type { GetShowPreview } from "./endpoint/tmdb/getShowPreview/getShowPreviewEndpoint.interface.ts";
import type { SearchTmdbMedia } from "./endpoint/tmdb/searchTmdbMedia/searchTmdbMediaEndpoint.interface.ts";
import type { CreateUserGame } from "./endpoint/userGames/createUserGame/createUserGameEndpoint.interface.ts";
import type { CustomizeUserGame } from "./endpoint/userGames/customizeUserGame/customizeUserGameEndpoint.interface.ts";
import type { DeleteUserGame } from "./endpoint/userGames/deleteUserGame/deleteUserGameEndpoint.interface.ts";
import type { GetUserGames } from "./endpoint/userGames/getUserGames/getUserGamesEndpoint.interface.ts";
import type { CreateUserMedia } from "./endpoint/userMedia/createUserMedia/createUserMediaEndpoint.interface.ts";
import type { CustomizeUserMedia } from "./endpoint/userMedia/customizeUserMedia/customizeUserMediaEndpoint.interface.ts";
import type { DeleteUserMedia } from "./endpoint/userMedia/deleteUserMedia/deleteUserMediaEndpoint.interface.ts";
import type { GetAllUserMedia } from "./endpoint/userMedia/getAllUserMedia/getAllUserMediaEndpoint.interface.ts";
import type { GetShowSeasons } from "./endpoint/userMedia/getShowSeasons/getShowSeasonsEndpoint.interface.ts";
import type { SetEpisodesWatched } from "./endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedEndpoint.interface.ts";
import type { UpdateUserMedia } from "./endpoint/userMedia/updateUserMedia/updateUserMediaEndpoint.interface.ts";
import type { CreateUserVersion } from "./endpoint/userVersions/createUserVersion/createUserVersionEndpoint.interface.ts";
import type { DeleteUserVersion } from "./endpoint/userVersions/deleteUserVersion/deleteUserVersionEndpoint.interface.ts";
import type { SetDlcDone } from "./endpoint/userVersions/setDlcDone/setDlcDoneEndpoint.interface.ts";
import type { UpdateUserVersion } from "./endpoint/userVersions/updateUserVersion/updateUserVersionEndpoint.interface.ts";

export type BacklogEndpointRegistry =
	| CreateUserGame
	| CreateUserVersion
	| CustomizeUserGame
	| DeleteStoredGame
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
	| UpdateUserVersion
	| SearchTmdbMedia
	| GetMoviePreview
	| GetShowPreview
	| GetMediaPosters
	| CreateUserMedia
	| CustomizeUserMedia
	| UpdateUserMedia
	| DeleteUserMedia
	| SetEpisodesWatched
	| GetAllUserMedia
	| GetShowSeasons
	| GetAllSagas
	| GetSagaEntries
	| ReorderSaga
	| StartMediaImport
	| GetMediaImport
	| ValidateMediaImport
	| CancelMediaImport
	| GetShowUpdates
	| ApplyShowUpdates
	| RefreshOngoingShows
	| GetNasStatus
	| UnlockNas
	| LockNas
	| GetConnectedUserMedia
	| GetConnectedShowSeasons
	| SetMediaVerified
	| GetForgottenMedia;
