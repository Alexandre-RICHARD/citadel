import type { UserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaListDto.type";
import type { InfiniteData } from "@tanstack/react-query";

// Une vue du tableau des films et séries en cache : ses pages chargées ; un backlog vide (204) vaut null
export type UserMediaListData = InfiniteData<UserMediaListDto | null, number>;
