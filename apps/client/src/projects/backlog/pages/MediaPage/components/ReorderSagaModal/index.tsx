import { ListOrdered } from "lucide-react";

import { useReorderSaga } from "../../../../api/media/useReorderSaga";
import { useSagaEntries } from "../../../../api/media/useSagaEntries";
import { Modal } from "../../../../components/Modal";
import { useIsFreshOnce } from "../../../../hooks/useIsFreshOnce";
import { LoadingState } from "../../../Homepage/components/LoadingState";
import { ModalActions } from "../../../Homepage/components/ModalActions";
import { SeriesOrderForm } from "../../../Homepage/components/SeriesOrderForm";

type Props = {
	sagaId: number;
	sagaName: string;
	// Le média d'où le menu a été ouvert, mis en valeur
	userMediaId: number;
	onClose: () => void;
};

/**
 * « Réorganiser la saga » : le formulaire de « Réorganiser la série » des jeux, mêmes règles de numéros. Les médias de la
 * saga se lisent à l'ouverture ; le titre français en premier, le titre original dessous quand il diffère
 */
export function ReorderSagaModal({
	sagaId,
	sagaName,
	userMediaId,
	onClose,
}: Props) {
	const { entries, error, isStale } = useSagaEntries(sagaId);
	const isFresh = useIsFreshOnce({ data: entries ?? undefined, isStale });
	const reorderSaga = useReorderSaga(sagaId);

	if (entries === null || !isFresh)
		return (
			<Modal
				title="Réorganiser la saga"
				subtitle={sagaName}
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
					actionLabel="charger la saga"
				>
					Chargement de la saga…
				</LoadingState>
			</Modal>
		);
	return (
		<SeriesOrderForm
			title="Réorganiser la saga"
			subtitle={sagaName}
			itemLabel="média"
			gameId={userMediaId}
			storedEntries={entries.map((entry) => ({
				gameId: entry.userMediaId,
				seriesNumber: entry.sagaNumber,
				// Le formulaire affiche `frenchName ?? name`, puis `name` dessous quand `frenchName` existe
				name: entry.originalTitle ?? entry.title,
				frenchName: entry.originalTitle === null ? null : entry.title,
				firstReleaseDate: entry.releaseDate,
			}))}
			onValidate={(nextEntries) =>
				reorderSaga.mutate({
					entries: nextEntries.map(({ gameId, seriesNumber }) => ({
						userMediaId: gameId,
						sagaNumber: seriesNumber,
					})),
				})
			}
			onClose={onClose}
		/>
	);
}
