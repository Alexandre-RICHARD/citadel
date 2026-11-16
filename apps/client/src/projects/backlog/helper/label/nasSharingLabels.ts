import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum";

// État de partage au dernier relevé (§5)
export const nasSharingLabels: Readonly<Record<NasSharingEnum, string>> = {
	[NasSharingEnum.SEEDING]: "En seed",
	[NasSharingEnum.TRACKER_UNREACHABLE]: "Tracker injoignable",
	[NasSharingEnum.ERROR]: "En erreur",
	[NasSharingEnum.NONE]: "Non présent",
};
