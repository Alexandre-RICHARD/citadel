import type { SessionDto } from "./sessionDto.type.ts";

// Les sessions encore valables du compte, la plus récemment active d'abord
export type SessionListDto = {
	sessions: SessionDto[];
};
