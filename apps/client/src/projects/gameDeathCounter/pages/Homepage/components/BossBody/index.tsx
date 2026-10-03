import { Skeleton } from "@citadel/design-system/src/atoms/Skeleton";
import { Suspense } from "react";

import { QueryErrorBoundary } from "../../../../../../react/QueryErrorBoundary";
import { useBoss } from "../../../../api/boss/useBoss";
import { gameDeathCounterErrorReasons } from "../../../../api/gameDeathCounterErrorReasons";
import { DeathList } from "../DeathList";
import { DEATH_LIST_PLACEHOLDER } from "../DeathList/deathListPlaceholder";
import styles from "./bossBody.module.scss";

type Props = {
	gameId: number;
	bossId: number;
};

function LoadedDeathList({ gameId, bossId }: Props) {
	const { deaths } = useBoss(bossId);
	return (
		<DeathList
			gameId={gameId}
			bossId={bossId}
			deaths={deaths}
		/>
	);
}

// Contenu d'un boss déplié : ses morts, chargées à la demande
export function BossBody({ gameId, bossId }: Props) {
	return (
		<div className={styles.bossBody}>
			<QueryErrorBoundary
				actionLabel="charger les morts"
				errorReasons={gameDeathCounterErrorReasons}
			>
				<Suspense
					fallback={
						<Skeleton label="Chargement des morts">
							<DeathList
								gameId={gameId}
								bossId={bossId}
								deaths={DEATH_LIST_PLACEHOLDER}
							/>
						</Skeleton>
					}
				>
					<LoadedDeathList
						gameId={gameId}
						bossId={bossId}
					/>
				</Suspense>
			</QueryErrorBoundary>
		</div>
	);
}
