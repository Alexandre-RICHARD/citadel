import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";

import type { ColumnSetting } from "../../../../helper/view/columnSetting.type";
import { ColumnsModal } from "../../../Homepage/components/ColumnsModal";
import type { MediaModal } from "../../mediaModal.type";
import { useMediaMode } from "../../useMediaMode";
import { AddMediaModal } from "../AddMediaModal";
import { ConfirmMediaRemovalModal } from "../ConfirmMediaRemovalModal";
import { ConfirmVerifiedModal } from "../ConfirmVerifiedModal";
import { ConfirmWatchedModal } from "../ConfirmWatchedModal";
import { CustomizeMediaModal } from "../CustomizeMediaModal";
import { ImportMediaModal } from "../ImportMediaModal";
import { ReorderSagaModal } from "../ReorderSagaModal";
import { ShowUpdatesModal } from "../ShowUpdatesModal";
import { UnlockNasModal } from "../UnlockNasModal";

type Props = {
	modal: MediaModal;
	columns: ColumnSetting<ConnectedMediaColumn>[];
	onClose: () => void;
	onToggleColumn: (key: ConnectedMediaColumn) => void;
	onMoveColumn: (key: ConnectedMediaColumn, offset: -1 | 1) => void;
};

// La modale ouverte du backlog des films et séries ; chacune a sa propre fenêtre (key) : défilement, focus et saisie repartent de zéro
export function MediaModalHost({
	modal,
	columns,
	onClose,
	onToggleColumn,
	onMoveColumn,
}: Props) {
	const { table } = useMediaMode();
	switch (modal.kind) {
		case "addMedia":
			return (
				<AddMediaModal
					key={`${modal.mediaType}-${modal.tmdbId}`}
					mediaType={modal.mediaType}
					tmdbId={modal.tmdbId}
					onClose={onClose}
				/>
			);
		case "customizeMedia":
			return (
				<CustomizeMediaModal
					row={modal.row}
					onClose={onClose}
				/>
			);
		case "reorderSaga":
			return (
				<ReorderSagaModal
					sagaId={modal.sagaId}
					sagaName={modal.sagaName}
					userMediaId={modal.userMediaId}
					onClose={onClose}
				/>
			);
		case "confirmRemoval":
			return (
				<ConfirmMediaRemovalModal
					row={modal.row}
					onClose={onClose}
				/>
			);
		case "confirmWatched":
			return (
				<ConfirmWatchedModal
					userMediaId={modal.userMediaId}
					title={modal.title}
					subject={modal.subject}
					plan={modal.plan}
					onClose={onClose}
				/>
			);
		case "confirmVerified":
			return (
				<ConfirmVerifiedModal
					userMediaId={modal.userMediaId}
					title={modal.title}
					subject={modal.subject}
					plan={modal.plan}
					onClose={onClose}
				/>
			);
		case "unlockNas":
			return <UnlockNasModal onClose={onClose} />;
		case "importList":
			return <ImportMediaModal onClose={onClose} />;
		case "showUpdates":
			return <ShowUpdatesModal onClose={onClose} />;
		case "editColumns":
			return (
				<ColumnsModal
					table={table}
					columns={columns}
					onToggleVisibility={onToggleColumn}
					onMove={onMoveColumn}
					onClose={onClose}
				/>
			);
		default:
			return null;
	}
}
