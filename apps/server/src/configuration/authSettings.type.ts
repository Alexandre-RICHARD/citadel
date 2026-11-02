import type { buildAuthSettings } from "./buildAuthSettings.ts";

export type AuthSettings = ReturnType<typeof buildAuthSettings>;
