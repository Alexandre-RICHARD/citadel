import type { PlatformBean } from "../../bean/platformBean.type.ts";
import type { Platform } from "../../models/Platform.ts";

export function fromPlatformEntityToPlatformBean(
	platform: Platform,
): PlatformBean {
	return {
		id: platform.id,
		shortName: platform.shortName,
		technicalName: platform.technicalName,
		emulatedPlatformId: platform.emulatedPlatformId,
	};
}
