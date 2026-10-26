import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import type { PlatformBean } from "../../bean/platformBean.type.ts";
import type { IgdbPlatform } from "../../igdb/type/igdbPlatform.type.ts";

// Nom affiché : l'abréviation IGDB (« PS2 »), sinon le nom complet ; nom technique : le slug, qui nomme l'icône
export function fromIgdbPlatformToPlatformBean(
	platform: IgdbPlatform,
): PlatformBean {
	return {
		id: platform.id,
		shortName: trimToNull(platform.abbreviation) ?? platform.name,
		technicalName: platform.slug,
		emulatedPlatformId: null,
	};
}
