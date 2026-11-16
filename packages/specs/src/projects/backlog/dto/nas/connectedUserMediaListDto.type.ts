import type { UserMediaListDto } from "../userMedia/userMediaListDto.type.ts";
import type { ConnectedUserMediaDto } from "./connectedUserMediaDto.type.ts";

// Le tableau en mode connecté : la même page que le mode classique, chaque ligne avec ses colonnes du NAS
export type ConnectedUserMediaListDto = Omit<UserMediaListDto, "userMedia"> & {
	userMedia: ConnectedUserMediaDto[];
};
