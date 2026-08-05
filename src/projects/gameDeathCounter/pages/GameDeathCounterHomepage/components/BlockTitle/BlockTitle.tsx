import globalStyles from "../../../../globalStyles.module.scss";
import { formatDate } from "../../formatDate";
import styles from "./blockTitle.module.scss";

type Props = {
	editing: boolean;
	draftName: string;
	setDraftName: (newName: string) => void;
	onToggleExpand: () => void;
	element: {
		name: string;
		startedAt: string | null;
		endedAt: string | null;
	};
};

export function BlockTitle({
	editing,
	draftName,
	setDraftName,
	onToggleExpand,
	element,
}: Props) {
	return (
		<div className={styles.nameAndMetaBlock}>
			{editing ? (
				<input
					type="text"
					value={draftName}
					onChange={(e) => setDraftName(e.target.value)}
					className={`${globalStyles.fieldInput} ${globalStyles.fieldInputInlineTitle} ${globalStyles.fieldInputGame}`}
					autoFocus
				/>
			) : (
				<button
					type="button"
					className={styles.name}
					onClick={onToggleExpand}
				>
					{element.name}
				</button>
			)}
			<span className={styles.meta}>
				{Boolean(element.startedAt) && (
					<>Débuté le {formatDate(element.startedAt)}</>
				)}
				{Boolean(element.endedAt) && (
					<> · terminé le {formatDate(element.endedAt)}</>
				)}
			</span>
		</div>
	);
}
