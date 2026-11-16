import type { JellyfinLibrary } from "./jellyfinLibrary.type.ts";

export type JellyfinClient = {
	library: () => Promise<JellyfinLibrary>;
};
