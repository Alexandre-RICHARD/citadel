import { getGameTypeName } from "./getGameTypeName.ts";
import { IgdbGameTypeNameEnum } from "./igdbGameTypeName.enum.ts";
import type { IgdbGameNode } from "./type/igdbGameNode.type.ts";
import type { IgdbReference } from "./type/igdbReference.type.ts";

// Types rattachés à leur original par `parent_game` ; un remake ou une extension standalone reste un jeu à part
const PARENT_GAME_VERSION_TYPES: string[] = [
	IgdbGameTypeNameEnum.REMASTER,
	IgdbGameTypeNameEnum.PORT,
	IgdbGameTypeNameEnum.EXPANDED_GAME,
];

// Parent qui mène à l'original : `version_parent` d'une édition, `parent_game` d'un remaster, portage ou version enrichie
export function getOriginalParentId(
	reference: IgdbReference,
	node: Pick<IgdbGameNode, "game_type" | "version_parent" | "parent_game">,
): number | undefined {
	return (
		node.version_parent ??
		(PARENT_GAME_VERSION_TYPES.includes(
			getGameTypeName(reference, node.game_type),
		)
			? node.parent_game
			: undefined)
	);
}
