import type { buildNasSettings } from "./buildNasSettings.ts";

export type NasSettings = NonNullable<ReturnType<typeof buildNasSettings>>;
