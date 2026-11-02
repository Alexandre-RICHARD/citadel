import type { ContactRetryStopEnum } from "@citadel/specs/src/projects/contact/contactRetryStop.enum.ts";

export type ContactUnsentRetryBean = {
	sentCount: number;
	remainingCount: number;
	stoppedBecause: ContactRetryStopEnum | null;
};
