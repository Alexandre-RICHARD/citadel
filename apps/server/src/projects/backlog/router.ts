import type { BacklogEndpointRegistry } from "@citadel/specs/src/projects/backlog/backlogEndpointRegistry.type.ts";
import { deleteStoredGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/deleteStoredGame/deleteStoredGamePathParamSchema.ts";
import { getStoredGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGame/getStoredGamePathParamSchema.ts";
import { getStoredGamesQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGames/getStoredGamesQueryParamSchema.ts";
import { importGameContentBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentBodySchema.ts";
import { importGameContentPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentPathParamSchema.ts";
import { storeGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/games/storeGame/storeGameBodySchema.ts";
import { getGameImagesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGameImages/getGameImagesPathParamSchema.ts";
import { getGamePreviewPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGamePreview/getGamePreviewPathParamSchema.ts";
import { searchIgdbGamesQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/igdb/searchIgdbGames/searchIgdbGamesQueryParamSchema.ts";
import { startMediaImportBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/startMediaImport/startMediaImportBodySchema.ts";
import { getSagaEntriesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/sagas/getSagaEntries/getSagaEntriesPathParamSchema.ts";
import { reorderSagaBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaBodySchema.ts";
import { reorderSagaPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/sagas/reorderSaga/reorderSagaPathParamSchema.ts";
import { getSeriesEntriesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/series/getSeriesEntries/getSeriesEntriesPathParamSchema.ts";
import { reorderSeriesBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesBodySchema.ts";
import { reorderSeriesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesPathParamSchema.ts";
import { applyShowUpdatesBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/applyShowUpdates/applyShowUpdatesBodySchema.ts";
import { getMediaPostersPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMediaPosters/getMediaPostersPathParamSchema.ts";
import { getMoviePreviewPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getMoviePreview/getMoviePreviewPathParamSchema.ts";
import { getShowPreviewPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/getShowPreview/getShowPreviewPathParamSchema.ts";
import { searchTmdbMediaQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/tmdb/searchTmdbMedia/searchTmdbMediaQueryParamSchema.ts";
import { createUserGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodySchema.ts";
import { customizeUserGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameBodySchema.ts";
import { customizeUserGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGamePathParamSchema.ts";
import { deleteUserGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/deleteUserGame/deleteUserGamePathParamSchema.ts";
import { getUserGamesQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesQueryParamSchema.ts";
import { createUserMediaBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaBodySchema.ts";
import { customizeUserMediaBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaBodySchema.ts";
import { customizeUserMediaPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaPathParamSchema.ts";
import { deleteUserMediaPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/deleteUserMedia/deleteUserMediaPathParamSchema.ts";
import { getAllUserMediaQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getAllUserMedia/getAllUserMediaQueryParamSchema.ts";
import { getShowSeasonsPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/getShowSeasons/getShowSeasonsPathParamSchema.ts";
import { setEpisodesWatchedBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedBodySchema.ts";
import { setEpisodesWatchedPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/setEpisodesWatched/setEpisodesWatchedPathParamSchema.ts";
import { updateUserMediaBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaBodySchema.ts";
import { updateUserMediaPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaPathParamSchema.ts";
import { createUserVersionBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodySchema.ts";
import { createUserVersionPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionPathParamSchema.ts";
import { deleteUserVersionPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/deleteUserVersion/deleteUserVersionPathParamSchema.ts";
import { setDlcDoneBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDoneBodySchema.ts";
import { setDlcDonePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDonePathParamSchema.ts";
import { updateUserVersionBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionBodySchema.ts";
import { updateUserVersionPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/updateUserVersion/updateUserVersionPathParamSchema.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { internalOnly } from "../../middleware/internalOnly.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { gameController } from "./controller/gameController.ts";
import { igdbController } from "./controller/igdbController.ts";
import { mediaImportController } from "./controller/mediaImportController.ts";
import { overviewController } from "./controller/overviewController.ts";
import { sagaController } from "./controller/sagaController.ts";
import { seriesController } from "./controller/seriesController.ts";
import { showUpdateController } from "./controller/showUpdateController.ts";
import { tmdbController } from "./controller/tmdbController.ts";
import { userGameController } from "./controller/userGameController.ts";
import { userMediaController } from "./controller/userMediaController.ts";
import { userVersionController } from "./controller/userVersionController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<BacklogEndpointRegistry>(expressRouter);

// ==== IGDB ====
typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/igdb/search`,
	igdbController.search,
	requestValidator({ query: searchIgdbGamesQueryParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/igdb/games/:igdbId`,
	igdbController.getPreview,
	requestValidator({ params: getGamePreviewPathParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/igdb/games/:igdbId/images`,
	igdbController.getImages,
	requestValidator({ params: getGameImagesPathParamSchema }),
);

// ==== GAMES ====
typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/games`,
	gameController.getAll,
	requestValidator({ query: getStoredGamesQueryParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/games/:gameId`,
	gameController.getOne,
	requestValidator({ params: getStoredGamePathParamSchema }),
);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/games`,
	gameController.store,
	requestValidator({ body: storeGameBodySchema }),
);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/games/:gameId/imports`,
	gameController.importContent,
	requestValidator({
		params: importGameContentPathParamSchema,
		body: importGameContentBodySchema,
	}),
);

typedRouter.DELETE(
	`${ApiPrefixEnum.BACKLOG}/games/:gameId`,
	gameController.deleteOne,
	requestValidator({ params: deleteStoredGamePathParamSchema }),
);

// ==== OVERVIEW ====
typedRouter.GET(`${ApiPrefixEnum.BACKLOG}/overview`, overviewController.get);

// ==== USER GAMES ====
typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/user-games`,
	userGameController.getAll,
	requestValidator({ query: getUserGamesQueryParamSchema }),
);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/user-games`,
	userGameController.create,
	requestValidator({ body: createUserGameBodySchema }),
);

typedRouter.PUT(
	`${ApiPrefixEnum.BACKLOG}/user-games/:gameId`,
	userGameController.customize,
	requestValidator({
		params: customizeUserGamePathParamSchema,
		body: customizeUserGameBodySchema,
	}),
);

typedRouter.DELETE(
	`${ApiPrefixEnum.BACKLOG}/user-games/:gameId`,
	userGameController.delete,
	requestValidator({ params: deleteUserGamePathParamSchema }),
);

// ==== USER VERSIONS ====
typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/user-games/:gameId/user-versions`,
	userVersionController.create,
	requestValidator({
		params: createUserVersionPathParamSchema,
		body: createUserVersionBodySchema,
	}),
);

typedRouter.PATCH(
	`${ApiPrefixEnum.BACKLOG}/user-versions/:id`,
	userVersionController.update,
	requestValidator({
		params: updateUserVersionPathParamSchema,
		body: updateUserVersionBodySchema,
	}),
);

typedRouter.DELETE(
	`${ApiPrefixEnum.BACKLOG}/user-versions/:id`,
	userVersionController.delete,
	requestValidator({ params: deleteUserVersionPathParamSchema }),
);

typedRouter.PATCH(
	`${ApiPrefixEnum.BACKLOG}/user-versions/:id/done-dlcs/:dlcId`,
	userVersionController.setDlcDone,
	requestValidator({
		params: setDlcDonePathParamSchema,
		body: setDlcDoneBodySchema,
	}),
);

// ==== SERIES ====
typedRouter.GET(`${ApiPrefixEnum.BACKLOG}/series`, seriesController.getAll);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/series/:seriesId/entries`,
	seriesController.getEntries,
	requestValidator({ params: getSeriesEntriesPathParamSchema }),
);

typedRouter.PUT(
	`${ApiPrefixEnum.BACKLOG}/series/:seriesId/entries`,
	seriesController.reorder,
	requestValidator({
		params: reorderSeriesPathParamSchema,
		body: reorderSeriesBodySchema,
	}),
);

// ==== FILMS ET SÉRIES : TMDB ====
typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/tmdb/search`,
	tmdbController.search,
	requestValidator({ query: searchTmdbMediaQueryParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/tmdb/movies/:tmdbId`,
	tmdbController.getMoviePreview,
	requestValidator({ params: getMoviePreviewPathParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/tmdb/shows/:tmdbId`,
	tmdbController.getShowPreview,
	requestValidator({ params: getShowPreviewPathParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/tmdb/:mediaType/:tmdbId/posters`,
	tmdbController.getPosters,
	requestValidator({ params: getMediaPostersPathParamSchema }),
);

// ==== FILMS ET SÉRIES : BACKLOG DU COMPTE ====
typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/user-media`,
	userMediaController.getAll,
	requestValidator({ query: getAllUserMediaQueryParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId/seasons`,
	userMediaController.getSeasons,
	requestValidator({ params: getShowSeasonsPathParamSchema }),
);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/user-media`,
	userMediaController.create,
	requestValidator({ body: createUserMediaBodySchema }),
);

typedRouter.PUT(
	`${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`,
	userMediaController.customize,
	requestValidator({
		params: customizeUserMediaPathParamSchema,
		body: customizeUserMediaBodySchema,
	}),
);

typedRouter.PATCH(
	`${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`,
	userMediaController.update,
	requestValidator({
		params: updateUserMediaPathParamSchema,
		body: updateUserMediaBodySchema,
	}),
);

typedRouter.DELETE(
	`${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`,
	userMediaController.delete,
	requestValidator({ params: deleteUserMediaPathParamSchema }),
);

typedRouter.PUT(
	`${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId/watched-episodes`,
	userMediaController.setEpisodesWatched,
	requestValidator({
		params: setEpisodesWatchedPathParamSchema,
		body: setEpisodesWatchedBodySchema,
	}),
);

typedRouter.GET(`${ApiPrefixEnum.BACKLOG}/sagas`, sagaController.getAll);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/sagas/:sagaId/entries`,
	sagaController.getEntries,
	requestValidator({ params: getSagaEntriesPathParamSchema }),
);

typedRouter.PUT(
	`${ApiPrefixEnum.BACKLOG}/sagas/:sagaId/entries`,
	sagaController.reorder,
	requestValidator({
		params: reorderSagaPathParamSchema,
		body: reorderSagaBodySchema,
	}),
);

// ==== FILMS ET SÉRIES : IMPORT DE LISTE ====
typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/media-imports`,
	mediaImportController.start,
	requestValidator({ body: startMediaImportBodySchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/media-imports/current`,
	mediaImportController.get,
);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/media-imports/current/validation`,
	mediaImportController.validate,
);

typedRouter.DELETE(
	`${ApiPrefixEnum.BACKLOG}/media-imports/current`,
	mediaImportController.cancel,
);

// ==== FILMS ET SÉRIES : NOUVEAUX ÉPISODES ====
typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/show-updates`,
	showUpdateController.get,
);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/show-updates`,
	showUpdateController.apply,
	requestValidator({ body: applyShowUpdatesBodySchema }),
);

// Le job media-tmdb d'infra-ops, chaque nuit, par le réseau Docker
typedRouter.POST(
	`${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.BACKLOG}/show-updates`,
	showUpdateController.refreshOngoing,
	internalOnly,
);

export const backlogRouter = expressRouter;
