import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { isStatusAllowed } from "@citadel/specs/src/projects/backlog/rule/status/isStatusAllowed.ts";
import type { Transaction } from "sequelize";

import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { NewUserVersionBean } from "../bean/newUserVersionBean.type.ts";
import type { StoredGameBean } from "../bean/storedGameBean.type.ts";
import { userVersionExistsQuery } from "../query/userVersion/userVersionExistsQuery.ts";

/**
 * Une nouvelle version jouée du jeu (cahier des charges, §5 et §8) : une de ses versions en base, une plateforme proposée
 * pour cette version, des DLC du jeu, un statut que le type de fin propose, et pas déjà jouée sur cette plateforme
 */
export async function checkNewUserVersion(
	game: StoredGameBean,
	userVersion: NewUserVersionBean,
	endingType: EndingTypeEnum,
	transaction: Transaction,
): Promise<void> {
	const version = game.versions.find(({ id }) => id === userVersion.versionId);
	if (version === undefined)
		throw new NotFoundError(
			BacklogErrorCodeEnum.VERSION_NOT_FOUND,
			`No version with id ${userVersion.versionId} for game : ${game.id}`,
		);

	if (!version.platformOptions.some(({ id }) => id === userVersion.platformId))
		throw new ConflictError(
			BacklogErrorCodeEnum.PLATFORM_NOT_ALLOWED,
			`Platform ${userVersion.platformId} is not offered for version : ${version.id}`,
		);

	const gameDlcIds = new Set(game.dlcs.map(({ id }) => id));
	const unknownDlcId = userVersion.doneDlcIds.find((id) => !gameDlcIds.has(id));
	if (unknownDlcId !== undefined)
		throw new NotFoundError(
			BacklogErrorCodeEnum.DLC_NOT_FOUND,
			`No DLC with id ${unknownDlcId} for game : ${game.id}`,
		);

	if (!isStatusAllowed(userVersion.status, endingType))
		throw new ConflictError(
			BacklogErrorCodeEnum.STATUS_NOT_ALLOWED,
			`Status ${userVersion.status} is not offered for ending type : ${endingType}`,
		);

	if (
		await userVersionExistsQuery(
			userVersion.versionId,
			userVersion.platformId,
			transaction,
		)
	)
		throw new ConflictError(
			BacklogErrorCodeEnum.USER_VERSION_ALREADY_EXISTS,
			`Version ${userVersion.versionId} is already played on platform : ${userVersion.platformId}`,
		);
}
