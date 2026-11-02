import type { ContactRetryStopEnum } from "../contactRetryStop.enum.ts";

// Le bilan d'une relance des messages de contact gardés en base
export type ContactUnsentRetryDto = {
	// Les messages dont la notification est partie : leur ligne est supprimée
	sentCount: number;
	// Ceux qui attendent encore en base
	remainingCount: number;
	// null : la relance est allée au bout
	stoppedBecause: ContactRetryStopEnum | null;
};
