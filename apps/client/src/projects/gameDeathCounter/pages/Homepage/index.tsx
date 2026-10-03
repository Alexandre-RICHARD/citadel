import { Skeleton } from "@citadel/design-system/src/atoms/Skeleton";
import { Suspense } from "react";

import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { useGameList } from "../../api/game/useGameList";
import { gameDeathCounterErrorReasons } from "../../api/gameDeathCounterErrorReasons";
import { GameList } from "./components/GameList";
import { GAME_LIST_PLACEHOLDER } from "./components/GameList/gameListPlaceholder";
import { Header } from "./components/Header";
import styles from "./homepage.module.scss";

function LoadedGameList() {
	const { games } = useGameList();
	return <GameList games={games} />;
}

export function Homepage() {
	return (
		<>
			<Header />
			<main className={styles.content}>
				<QueryErrorBoundary
					actionLabel="charger les jeux"
					errorReasons={gameDeathCounterErrorReasons}
				>
					<Suspense
						fallback={
							<Skeleton label="Chargement des jeux">
								<GameList games={GAME_LIST_PLACEHOLDER} />
							</Skeleton>
						}
					>
						<LoadedGameList />
					</Suspense>
				</QueryErrorBoundary>
			</main>
		</>
	);
}
