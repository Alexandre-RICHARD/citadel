import { Op, type WhereOptions } from "sequelize";

import type { Series } from "../../models/Series.ts";

// Les séries qu'un compte voit et peut choisir : celles d'IGDB, communes à tous, et celles qu'il a créées
export function visibleSeries(userId: number): WhereOptions<Series> {
	return { [Op.or]: [{ userId: null }, { userId }] };
}
