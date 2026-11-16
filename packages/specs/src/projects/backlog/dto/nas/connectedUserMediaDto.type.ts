import type { UserMediaDto } from "../userMedia/userMediaDto.type.ts";
import type { NasDetailsDto } from "./nasDetailsDto.type.ts";

// Une ligne du tableau en mode connecté : celle du mode classique, et ses colonnes du NAS
export type ConnectedUserMediaDto = UserMediaDto & {
	nas: NasDetailsDto;
};
