import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";

// Les minutes qu'il reste, minute entamée comprise : la durée annoncée par un mail n'est jamais plus longue que la vraie
// d'une minute entière… et jamais nulle tant qu'il reste du temps
export function countRemainingMinutes(endsAt: Date, now: Date): number {
	return Math.max(
		0,
		Math.ceil((endsAt.getTime() - now.getTime()) / DurationMsEnum.MINUTE),
	);
}
