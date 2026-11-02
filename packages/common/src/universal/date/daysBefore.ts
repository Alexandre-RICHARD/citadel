import { DurationMsEnum } from "./durationMs.enum.ts";

export function daysBefore(date: Date, days: number): Date {
	return new Date(date.getTime() - days * DurationMsEnum.DAY);
}
