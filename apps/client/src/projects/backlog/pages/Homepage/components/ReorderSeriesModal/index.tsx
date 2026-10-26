import { ListOrdered } from "lucide-react";

import { useAllSeries } from "../../../../api/series/useAllSeries";
import { useSeriesEntries } from "../../../../api/series/useSeriesEntries";
import { Modal } from "../../../../components/Modal";
import { useIsFreshOnce } from "../../../../hooks/useIsFreshOnce";
import { LoadingState } from "../LoadingState";
import { ModalActions } from "../ModalActions";
import { ReorderSeriesForm } from "../ReorderSeriesForm";

type Props = {
	seriesId: number;
	// Le jeu d'où le menu a été ouvert, mis en valeur
	gameId: number;
	onClose: () => void;
};

// « Réorganiser la série » (cahier des charges, §8) : ses jeux du backlog se lisent à l'ouverture
export function ReorderSeriesModal({ seriesId, gameId, onClose }: Props) {
	const { entries, error, isStale } = useSeriesEntries(seriesId);
	const isFresh = useIsFreshOnce({ data: entries ?? undefined, isStale });
	const seriesName =
		useAllSeries().find(({ id }) => id === seriesId)?.name ?? "Série";

	if (entries === null || !isFresh)
		return (
			<Modal
				title="Réorganiser la série"
				subtitle={seriesName}
				icon={ListOrdered}
				actions={
					<ModalActions
						canValidate={false}
						onCancel={onClose}
						onValidate={onClose}
					/>
				}
				onClose={onClose}
			>
				<LoadingState
					error={error}
					actionLabel="charger la série"
				>
					Chargement de la série…
				</LoadingState>
			</Modal>
		);
	return (
		<ReorderSeriesForm
			seriesId={seriesId}
			seriesName={seriesName}
			gameId={gameId}
			storedEntries={entries}
			onClose={onClose}
		/>
	);
}
