import { z } from "zod";

/**
 * Un tracker et ses torrents, par état. `isReachable` : au moins une de ses adresses fonctionne sur au moins un torrent ;
 * sinon ses torrents sont inactifs, revus au passage suivant, jamais déclarés morts (§8, étape 2)
 */
export const reportTrackerSchema = z.object({
	name: z.string().min(1),
	isReachable: z.boolean(),
	torrentCount: z.number().int().nonnegative(),
	validCount: z.number().int().nonnegative(),
	deadCount: z.number().int().nonnegative(),
	inactiveCount: z.number().int().nonnegative(),
});
