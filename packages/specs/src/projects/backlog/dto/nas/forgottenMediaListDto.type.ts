import type { ForgottenMediaDto } from "./forgottenMediaDto.type.ts";

// Les médias oubliés, ceux reliés à TMDB d'abord, par titre, puis les dossiers par chemin
export type ForgottenMediaListDto = {
	forgottenMedia: ForgottenMediaDto[];
};
