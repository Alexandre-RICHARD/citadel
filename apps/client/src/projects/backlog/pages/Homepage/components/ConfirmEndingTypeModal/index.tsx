import { Palette } from "lucide-react";

import { useCustomizeUserGame } from "../../../../api/userGame/useCustomizeUserGame";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { noEndingTypeLabel } from "../../../../helper/label/noEndingTypeLabel";
import type { CustomizationDraft } from "../../../../helper/series/customizationDraft.type";

type Props = {
	gameId: number;
	gameName: string;
	// La personnalisation du jeu, avec le nouveau type de fin
	customization: CustomizationDraft;
	convertedStatusCount: number;
	onClose: () => void;
};

// Changer le type de fin depuis le tableau, quand des statuts en sont convertis : il se confirme
export function ConfirmEndingTypeModal({
	gameId,
	gameName,
	customization,
	convertedStatusCount,
	onClose,
}: Props) {
	const customizeUserGame = useCustomizeUserGame(gameId);
	const isPlural = convertedStatusCount > 1;

	return (
		<Modal
			title="Changer le type de fin"
			subtitle={gameName}
			icon={Palette}
			size="sm"
			actions={
				<>
					<Button onClick={onClose}>Annuler</Button>
					<Button
						variant="primary"
						onClick={() => {
							customizeUserGame.mutate(customization);
							onClose();
						}}
					>
						Changer
					</Button>
				</>
			}
			onClose={onClose}
		>
			<p className={styles.modalQuestion}>
				«{" "}
				{customization.endingType === null
					? noEndingTypeLabel.label
					: endingTypeLabels[customization.endingType].label}{" "}
				» ne permet pas{" "}
				{isPlural
					? `${convertedStatusCount} des statuts de ce jeu`
					: "un des statuts de ce jeu"}
				, {isPlural ? "qui seront convertis" : "qui sera converti"} : Fini ↔
				Estimé fini, Vu sans jouer → Pas commencé.
			</p>
		</Modal>
	);
}
