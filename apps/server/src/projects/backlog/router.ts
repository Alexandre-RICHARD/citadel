import type { BacklogEndpointRegistry } from "@citadel/specs/src/projects/backlog/backlogEndpointRegistry.type.ts";
import { getStoredGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGame/getStoredGamePathParamSchema.ts";
import { getStoredGamesQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/getStoredGames/getStoredGamesQueryParamSchema.ts";
import { importGameContentBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentBodySchema.ts";
import { importGameContentPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentPathParamSchema.ts";
import { storeGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/games/storeGame/storeGameBodySchema.ts";
import { getGameImagesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGameImages/getGameImagesPathParamSchema.ts";
import { getGamePreviewPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/igdb/getGamePreview/getGamePreviewPathParamSchema.ts";
import { searchIgdbGamesQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/igdb/searchIgdbGames/searchIgdbGamesQueryParamSchema.ts";
import { getSeriesEntriesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/series/getSeriesEntries/getSeriesEntriesPathParamSchema.ts";
import { reorderSeriesBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesBodySchema.ts";
import { reorderSeriesPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/series/reorderSeries/reorderSeriesPathParamSchema.ts";
import { createUserGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodySchema.ts";
import { customizeUserGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameBodySchema.ts";
import { customizeUserGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGamePathParamSchema.ts";
import { deleteUserGamePathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/deleteUserGame/deleteUserGamePathParamSchema.ts";
import { getUserGamesQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/getUserGames/getUserGamesQueryParamSchema.ts";
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
import { requestValidator } from "../../middleware/requestValidator.ts";
import { gameController } from "./controller/gameController.ts";
import { igdbController } from "./controller/igdbController.ts";
import { overviewController } from "./controller/overviewController.ts";
import { seriesController } from "./controller/seriesController.ts";
import { userGameController } from "./controller/userGameController.ts";
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

export const backlogRouter = expressRouter;
