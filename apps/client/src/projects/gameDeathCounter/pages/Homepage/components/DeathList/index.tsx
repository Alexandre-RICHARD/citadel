import type { DeathFm } from "../../../../api/model/deathFm.type";
import globalStyles from "../../../../globalStyles.module.scss";
import { DeathRow } from "../DeathRow";
import styles from "./deathList.module.scss";

type Props = {
	gameId: number;
	bossId: number;
	deaths: DeathFm[];
};

export function DeathList({ gameId, bossId, deaths }: Props) {
	if (deaths.length === 0)
		return (
			<p className={globalStyles.emptyHint}>
				Aucune tentative enregistrée. Le bouton + ajoute la première mort.
			</p>
		);

	return (
		<ul className={styles.deathList}>
			{deaths.map((death) => (
				<DeathRow
					key={death.id}
					gameId={gameId}
					bossId={bossId}
					death={death}
				/>
			))}
		</ul>
	);
}
