import { Puzzle } from "lucide-react";
import { useState } from "react";

import { useImportGameContent } from "../../../../api/game/useImportGameContent";
import { useGamePreview } from "../../../../api/igdb/useGamePreview";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Checkbox } from "../../../../components/Checkbox";
import { Modal } from "../../../../components/Modal";
import { toggleId } from "../../../../helper/list/toggleId";
import { LoadingState } from "../LoadingState";
import { ModalActions } from "../ModalActions";

type Props = {
	gameId: number;
	gameName: string;
	onClose: () => void;
};

// « Rechercher d'autres DLC » (cahier des charges, §9) : tous les DLC IGDB du jeu, ceux en base cochés d'office
export function AddDlcsModal({ gameId, gameName, onClose }: Props) {
	const preview = useGamePreview(gameId);
	const [dlcIds, setDlcIds] = useState<number[]>([]);
	const importGameContent = useImportGameContent(gameId);
	const dlcs = preview.data?.dlcs;

	return (
		<Modal
			title="Rechercher d’autres DLC"
			subtitle={gameName}
			icon={Puzzle}
			actions={
				<ModalActions
					canValidate={dlcIds.length > 0}
					onCancel={onClose}
					onValidate={() => {
						importGameContent.mutate({ versionIds: [], dlcIds });
						onClose();
					}}
				/>
			}
			onClose={onClose}
		>
			{dlcs === undefined && (
				<LoadingState
					error={preview.error}
					actionLabel="charger les DLC depuis IGDB"
				>
					Chargement des DLC IGDB…
				</LoadingState>
			)}
			{dlcs?.length === 0 && (
				<p className={styles.emptyHint}>Aucun DLC sur IGDB</p>
			)}
			{dlcs !== undefined && dlcs.length > 0 && (
				<div className={styles.formStack}>
					<Callout>
						Les DLC cochés rejoignent le jeu : ils s’ajoutent à la liste des DLC
						de toutes ses versions jouées.
					</Callout>
					<ul className={styles.choiceList}>
						{dlcs.map(({ id, name, isStored }) => (
							<li
								key={id}
								className={styles.choiceItem}
							>
								<Checkbox
									checked={isStored || dlcIds.includes(id)}
									disabled={isStored}
									tooltip={isStored ? "Déjà en base" : null}
									label={name}
									onChange={() => setDlcIds(toggleId(dlcIds, id))}
								/>
							</li>
						))}
					</ul>
				</div>
			)}
		</Modal>
	);
}
