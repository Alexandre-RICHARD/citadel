import type { UserGameListDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameListDto.type";
import type { InfiniteData } from "@tanstack/react-query";

// Une vue du tableau en cache : ses pages chargées ; une page vide (204) vaut null
export type UserGameListData = InfiniteData<UserGameListDto | null, number>;
