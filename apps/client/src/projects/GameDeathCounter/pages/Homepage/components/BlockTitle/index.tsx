import { useEffect, useRef } from "react";

import { formatDate } from "../../../../../../common/helpers/date/formatDateBis.ts";
import globalStyles from "../../../../globalStyles.module.scss";
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
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (editing) {
			inputRef.current?.focus();
		}
	}, [editing]);

	return (
		<div className={styles.nameAndMetaBlock}>
			{editing ? (
				<input
					ref={inputRef}
					type="text"
					value={draftName}
					onChange={(e) => setDraftName(e.target.value)}
					className={`${globalStyles.fieldInput} ${globalStyles.fieldInputInlineTitle} ${globalStyles.fieldInputGame}`}
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
