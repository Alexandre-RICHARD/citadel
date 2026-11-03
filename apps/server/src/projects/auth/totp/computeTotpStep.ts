import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";

// Le pas de temps d'un instant (RFC 6238) : le nombre de périodes depuis le 1er janvier 1970. Il sert de compteur HOTP
export function computeTotpStep(timeMs: number, periodSeconds: number): number {
	return Math.floor(timeMs / (periodSeconds * DurationMsEnum.SECOND));
}
