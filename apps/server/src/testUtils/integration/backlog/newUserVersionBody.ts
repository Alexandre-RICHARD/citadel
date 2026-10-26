import type { CreateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodyDto.type.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";

// Corps d'une nouvelle version jouée aux valeurs par défaut du formulaire (cahier des charges, §8)
export function newUserVersionBody(
	versionId: number,
	platformId: number,
	overrides: Partial<CreateUserVersionBodyDto> = {},
): CreateUserVersionBodyDto {
	return {
		versionId,
		platformId,
		status: StatusEnum.NOT_STARTED,
		isOwned: false,
		isUpNext: false,
		finishDate: null,
		sureFinishCount: 0,
		probableFinishCount: 0,
		trackedPlayTimeMinutes: 0,
		estimatedPlayTimeMinutes: 0,
		rating: null,
		comment: null,
		doneDlcIds: [],
		...overrides,
	};
}
