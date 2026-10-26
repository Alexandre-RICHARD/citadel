import type { IgdbReference } from "./type/igdbReference.type.ts";

const UNKNOWN_TYPE = "unknown type";

export function getGameTypeName(
	reference: IgdbReference,
	gameType: number | undefined,
): string {
	return (
		(gameType === undefined ? undefined : reference.gameTypes.get(gameType)) ??
		UNKNOWN_TYPE
	);
}
