import { Trash2 } from "lucide-react";

import { useDeleteUserGame } from "../../../../api/userGame/useDeleteUserGame";
import { useDeleteUserVersion } from "../../../../api/userVersion/useDeleteUserVersion";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";

type Props = {
	gameId: number;
	// null : tout le jeu quitte le backlog
	userVersionId: number | null;
	gameName: string;
	platformName: string | null;
	userVersionCount: number;
	onClose: () => void;
};

// Ce que le retrait emporte : sans annulation possible, il se confirme
function describeRemoval({
	userVersionId,
	gameName,
	platformName,
	userVersionCount,
}: Omit<Props, "gameId" | "onClose">): string {
	if (userVersionId === null)
		return `« ${gameName} » quitte le backlog avec ${userVersionCount > 1 ? `ses ${userVersionCount} versions jouées` : "sa version jouée"} et sa personnalisation. Le jeu reste en base.`;
	const removal = `La version jouée sur ${platformName ?? "cette plateforme"} et ses données (statut, temps, note…) seront supprimées.`;
	return userVersionCount > 1
		? removal
		: `${removal} C’est la dernière : « ${gameName} » quitte le backlog.`;
}

// « Retirer le jeu du backlog » et « Retirer la version jouée » (cahier des charges, §9)
export function ConfirmRemovalModal({
	gameId,
	userVersionId,
	onClose,
	...removal
}: Props) {
	const deleteUserGame = useDeleteUserGame(gameId);
	const deleteUserVersion = useDeleteUserVersion(gameId, userVersionId ?? 0);
	const isWholeGame = userVersionId === null;

	return (
		<Modal
			title={isWholeGame ? "Retirer du backlog" : "Retirer la version jouée"}
			subtitle={removal.gameName}
			icon={Trash2}
			size="sm"
			actions={
				<>
					<Button onClick={onClose}>Annuler</Button>
					<Button
						variant="danger"
						icon={Trash2}
						onClick={() => {
							if (isWholeGame) deleteUserGame.mutate();
							else deleteUserVersion.mutate();
							onClose();
						}}
					>
						Retirer
					</Button>
				</>
			}
			onClose={onClose}
		>
			<p className={styles.modalQuestion}>
				{describeRemoval({ userVersionId, ...removal })}
			</p>
		</Modal>
	);
}
