import { externalLinks } from "@citadel/specs/src/links/externalLinks";

import type { ExternalLinkKey } from "./externalLinkKey.type";

export function isExternalLinkKey(key: string): key is ExternalLinkKey {
	return Object.hasOwn(externalLinks, key);
}
