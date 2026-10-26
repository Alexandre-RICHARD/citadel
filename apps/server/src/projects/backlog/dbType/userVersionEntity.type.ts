import type { DoneDlc } from "../models/DoneDlc.ts";
import type { Platform } from "../models/Platform.ts";
import type { UserVersion } from "../models/UserVersion.ts";
import type { Version } from "../models/Version.ts";

// Version jouée chargée avec sa version, sa plateforme et ses DLC faits ; Omit : le modèle déclare ces relations facultatives
export type UserVersionEntity = Omit<
	UserVersion,
	"version" | "platform" | "doneDlcs"
> & {
	version: Version;
	platform: Platform;
	doneDlcs: DoneDlc[];
};
