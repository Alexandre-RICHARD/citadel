import type { StoredGameListDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameListDto.type";
import type { InfiniteData } from "@tanstack/react-query";

// Une liste de « Ajouter un jeu depuis la Citadel » en cache : ses pages chargées ; une page vide (204) vaut null
export type StoredGameListData = InfiniteData<StoredGameListDto | null, number>;
