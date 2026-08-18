import { Flame } from "lucide-react";

import { GameCard } from "./components/GameCard/GameCard";
import { Header } from "./components/Header/Header";
import styles from "./gameDeathCounterHomepage.module.scss";
import { useGameDeathCounterHomepage } from "./useGameDeathCounterHomepage";

export function GameDeathCounterHomepage() {
	const {
		submitNewGame,
		grandTotal,
		games,
		expandedGameIds,
		expandedBossIds,
		toggleGameExpand,
		toggleBossExpand,
		onUpdateGame,
		onDeleteGame,
		onToggleFinished,
		onAddBoss,
		onUpdateBoss,
		onDeleteBoss,
		onToggleDefeated,
		onAddDeath,
		onUpdateDeath,
		onDeleteDeath,
	} = useGameDeathCounterHomepage();

	return (
		<>
			<Header
				submitNewGame={submitNewGame}
				grandTotal={grandTotal}
			/>
			{games.length === 0 ? (
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
			) : (
				<ul className={styles.gameList}>
					{games.map((game) => (
						<GameCard
							key={game.id}
							game={game}
							expanded={expandedGameIds.has(game.id)}
							onToggleExpand={() => toggleGameExpand(game.id)}
							expandedBossIds={expandedBossIds}
							onToggleBossExpand={toggleBossExpand}
							onUpdateGame={onUpdateGame}
							onDeleteGame={onDeleteGame}
							onToggleFinished={onToggleFinished}
							onAddBoss={onAddBoss}
							onUpdateBoss={onUpdateBoss}
							onDeleteBoss={onDeleteBoss}
							onToggleDefeated={onToggleDefeated}
							onAddDeath={onAddDeath}
							onUpdateDeath={onUpdateDeath}
							onDeleteDeath={onDeleteDeath}
						/>
					))}
				</ul>
			)}
		</>
	);
}
