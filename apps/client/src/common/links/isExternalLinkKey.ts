import type { ExternalLinkKey } from "./externalLinkKey.type";
import { externalLinks } from "./externalLinks";

export function isExternalLinkKey(key: string): key is ExternalLinkKey {
	return Object.hasOwn(externalLinks, key);
}
