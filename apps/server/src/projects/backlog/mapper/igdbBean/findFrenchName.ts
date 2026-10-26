import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import type { IgdbAlternativeName } from "../../igdb/type/igdbAlternativeName.type.ts";

const FRENCH_COMMENT = "french";

/**
 * Nom VF (cahier des charges, §3) : le premier nom alternatif dont le commentaire parle de français (« French title »,
 * « French alternative title »…), IGDB n'ayant pas de région France. null sans titre français, ou s'il égale le nom VO
 */
export function findFrenchName(
	name: string,
	alternativeNames: IgdbAlternativeName[] = [],
): string | null {
	const frenchName = trimToNull(
		alternativeNames.find(({ comment }) =>
			comment?.toLowerCase().includes(FRENCH_COMMENT),
		)?.name,
	);
	return frenchName === null || frenchName.toLowerCase() === name.toLowerCase()
		? null
		: frenchName;
}
