import type { BossSummaryFm } from "../../../../api/model/bossSummaryFm.type";
import globalStyles from "../../../../globalStyles.module.scss";
import { BossRow } from "../BossRow";
import styles from "./bossList.module.scss";

type Props = {
	gameId: number;
	bosses: BossSummaryFm[];
};

export function BossList({ gameId, bosses }: Props) {
	if (bosses.length === 0)
		return (
			<p className={globalStyles.emptyHint}>
				Aucun boss enregistré pour ce jeu.
			</p>
		);

	return (
		<ul className={styles.bossList}>
			{bosses.map((boss) => (
				<BossRow
					key={boss.id}
					gameId={gameId}
					boss={boss}
				/>
			))}
		</ul>
	);
}
