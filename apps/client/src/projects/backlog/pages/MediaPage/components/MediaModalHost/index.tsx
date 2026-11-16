import type { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";

import type { ColumnSetting } from "../../../../helper/view/columnSetting.type";
import { mediaTable } from "../../../../helper/view/mediaTable";
import { ColumnsModal } from "../../../Homepage/components/ColumnsModal";
import type { MediaModal } from "../../mediaModal.type";
import { AddMediaModal } from "../AddMediaModal";
import { ConfirmMediaRemovalModal } from "../ConfirmMediaRemovalModal";
import { ConfirmWatchedModal } from "../ConfirmWatchedModal";
import { CustomizeMediaModal } from "../CustomizeMediaModal";
import { ImportMediaModal } from "../ImportMediaModal";
import { ReorderSagaModal } from "../ReorderSagaModal";
import { ShowUpdatesModal } from "../ShowUpdatesModal";

type Props = {
	modal: MediaModal;
	columns: ColumnSetting<MediaColumnEnum>[];
	onClose: () => void;
	onToggleColumn: (key: MediaColumnEnum) => void;
	onMoveColumn: (key: MediaColumnEnum, offset: -1 | 1) => void;
};

// La modale ouverte du backlog des films et séries ; chacune a sa propre fenêtre (key) : défilement, focus et saisie repartent de zéro
export function MediaModalHost({
	modal,
	columns,
	onClose,
	onToggleColumn,
	onMoveColumn,
}: Props) {
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
		case "importList":
			return <ImportMediaModal onClose={onClose} />;
		case "showUpdates":
			return <ShowUpdatesModal onClose={onClose} />;
		case "editColumns":
			return (
				<ColumnsModal
					table={mediaTable}
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
