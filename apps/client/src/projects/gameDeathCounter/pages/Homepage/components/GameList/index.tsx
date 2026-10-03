import { Flame } from "lucide-react";

import type { GameSummaryFm } from "../../../../api/model/gameSummaryFm.type";
import { GameCard } from "../GameCard";
import styles from "./gameList.module.scss";

type Props = {
	games: GameSummaryFm[];
};

export function GameList({ games }: Props) {
	if (games.length === 0)
		return (
			<div className={styles.emptyState}>
				<Flame
					size={34}
					className={styles.flame}
				/>
				<h2>Aucun jeu enregistré</h2>
				<p>
					Ajoutez votre premier bûcher pour commencer à consigner vos trépas.
				</p>
			</div>
		);

	return (
		<ul className={styles.gameList}>
			{games.map((game) => (
				<GameCard
					key={game.id}
					game={game}
				/>
			))}
		</ul>
	);
}
