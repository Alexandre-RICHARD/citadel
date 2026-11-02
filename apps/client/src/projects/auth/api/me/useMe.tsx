import { useQuery } from "@tanstack/react-query";

import { fromMeDtoToMeFm } from "../model/fromMeDtoToMeFm";
import type { MeFm } from "../model/meFm.type";
import { meQueryOptions } from "./meQueryOptions";

function toMeFm(me: Parameters<typeof fromMeDtoToMeFm>[0] | null): MeFm | null {
	return me === null ? null : fromMeDtoToMeFm(me);
}

/**
 * Le compte connecté, sans suspension : chaque page décide quoi montrer pendant la lecture. undefined : pas encore
 * connu (ou serveur injoignable) ; null : personne n'est connecté
 */
export function useMe(): MeFm | null | undefined {
	return useQuery({ ...meQueryOptions, select: toMeFm }).data;
}
